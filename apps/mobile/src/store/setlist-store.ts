import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { appStorage } from "../lib/storage";
import { formatFriendlyDate } from "../lib/dates";
import { softDeleteSetlistById } from "../features/setlists/setlist-soft-delete";
import type { Setlist, SetlistDraftItem } from "../types/domain";

interface SetlistState {
  setlists: Setlist[];
  createFromMessage: (lines: string[], songIds: string[]) => Setlist;
  createSetlist: (input: {
    title: string;
    serviceDate?: string;
    notes?: string;
    sourceText?: string;
    items: SetlistDraftItem[];
  }) => Setlist;
  linkItem: (setlistId: string, itemId: string, songId: string) => void;
  deleteSetlist: (id: string) => void;
}

function buildSetlist(input: {
  title: string;
  serviceDate?: string;
  notes?: string;
  sourceText?: string;
  items: SetlistDraftItem[];
}): Setlist {
  const id = `local-setlist-${Date.now()}`;
  const items = input.items.map((item, position) => ({
    id: `${id}-item-${position}`,
    setlistId: id,
    position,
    titleSnapshot: item.titleSnapshot,
    ...(item.songId ? { songId: item.songId } : {}),
    ...(item.selectedKey ? { selectedKey: item.selectedKey } : {}),
    ...(item.notes ? { notes: item.notes } : {}),
  }));
  return {
    id,
    title: input.title,
    dateLabel: formatFriendlyDate(input.serviceDate),
    time: "Por definir",
    location: "Local",
    songIds: items.flatMap((item) => (item.songId ? [item.songId] : [])),
    items,
    peopleCount: 1,
    ...(input.serviceDate ? { serviceDate: input.serviceDate } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.sourceText ? { sourceText: input.sourceText } : {}),
    syncStatus: "local",
  };
}

export const useSetlistStore = create<SetlistState>()(
  persist(
    (set) => ({
      setlists: [],
      createFromMessage: (lines, songIds) => {
        const created = buildSetlist({
          title: lines[0] || "Nuevo programa",
          sourceText: lines.join("\n"),
          items: lines.slice(1).map((titleSnapshot, index) => ({
            titleSnapshot,
            ...(songIds[index] ? { songId: songIds[index] } : {}),
          })),
        });
        set((state) => ({ setlists: [created, ...state.setlists] }));
        return created;
      },
      createSetlist: (input) => {
        const created = buildSetlist(input);
        set((state) => ({ setlists: [created, ...state.setlists] }));
        return created;
      },
      linkItem: (setlistId, itemId, songId) =>
        set((state) => ({
          setlists: state.setlists.map((setlist) => {
            if (setlist.id !== setlistId) return setlist;
            if (!setlist.items) return setlist;
            const items = setlist.items.map((item) =>
              item.id === itemId ? { ...item, songId } : item,
            );
            return {
              ...setlist,
              items,
              songIds: items.flatMap((item) => (item.songId ? [item.songId] : [])),
            };
          }),
        })),
      deleteSetlist: (id) =>
        set((state) => ({
          setlists: softDeleteSetlistById(state.setlists, id),
        })),
    }),
    {
      name: "aurelis:inactive:setlists",
      storage: createJSONStorage(() => appStorage),
      skipHydration: true,
    },
  ),
);
