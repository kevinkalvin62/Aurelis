import { supabase } from '@/lib/supabase';
import { useSongStore } from '@/store/song-store';
import type { MusicNotation, Song, SongContentType, Visibility } from '@/types/domain';

interface RemoteSongRow {
  id: string;
  title: string;
  artist: string;
  original_key: string | null;
  current_key: string | null;
  bpm: number | null;
  content_raw: string;
  content_type: SongContentType;
  notation: MusicNotation;
  visibility: Visibility;
  updated_at: string;
}

function payloadFor(song: Song, userId: string) {
  return {
    owner_user_id: userId,
    organization_id: song.organizationId ?? null,
    title: song.title,
    artist: song.artist,
    original_key: song.key,
    bpm: song.bpm,
    current_key: song.currentKey ?? song.key,
    content_raw: song.content,
    content_structured: { version: 1, type: song.contentType, notation: song.notation },
    content_type: song.contentType,
    notation: song.notation,
    visibility: song.organizationId ? 'organization' as const : song.visibility,
    updated_at: new Date().toISOString(),
  };
}

export async function syncSong(song: Song, userId: string): Promise<{ remoteId?: string; error?: string }> {
  const payload = payloadFor(song, userId);
  const query = song.remoteId
    ? supabase.from('songs').update(payload).eq('id', song.remoteId).select('id').single()
    : supabase.from('songs').insert(payload).select('id').single();
  const { data, error } = await query;
  if (error) return { error: error.message };
  return data?.id ? { remoteId: String(data.id) } : { error: 'Supabase no devolvió el identificador de la canción.' };
}

export async function syncLocalSongs(userId: string): Promise<void> {
  const state = useSongStore.getState();
  const localSongs = state.songs.filter((song) => song.syncStatus === 'local' || song.syncStatus === 'pending');
  for (const song of localSongs) {
    state.markSyncPending(song.id);
    const result = await syncSong(song, userId);
    if (result.remoteId) state.markSynced(song.id, result.remoteId);
  }
}

export async function pullRemoteSongs(userId: string): Promise<void> {
  const { data, error } = await supabase.from('songs').select('id,title,artist,original_key,current_key,bpm,content_raw,content_type,notation,visibility,updated_at').eq('owner_user_id', userId).is('organization_id', null).order('updated_at', { ascending: false });
  if (error || !data) return;
  const remoteSongs = (data as RemoteSongRow[]).map((row): Song => ({
    id: `remote-${row.id}`,
    remoteId: row.id,
    title: row.title,
    artist: row.artist,
    key: row.original_key ?? 'C',
    currentKey: row.current_key ?? row.original_key ?? 'C',
    bpm: row.bpm ?? 80,
    content: row.content_raw,
    ownerUserId: userId,
    contentType: row.content_type,
    notation: row.notation,
    visibility: row.visibility,
    updatedAt: new Date(row.updated_at).toLocaleDateString(),
    syncStatus: 'synced',
  }));
  useSongStore.getState().mergeRemoteSongs(remoteSongs);
}

export async function deleteRemoteSong(remoteId: string): Promise<string | null> {
  const { error } = await supabase.from('songs').delete().eq('id', remoteId);
  return error?.message ?? null;
}
