import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { setlists as demoSetlists } from '@/data/demo';
import { appStorage } from '@/lib/storage';
import type { Setlist } from '@/types/domain';

interface SetlistState {
  setlists: Setlist[];
  createFromMessage: (lines: string[], songIds: string[]) => Setlist;
}

export const useSetlistStore = create<SetlistState>()(persist(
  (set) => ({
    setlists: demoSetlists,
    createFromMessage: (lines, songIds) => {
      const created: Setlist = {
        id: `local-setlist-${Date.now()}`,
        title: lines[0] || 'Nuevo setlist',
        dateLabel: 'SIN FECHA',
        time: 'Por definir',
        location: 'Sin ubicación',
        songIds,
        peopleCount: 1,
      };
      set((state) => ({ setlists: [created, ...state.setlists] }));
      return created;
    },
  }),
  { name: 'aurelis-setlists-v1', storage: createJSONStorage(() => appStorage) },
));
