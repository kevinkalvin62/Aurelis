import type {
  MusicNotation,
  Song,
  SongContentType,
  Visibility,
} from "@/types/domain";

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
  visibility: Visibility;
  updated_at: string;
}

interface StructuredSongDocument {
  version: number;
  type: SongContentType;
  notation: MusicNotation;
  bpm: number;
  lines: string[];
}

const CONTENT_TYPES: SongContentType[] = [
  "lyrics_chords",
  "chords_only",
  "wind_notes",
];
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
  "id,user_id,organization_id,title,artist,original_key,current_key,content_raw,content_structured,visibility,updated_at";

export function structuredSongContent(song: Song): StructuredSongDocument[] {
  return [
    {
      version: 1,
      type: song.contentType,
      notation: song.notation,
      bpm: song.bpm,
      lines: song.content.split(/\r?\n/),
    },
  ];
}

export function songPayload(song: Song, userId: string) {
  const originalKey = normalizeSongKey(song.key) ?? "C";
  const currentKey =
    normalizeSongKey(song.currentKey ?? song.key) ?? originalKey;
  return {
    user_id: userId,
    organization_id: song.organizationId ?? null,
    title: song.title,
    artist: song.artist || null,
    original_key: originalKey,
    current_key: currentKey,
    content_raw: song.content,
    content_structured: structuredSongContent(song),
    visibility: song.organizationId
      ? ("organization" as const)
      : song.visibility,
    updated_at: new Date().toISOString(),
  };
}

export function normalizeSongKey(value?: string): string | null {
  const input = value?.trim().replace("♯", "#").replace("♭", "b");
  if (!input) return null;
  const latin = input.match(/^(DO|RE|MI|FA|SOL|LA|SI)([#b]?)$/i);
  if (latin) {
    const root = LATIN_ROOTS[latin[1]!.toUpperCase()];
    const accidental = latin[2] === "#" ? "#" : latin[2] ? "b" : "";
    const normalized = `${root}${accidental}`;
    return ALLOWED_KEYS.has(normalized) ? normalized : null;
  }
  const american = input.match(/^([A-G])([#b]?)$/i);
  if (!american) return null;
  const accidental = american[2] === "#" ? "#" : american[2] ? "b" : "";
  const normalized = `${american[1]!.toUpperCase()}${accidental}`;
  return ALLOWED_KEYS.has(normalized) ? normalized : null;
}

export function mapRemoteSong(row: RemoteSongRow): Song {
  const firstDocument = Array.isArray(row.content_structured)
    ? row.content_structured[0]
    : row.content_structured;
  const structured = isRecord(firstDocument) ? firstDocument : {};
  const contentType = CONTENT_TYPES.includes(structured.type as SongContentType)
    ? (structured.type as SongContentType)
    : "lyrics_chords";
  const notation = NOTATIONS.includes(structured.notation as MusicNotation)
    ? (structured.notation as MusicNotation)
    : "american";
  const bpmValue = Number(structured.bpm);
  return {
    id: `remote-${row.id}`,
    remoteId: String(row.id),
    ownerUserId: String(row.user_id),
    ...(row.organization_id
      ? { organizationId: String(row.organization_id) }
      : {}),
    title: String(row.title),
    artist: row.artist ? String(row.artist) : "",
    key: row.original_key ? String(row.original_key) : "C",
    currentKey: row.current_key ?? row.original_key ?? "C",
    bpm: Number.isFinite(bpmValue) && bpmValue > 0 ? bpmValue : 80,
    content: String(row.content_raw ?? ""),
    contentType,
    notation,
    visibility: row.visibility,
    updatedAt: new Date(row.updated_at).toLocaleDateString(),
    syncStatus: "synced",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
