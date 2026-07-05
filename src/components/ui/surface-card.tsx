import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radii } from "@/constants/design";

interface SurfaceCardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

export function SurfaceCard({ children, style }: SurfaceCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
});
