import type { SetlistDraftItem, Song } from "@/types/domain";

export type SetlistCreationMode = "manual" | "import";

export interface SetlistDraftEntry extends SetlistDraftItem {
  clientId: string;
}

export function createDraftEntry(
  titleSnapshot: string,
  song?: Song,
  clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
): SetlistDraftEntry {
  return {
    clientId,
    titleSnapshot,
    ...(song
      ? {
          songId: song.id,
          selectedKey: song.currentKey ?? song.key,
        }
      : {}),
  };
}

export function moveDraftEntry(
  entries: SetlistDraftEntry[],
  clientId: string,
  delta: number,
): SetlistDraftEntry[] {
  const index = entries.findIndex((item) => item.clientId === clientId);
  const next = index + delta;
  if (index < 0 || next < 0 || next >= entries.length) return entries;
  const copy = [...entries];
  [copy[index], copy[next]] = [copy[next]!, copy[index]!];
  return copy;
}

export function toLocalSetlistItems(entries: SetlistDraftEntry[]): SetlistDraftItem[] {
  return entries.map(({ clientId: _clientId, ...entry }) => entry);
}

export function toRemoteSetlistItems(entries: SetlistDraftEntry[], songs: Song[]) {
  return entries.map((entry) => {
    const linkedSong = entry.songId ? songs.find((song) => song.id === entry.songId) : undefined;
    return {
      titleSnapshot: entry.titleSnapshot,
      ...(linkedSong?.remoteId ? { songId: linkedSong.remoteId } : {}),
      ...(entry.selectedKey ? { selectedKey: entry.selectedKey } : {}),
      ...(entry.notes ? { notes: entry.notes } : {}),
    };
  });
}
