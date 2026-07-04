import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "@/constants/design";
import { ToastHost } from "@/components/ui/toast-host";
import { useAppSession } from "@/features/auth/use-app-session";

export default function RootLayout() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );
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
  const { ready } = useAppSession();

  if (!ready)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="song/[id]" />
      <Stack.Screen name="editor" options={{ presentation: "modal" }} />
      <Stack.Screen name="auth" options={{ animation: "fade" }} />
      <Stack.Screen name="reset-password" options={{ animation: "fade" }} />
      <Stack.Screen name="organization/create" options={{ presentation: "modal" }} />
      <Stack.Screen name="organization/[id]" />
      <Stack.Screen name="setlist/create" options={{ presentation: "modal" }} />
      <Stack.Screen name="setlist/[id]" />
      <Stack.Screen name="material/editor" options={{ presentation: "modal" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
