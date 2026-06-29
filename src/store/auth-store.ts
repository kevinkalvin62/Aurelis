import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from '@/lib/storage';

export type AccessMode = 'guest' | 'authenticated' | null;

interface LocalUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  accessMode: AccessMode;
  user: LocalUser | null;
  hydrated: boolean;
  continueAsGuest: () => void;
  setAuthenticated: (user: LocalUser) => void;
  clearAccess: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(persist(
  (set) => ({
    accessMode: null,
    user: null,
    hydrated: false,
    continueAsGuest: () => set({ accessMode: 'guest', user: null }),
    setAuthenticated: (user) => set({ accessMode: 'authenticated', user }),
    clearAccess: () => set({ accessMode: null, user: null }),
    setHydrated: (hydrated) => set({ hydrated }),
  }),
  {
    name: 'aurelis-access-v1',
    storage: createJSONStorage(() => appStorage),
    partialize: ({ accessMode, user }) => ({ accessMode, user }),
    onRehydrateStorage: () => (state) => state?.setHydrated(true),
  },
));
