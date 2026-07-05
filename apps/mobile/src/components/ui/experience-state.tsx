import type { ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { colors, spacing } from "@/constants/design";

type ExperienceStateKind = "empty" | "loading" | "error" | "offline" | "success";

interface ExperienceStateProps {
  kind: ExperienceStateKind;
  message: string;
  title?: string;
  action?: ReactNode;
  showIndicator?: boolean;
  style?: StyleProp<ViewStyle>;
  messageStyle?: StyleProp<TextStyle>;
}

export function ExperienceState({
  kind,
  message,
  title,
  action,
  showIndicator = false,
  style,
  messageStyle,
}: ExperienceStateProps) {
  const isLoading = kind === "loading";
  return (
    <View
      accessibilityRole={isLoading ? "progressbar" : kind === "error" ? "alert" : "text"}
      accessibilityLiveRegion={kind === "error" || kind === "success" ? "polite" : "none"}
      accessibilityLabel={title ? `${title}. ${message}` : message}
      style={[styles.container, style]}
    >
      {isLoading && showIndicator ? <ActivityIndicator color={colors.accent} /> : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={[styles.message, messageStyle]}>{message}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  title: { color: colors.text, fontSize: 14, fontWeight: "700", textAlign: "center" },
  message: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: "center" },
});
