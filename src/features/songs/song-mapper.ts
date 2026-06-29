import type { MusicNotation, Song, SongContentType, Visibility } from '@/types/domain';

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

interface StructuredSongContent {
  version: number;
  type: SongContentType;
  notation: MusicNotation;
  bpm: number;
}

const CONTENT_TYPES: SongContentType[] = ['lyrics_chords', 'chords_only', 'wind_notes'];
const NOTATIONS: MusicNotation[] = ['american', 'latin'];

export const REMOTE_SONG_SELECT = 'id,user_id,organization_id,title,artist,original_key,current_key,content_raw,content_structured,visibility,updated_at';

export function structuredSongContent(song: Song): StructuredSongContent {
  return { version: 1, type: song.contentType, notation: song.notation, bpm: song.bpm };
}

export function songPayload(song: Song, userId: string) {
  return {
    user_id: userId,
    organization_id: song.organizationId ?? null,
    title: song.title,
    artist: song.artist || null,
    original_key: song.key,
    current_key: song.currentKey ?? song.key,
    content_raw: song.content,
    content_structured: structuredSongContent(song),
    visibility: song.organizationId ? 'organization' as const : song.visibility,
    updated_at: new Date().toISOString(),
  };
}

export function mapRemoteSong(row: RemoteSongRow): Song {
  const structured = isRecord(row.content_structured) ? row.content_structured : {};
  const contentType = CONTENT_TYPES.includes(structured.type as SongContentType) ? structured.type as SongContentType : 'lyrics_chords';
  const notation = NOTATIONS.includes(structured.notation as MusicNotation) ? structured.notation as MusicNotation : 'american';
  const bpmValue = Number(structured.bpm);
  return {
    id: `remote-${row.id}`,
    remoteId: String(row.id),
    ownerUserId: String(row.user_id),
    ...(row.organization_id ? { organizationId: String(row.organization_id) } : {}),
    title: String(row.title),
    artist: row.artist ? String(row.artist) : '',
    key: row.original_key ? String(row.original_key) : 'C',
    currentKey: row.current_key ?? row.original_key ?? 'C',
    bpm: Number.isFinite(bpmValue) && bpmValue > 0 ? bpmValue : 80,
    content: String(row.content_raw ?? ''),
    contentType,
    notation,
    visibility: row.visibility,
    updatedAt: new Date(row.updated_at).toLocaleDateString(),
    syncStatus: 'synced',
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
