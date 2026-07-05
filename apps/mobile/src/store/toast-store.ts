import { create } from "zustand";

export type ToastKind = "success" | "error" | "warning" | "info";
export interface ToastMessage {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastState {
  current: ToastMessage | null;
  show: (message: string, kind?: ToastKind) => void;
  dismiss: () => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  current: null,
  show: (message, kind = "info") => set({ current: { id: nextId++, kind, message } }),
  dismiss: () => set({ current: null }),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().show(message, "success"),
  error: (message: string) => useToastStore.getState().show(message, "error"),
  warning: (message: string) => useToastStore.getState().show(message, "warning"),
  info: (message: string) => useToastStore.getState().show(message, "info"),
};
