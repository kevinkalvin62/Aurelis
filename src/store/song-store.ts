import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from '@/lib/storage';
import type { Song } from '@/types/domain';

export type SongDraft = Omit<Song, 'id' | 'updatedAt' | 'remoteId' | 'syncStatus'>;

interface SongState {
  songs: Song[];
  saveSong: (draft: SongDraft, existingId?: string) => Song;
  markSyncPending: (id: string) => void;
  markSynced: (id: string, remoteId: string) => void;
  mergeRemoteSongs: (songs: Song[]) => void;
  deleteSong: (id: string) => void;
}

function newLocalId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useSongStore = create<SongState>()(persist(
  (set, get) => ({
    songs: [],
    saveSong: (draft, existingId) => {
      const previous = existingId ? get().songs.find((song) => song.id === existingId) : undefined;
      const saved: Song = {
        ...draft,
        id: previous?.id ?? newLocalId(),
        updatedAt: 'Ahora',
        syncStatus: 'local',
        ...(previous?.remoteId ? { remoteId: previous.remoteId } : {}),
      };
      set((state) => ({ songs: previous ? state.songs.map((song) => song.id === previous.id ? saved : song) : [saved, ...state.songs] }));
      return saved;
    },
    markSyncPending: (id) => set((state) => ({ songs: state.songs.map((song) => song.id === id ? { ...song, syncStatus: 'pending' } : song) })),
    markSynced: (id, remoteId) => set((state) => ({ songs: state.songs.map((song) => song.id === id ? { ...song, remoteId, syncStatus: 'synced' } : song) })),
    mergeRemoteSongs: (remoteSongs) => set((state) => {
      const remoteIds = new Set(remoteSongs.map((song) => song.remoteId));
      return { songs: [...remoteSongs, ...state.songs.filter((song) => !song.remoteId || !remoteIds.has(song.remoteId))] };
    }),
    deleteSong: (id) => set((state) => ({ songs: state.songs.filter((song) => song.id !== id) })),
  }),
  { name: 'aurelis:inactive:songs', storage: createJSONStorage(() => appStorage), skipHydration: true },
));
