import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { colors, radii, touchTargets } from "@/constants/design";

interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function Chip({ label, onPress, selected = false, style, labelStyle }: ChipProps) {
  const content = <Text style={[styles.label, labelStyle]}>{label}</Text>;
  const chipStyle = [
    styles.chip,
    onPress && styles.interactive,
    selected && styles.selected,
    style,
  ];

  if (!onPress) return <View style={chipStyle}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      hitSlop={touchTargets.hitSlop}
      onPress={onPress}
      style={chipStyle}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
  },
  interactive: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { borderColor: colors.accent, backgroundColor: colors.surfaceSelected },
  label: { color: colors.textSecondary, fontSize: 9 },
});
