import { useState } from "react";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@/constants/design";
import { dateToISO, formatFriendlyDate, isoToDate } from "@/lib/dates";

interface DateFieldProps {
  value?: string;
  onChange: (value: string) => void;
}

export function DateField({ value, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false);

  const selectDate = (event: DateTimePickerEvent, selected?: Date) => {
    if (process.env.EXPO_OS === "android") setOpen(false);
    if (event.type === "set" && selected) onChange(dateToISO(selected));
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.field}
        accessibilityRole="button"
        accessibilityLabel="Seleccionar fecha"
      >
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value ? formatFriendlyDate(value) : "Seleccionar fecha"}
        </Text>
        <Text style={styles.calendar}>▦</Text>
      </Pressable>
      {open ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={isoToDate(value)}
            mode="date"
            display={process.env.EXPO_OS === "ios" ? "inline" : "default"}
            onChange={selectDate}
          />
          {process.env.EXPO_OS === "ios" ? (
            <Pressable onPress={() => setOpen(false)} style={styles.done}>
              <Text style={styles.doneText}>Listo</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {value ? (
        <Pressable onPress={() => onChange("")} style={styles.clear}>
          <Text style={styles.clearText}>Quitar fecha</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
  },
  value: { color: colors.text, fontSize: 13 },
  placeholder: { color: "#77706C" },
  calendar: { color: colors.accent, fontSize: 18 },
  pickerWrap: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  done: { alignSelf: "flex-end", paddingHorizontal: 12, paddingVertical: 8 },
  doneText: { color: colors.accent, fontSize: 12, fontWeight: "700" },
  clear: { alignSelf: "flex-start", paddingTop: 6 },
  clearText: { color: colors.textSecondary, fontSize: 9 },
});
