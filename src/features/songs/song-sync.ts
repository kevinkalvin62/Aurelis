import { supabase } from "@/lib/supabase";
import { useSongStore } from "@/store/song-store";
import type { Song } from "@/types/domain";
import {
  mapRemoteSong,
  REMOTE_SONG_SELECT,
  songPayload,
  buildSongContentStructured,
  type RemoteSongRow,
} from "./song-mapper";

export async function syncSong(
  song: Song,
  userId: string,
): Promise<{ remoteId?: string; error?: string }> {
  const payload = songPayload(song, userId);
  const isNewSong = !song.remoteId;
  const query = song.remoteId
    ? supabase
        .from("songs")
        .update(payload)
        .eq("id", song.remoteId)
        .select("id")
        .single()
    : supabase.from("songs").insert(payload).select("id").single();
  const { data, error } = await query;
  if (error) return { error: error.message };
  if (!data?.id)
    return { error: "Supabase no devolvió el identificador de la canción." };

  const remoteId = String(data.id);
  const { data: latestVersion, error: versionLookupError } = await supabase
    .from("song_versions")
    .select("version")
    .eq("song_id", remoteId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (versionLookupError)
    return versionFailure(
      remoteId,
      isNewSong,
      `No fue posible calcular la versión: ${versionLookupError.message}`,
    );
  const nextVersion = Number(latestVersion?.version ?? 0) + 1;
  const normalizedKey = payload.current_key;
  const { error: versionError } = await supabase.from("song_versions").insert({
    song_id: remoteId,
    version: nextVersion,
    content_raw: song.content,
    content_structured: buildSongContentStructured({
      contentRaw: song.content,
      contentType: song.contentType,
      notation: song.notation,
      bpm: song.bpm,
    }),
    key: normalizedKey,
    source_instrument_name: song.sourceInstrumentName || "Concert",
    created_by: userId,
  });
  if (versionError)
    return versionFailure(
      remoteId,
      isNewSong,
      `No fue posible guardar la versión: ${versionError.message}`,
    );
  return { remoteId };
}

async function versionFailure(
  remoteId: string,
  removeIncompleteSong: boolean,
  error: string,
): Promise<{ error: string }> {
  if (removeIncompleteSong) {
    const { error: cleanupError } = await supabase
      .from("songs")
      .delete()
      .eq("id", remoteId);
    if (cleanupError)
      return {
        error: `${error} Tampoco fue posible retirar la canción incompleta: ${cleanupError.message}`,
      };
  }
  return { error };
}

export async function syncLocalSongs(userId: string): Promise<void> {
  const state = useSongStore.getState();
  const localSongs = state.songs.filter(
    (song) => song.syncStatus === "local" || song.syncStatus === "pending",
  );
  for (const song of localSongs) {
    state.markSyncPending(song.id);
    const result = await syncSong(song, userId);
    if (result.remoteId) state.markSynced(song.id, result.remoteId);
  }
}

export async function pullRemoteSongs(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("songs")
    .select(REMOTE_SONG_SELECT)
    .eq("user_id", userId)
    .is("organization_id", null)
    .order("updated_at", { ascending: false });
  if (error || !data) return;
  useSongStore
    .getState()
    .mergeRemoteSongs((data as RemoteSongRow[]).map(mapRemoteSong));
}

export async function deleteRemoteSong(
  remoteId: string,
): Promise<string | null> {
  const { error } = await supabase.rpc("soft_delete_song", {
    target_song: remoteId,
  });
  return error?.message ?? null;
}
