import type { MusicNotation, Song, SongContentType, Visibility } from "@/types/domain";
import type { Json } from "@/types/database.generated";

export interface RemoteSongRow {
  id: string;
  user_id: string;
  organization_id: string | null;
  title: string;
  artist: string | null;
  original_key: string | null;
  current_key: string | null;
  content_raw: string;
  content_structured: unknown;
  song_versions?: { version: number; source_instrument_name: string | null }[];
  visibility: Visibility;
  updated_at: string;
}

export interface SongStructuredContent {
  [key: string]: Json | undefined;
  schema_version: number;
  type: SongContentType;
  notation: MusicNotation;
  bpm: number | null;
  lines: Record<string, string>[];
}

const CONTENT_TYPES: SongContentType[] = ["lyrics_chords", "chords_only", "wind_notes"];
const NOTATIONS: MusicNotation[] = ["american", "latin"];
const ALLOWED_KEYS = new Set([
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
  "Cm",
  "C#m",
  "Dbm",
  "Dm",
  "D#m",
  "Ebm",
  "Em",
  "Fm",
  "F#m",
  "Gbm",
  "Gm",
  "G#m",
  "Abm",
  "Am",
  "A#m",
  "Bbm",
  "Bm",
]);
const LATIN_ROOTS: Record<string, string> = {
  DO: "C",
  RE: "D",
  MI: "E",
  FA: "F",
  SOL: "G",
  LA: "A",
  SI: "B",
};

export const REMOTE_SONG_SELECT =
  "id,user_id,organization_id,title,artist,original_key,current_key,content_raw,content_structured,visibility,updated_at,song_versions(version,source_instrument_name)";

export function buildSongContentStructured(input: {
  contentRaw: string;
  contentType: SongContentType;
  notation: MusicNotation;
  bpm?: number | null;
}): SongStructuredContent[] {
  if (!input.contentRaw) return [];
  return [
    {
      schema_version: 1,
      type: input.contentType,
      notation: input.notation,
      bpm: Number.isFinite(input.bpm) && Number(input.bpm) > 0 ? Number(input.bpm) : null,
      lines: structuredLines(input.contentRaw, input.contentType),
    },
  ];
}

function structuredLines(
  contentRaw: string,
  contentType: SongContentType,
): Record<string, string>[] {
  const lines = contentRaw.split(/\r?\n/);
  if (contentType === "lyrics_chords") {
    const result: Record<string, string>[] = [];
    for (let index = 0; index < lines.length; index += 2) {
      result.push({
        chord_line: lines[index] ?? "",
        lyric_line: lines[index + 1] ?? "",
      });
    }
    return result;
  }
  return lines.map((raw) => ({ raw }));
}

export function songPayload(song: Song, userId: string) {
  const originalKey = normalizeSongKey(song.key);
  const currentKey = normalizeSongKey(song.currentKey ?? song.key) ?? originalKey;
  return {
    user_id: userId,
    organization_id: song.organizationId ?? null,
    title: song.title,
    artist: song.artist || null,
    original_key: originalKey,
    current_key: currentKey,
    content_raw: song.content,
    content_structured: buildSongContentStructured({
      contentRaw: song.content,
      contentType: song.contentType,
      notation: song.notation,
      bpm: song.bpm,
    }),
    visibility: song.organizationId ? ("organization" as const) : song.visibility,
    updated_at: new Date().toISOString(),
  };
}

export function normalizeSongKey(value?: string): string | null {
  const input = value?.trim().replace(/[♯]/g, "#").replace(/[♭]/g, "b");
  if (!input) return null;
  const cleaned = input.replace(/\s+(major|mayor)$/i, "").replace(/\s+(minor|menor)$/i, "m");
  const latin = cleaned.match(/^(DO|RE|MI|FA|SOL|LA|SI)([#b]?)(m)?$/i);
  if (latin) {
    const root = LATIN_ROOTS[latin[1]!.toUpperCase()];
    const accidental = latin[2] === "#" ? "#" : latin[2] ? "b" : "";
    const normalized = `${root}${accidental}${latin[3] ? "m" : ""}`;
    return ALLOWED_KEYS.has(normalized) ? normalized : null;
  }
  const american = cleaned.match(/^([A-G])([#b]?)(m)?$/i);
  if (!american) return null;
  const accidental = american[2] === "#" ? "#" : american[2] ? "b" : "";
  const normalized = `${american[1]!.toUpperCase()}${accidental}${american[3] ? "m" : ""}`;
  return ALLOWED_KEYS.has(normalized) ? normalized : null;
}

export function mapRemoteSong(row: RemoteSongRow): Song {
  const document = Array.isArray(row.content_structured)
    ? row.content_structured[0]
    : row.content_structured;
  const structured = isRecord(document) ? document : {};
  const contentType = CONTENT_TYPES.includes(structured.type as SongContentType)
    ? (structured.type as SongContentType)
    : "lyrics_chords";
  const notation = NOTATIONS.includes(structured.notation as MusicNotation)
    ? (structured.notation as MusicNotation)
    : "american";
  const bpmValue = Number(structured.bpm);
  const latestVersion = [...(row.song_versions ?? [])].sort(
    (left, right) => right.version - left.version,
  )[0];
  return {
    id: `remote-${row.id}`,
    remoteId: String(row.id),
    ownerUserId: String(row.user_id),
    ...(row.organization_id ? { organizationId: String(row.organization_id) } : {}),
    title: String(row.title),
    artist: row.artist ? String(row.artist) : "",
    key: row.original_key ? String(row.original_key) : "C",
    currentKey: row.current_key ?? row.original_key ?? "C",
    bpm: Number.isFinite(bpmValue) && bpmValue > 0 ? bpmValue : 80,
    content: String(row.content_raw ?? ""),
    contentType,
    notation,
    sourceInstrumentName: latestVersion?.source_instrument_name || "Concert",
    visibility: row.visibility,
    updatedAt: new Date(row.updated_at).toLocaleDateString(),
    syncStatus: "synced",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
