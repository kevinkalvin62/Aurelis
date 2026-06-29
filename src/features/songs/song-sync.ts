import { supabase } from '@/lib/supabase';
import { useSongStore } from '@/store/song-store';
import type { Song } from '@/types/domain';
import { mapRemoteSong, REMOTE_SONG_SELECT, songPayload, structuredSongContent, type RemoteSongRow } from './song-mapper';

export async function syncSong(song: Song, userId: string): Promise<{ remoteId?: string; error?: string }> {
  const payload = songPayload(song, userId);
  const query = song.remoteId
    ? supabase.from('songs').update(payload).eq('id', song.remoteId).select('id').single()
    : supabase.from('songs').insert(payload).select('id').single();
  const { data, error } = await query;
  if (error) return { error: error.message };
  if (!data?.id) return { error: 'Supabase no devolvió el identificador de la canción.' };

  const remoteId = String(data.id);
  const { error: versionError } = await supabase.from('song_versions').insert({
    song_id: remoteId,
    content_raw: song.content,
    content_structured: structuredSongContent(song),
    key: song.currentKey ?? song.key,
    created_by: userId,
  });
  return versionError ? { remoteId, error: `La canción se guardó, pero no su versión: ${versionError.message}` } : { remoteId };
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
  const { data, error } = await supabase.from('songs').select(REMOTE_SONG_SELECT).eq('user_id', userId).is('organization_id', null).order('updated_at', { ascending: false });
  if (error || !data) return;
  useSongStore.getState().mergeRemoteSongs((data as RemoteSongRow[]).map(mapRemoteSong));
}

export async function deleteRemoteSong(remoteId: string): Promise<string | null> {
  const { error } = await supabase.from('songs').delete().eq('id', remoteId);
  return error?.message ?? null;
}
