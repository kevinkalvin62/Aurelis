import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from '@/lib/storage';
import type { Setlist } from '@/types/domain';

interface SetlistState {
  setlists: Setlist[];
  createFromMessage: (lines: string[], songIds: string[]) => Setlist;
  createSetlist: (input: { title: string; serviceDate?: string; notes?: string; sourceText?: string; songIds: string[] }) => Setlist;
  deleteSetlist: (id: string) => void;
}

function buildSetlist(input: { title: string; serviceDate?: string; notes?: string; sourceText?: string; songIds: string[] }): Setlist {
  return { id: `local-setlist-${Date.now()}`, title: input.title, dateLabel: input.serviceDate || 'SIN FECHA', time: 'Por definir', location: 'Local', songIds: input.songIds, peopleCount: 1, ...(input.serviceDate ? { serviceDate: input.serviceDate } : {}), ...(input.notes ? { notes: input.notes } : {}), ...(input.sourceText ? { sourceText: input.sourceText } : {}), syncStatus: 'local' };
}

export const useSetlistStore = create<SetlistState>()(persist(
  (set) => ({
    setlists: [],
    createFromMessage: (lines, songIds) => {
      const created = buildSetlist({ title: lines[0] || 'Nuevo setlist', sourceText: lines.join('\n'), songIds });
      set((state) => ({ setlists: [created, ...state.setlists] }));
      return created;
    },
    createSetlist: (input) => { const created = buildSetlist(input); set((state) => ({ setlists: [created, ...state.setlists] })); return created; },
    deleteSetlist: (id) => set((state) => ({ setlists: state.setlists.filter((setlist) => setlist.id !== id) })),
  }),
  { name: 'aurelis-setlists-v2', storage: createJSONStorage(() => appStorage) },
));
