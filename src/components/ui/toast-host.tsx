import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@/constants/design";
import { useToastStore, type ToastKind } from "@/store/toast-store";

const accents: Record<ToastKind, string> = {
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  info: colors.accent,
};
const labels: Record<ToastKind, string> = {
  success: "LISTO",
  error: "ERROR",
  warning: "ATENCIÓN",
  info: "AURELIS",
};

export function ToastHost() {
  const current = useToastStore((state) => state.current);
  const dismiss = useToastStore((state) => state.dismiss);
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(dismiss, 3800);
    return () => clearTimeout(timer);
  }, [current, dismiss]);
  if (!current) return null;
  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <Pressable accessibilityRole="alert" onPress={dismiss} style={styles.toast}>
        <View style={[styles.accent, { backgroundColor: accents[current.kind] }]} />
        <View style={styles.copy}>
          <Text style={[styles.label, { color: accents[current.kind] }]}>
            {labels[current.kind]}
          </Text>
          <Text style={styles.message}>{current.message}</Text>
        </View>
        <Text style={styles.close}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    zIndex: 9999,
    elevation: 9999,
    left: 16,
    right: 16,
    top: 54,
    alignItems: "center",
  },
  toast: {
    width: "100%",
    maxWidth: 520,
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#232323F7",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "#383838",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.42,
    shadowRadius: 20,
    elevation: 18,
  },
  accent: { alignSelf: "stretch", width: 4 },
  copy: { flex: 1, paddingHorizontal: 14, paddingVertical: 11 },
  label: { fontSize: 8, fontWeight: "900", letterSpacing: 1.5, marginBottom: 4 },
  message: { color: colors.text, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  close: { color: colors.textSecondary, fontSize: 22, paddingHorizontal: 15 },
});
