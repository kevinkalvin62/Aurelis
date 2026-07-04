import { create } from "zustand";

interface PlayerState {
  semitones: number;
  fontScale: number;
  presentationMode: boolean;
  setSemitones: (value: number) => void;
  changeFontScale: (delta: number) => void;
  togglePresentationMode: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  semitones: 0,
  fontScale: 1,
  presentationMode: false,
  setSemitones: (semitones) => set({ semitones }),
  changeFontScale: (delta) =>
    set((state) => ({ fontScale: Math.max(0.8, Math.min(1.6, state.fontScale + delta)) })),
  togglePresentationMode: () => set((state) => ({ presentationMode: !state.presentationMode })),
}));
