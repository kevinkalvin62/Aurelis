import '@/global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/constants/design';
import { ToastHost } from '@/components/ui/toast-host';
import { pullRemoteSongs, syncLocalSongs } from '@/features/songs/song-sync';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <AppGate />
          <ToastHost />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppGate() {
  const segments = useSegments();
  const { accessMode, hydrated, setAuthenticated, clearAccess } = useAuthStore();
  const [sessionChecked, setSessionChecked] = useState(false);
  const syncedUser = useRef<string | null>(null);

  useEffect(() => {
    const applySession = async (user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null) => {
      if (!user) {
        if (useAuthStore.getState().accessMode === 'authenticated') clearAccess();
        return;
      }
      const email = user.email ?? '';
      const metadataName = typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : undefined;
      setAuthenticated({ id: user.id, email, name: metadataName || email.split('@')[0] || 'Músico' });
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
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { void applySession(session?.user ?? null); });
    return () => listener.subscription.unsubscribe();
  }, [clearAccess, setAuthenticated]);

  useEffect(() => {
    if (!hydrated || !sessionChecked) return;
    if (!accessMode && segments[0] !== 'auth') router.replace('/auth');
  }, [accessMode, hydrated, segments, sessionChecked]);

  if (!hydrated || !sessionChecked) return <View style={styles.loading}><ActivityIndicator color={colors.accent} /></View>;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'fade_from_bottom' }}>
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="song/[id]" />
    <Stack.Screen name="editor" options={{ presentation: 'modal' }} />
    <Stack.Screen name="auth" options={{ animation: 'fade' }} />
  </Stack>;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background } });
