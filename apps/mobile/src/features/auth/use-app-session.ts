import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { router, useSegments } from "expo-router";
import { pullRemoteSongs, syncLocalSongs } from "@/features/songs/song-sync";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";
import { switchLocalDataScope } from "@/store/local-data-scope";
import { fetchProfile } from "./profile-service";

export function useAppSession(): { ready: boolean } {
  const segments = useSegments();
  const queryClient = useQueryClient();
  const { accessMode, hydrated, setAuthenticated, clearAccess } = useAuthStore();
  const [sessionChecked, setSessionChecked] = useState(false);
  const syncedUser = useRef<string | null>(null);

  useEffect(() => {
    const applySession = async (
      user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null,
    ) => {
      if (!user) {
        syncedUser.current = null;
        queryClient.clear();
        const currentMode = useAuthStore.getState().accessMode;
        await switchLocalDataScope(currentMode === "guest" ? "guest" : null);
        if (currentMode === "authenticated") clearAccess();
        return;
      }
      if (syncedUser.current !== user.id) {
        queryClient.clear();
        await switchLocalDataScope(`user:${user.id}`);
      }
      const email = user.email ?? "";
      const profile = await fetchProfile(user.id);
      const metadataName =
        typeof user.user_metadata?.display_name === "string"
          ? user.user_metadata.display_name
          : undefined;
      setAuthenticated({
        id: user.id,
        email,
        name: profile?.displayName || metadataName || email.split("@")[0] || "Músico",
      });
      if (syncedUser.current !== user.id) {
        syncedUser.current = user.id;
        await syncLocalSongs(user.id);
        await pullRemoteSongs(user.id);
      }
    };
    void supabase.auth.getSession().then(async ({ data }) => {
      await applySession(data.session?.user ?? null);
      setSessionChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [clearAccess, queryClient, setAuthenticated]);

  useEffect(() => {
    if (!hydrated || !sessionChecked) return;
    if (!accessMode && segments[0] !== "auth" && segments[0] !== "reset-password")
      router.replace("/auth");
  }, [accessMode, hydrated, segments, sessionChecked]);

  return { ready: hydrated && sessionChecked };
}
