import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, touchTargets } from "@/constants/design";

interface ModalHeaderProps {
  title: string;
  onCancel: () => void;
  action: ReactNode;
  cancelLabel?: string;
}

export function ModalHeader({
  title,
  onCancel,
  action,
  cancelLabel = "Cancelar",
}: ModalHeaderProps) {
  return (
    <View style={styles.container} accessibilityRole="header">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
        onPress={onCancel}
        hitSlop={touchTargets.hitSlop}
        style={styles.cancelButton}
      >
        <Text style={styles.cancel}>{cancelLabel}</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.action}>{action}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cancelButton: { minWidth: 72, minHeight: 44, justifyContent: "center" },
  cancel: { color: colors.textSecondary, fontSize: 13 },
  title: { color: colors.text, fontSize: 14, fontWeight: "700", textAlign: "center", flex: 1 },
  action: { minWidth: 72, alignItems: "flex-end" },
});
