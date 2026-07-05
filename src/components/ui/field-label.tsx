import type { PropsWithChildren } from "react";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";
import { colors, typography } from "@/constants/design";

interface FieldLabelProps extends PropsWithChildren {
  style?: StyleProp<TextStyle>;
}

export function FieldLabel({ children, style }: FieldLabelProps) {
  return (
    <Text accessibilityRole="text" style={[styles.label, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    ...typography.sectionLabel,
    marginTop: 18,
    marginBottom: 8,
  },
});
