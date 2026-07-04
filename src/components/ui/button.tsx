import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radii } from "@/constants/design";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  style?: ViewStyle;
  compact?: boolean;
  disabled?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  style,
  compact = false,
  disabled = false,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        compact && styles.compact,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[styles.label, variant === "primary" ? styles.primaryLabel : styles.secondaryLabel]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  compact: { minHeight: 38, paddingHorizontal: 14, borderRadius: radii.sm },
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: { backgroundColor: "transparent" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
  label: { fontSize: 14, fontWeight: "700", letterSpacing: 0.2 },
  primaryLabel: { color: colors.text },
  secondaryLabel: { color: colors.textSecondary },
});
