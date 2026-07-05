import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { ExperienceState } from "@/components/ui/experience-state";
import { ModalHeader } from "@/components/ui/modal-header";
import { colors, radii, spacing } from "@/constants/design";
import { suggestedInstrumentKey } from "@/features/organizations/instrument-material";
import {
  listInstruments,
  saveInstrumentMaterial,
} from "@/features/organizations/organization-service";
import { toast } from "@/store/toast-store";

export default function MaterialEditorScreen() {
  const {
    songId = "",
    songTitle = "Canción",
    songKey = "C",
  } = useLocalSearchParams<{
    organizationId: string;
    songId: string;
    songTitle?: string;
    songKey?: string;
  }>();
  const { data: instruments = [], isLoading } = useQuery({
    queryKey: ["instruments"],
    queryFn: listInstruments,
  });
  const [instrumentId, setInstrumentId] = useState("");
  const [key, setKey] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const instrument = instruments.find((item) => item.id === instrumentId) ?? instruments[0];

  useEffect(() => {
    if (!instrumentId && instruments[0]) {
      // The catalog arrives asynchronously; hydrate the editable selection once.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInstrumentId(instruments[0].id);
      setKey(suggestedInstrumentKey(songKey, instruments[0]));
    }
  }, [instrumentId, instruments, songKey]);

  const chooseInstrument = (instrumentOption: (typeof instruments)[number]) => {
    setInstrumentId(instrumentOption.id);
    setKey(suggestedInstrumentKey(songKey, instrumentOption));
  };

  const submit = async () => {
    if (!instrument) {
      toast.warning("No hay instrumentos disponibles.");
      return;
    }
    setSaving(true);
    const materialKey = key || suggestedInstrumentKey(songKey, instrument);
    const error = await saveInstrumentMaterial({
      songId,
      instrumentId: instrument.id,
      ...(materialKey ? { key: materialKey } : {}),
      ...(content ? { contentRaw: content } : {}),
      ...(notes ? { notes } : {}),
    });
    setSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Material de instrumento guardado.");
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ModalHeader
        title="Material"
        onCancel={() => router.back()}
        action={
          <Button
            compact
            label={saving ? "Guardando…" : "Guardar"}
            disabled={saving || !instrument}
            onPress={submit}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>MATERIAL POR INSTRUMENTO</Text>
        <Text style={styles.title}>{songTitle}</Text>
        <Text style={styles.label}>INSTRUMENTO FUENTE</Text>
        {isLoading ? (
          <ExperienceState
            kind="loading"
            message="Cargando instrumentos…"
            messageStyle={styles.empty}
          />
        ) : instruments.length ? (
          <View style={styles.options}>
            {instruments.map((option) => (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={`Instrumento fuente: ${option.name}`}
                accessibilityState={{ selected: instrument?.id === option.id }}
                onPress={() => chooseInstrument(option)}
                style={[styles.option, instrument?.id === option.id && styles.optionActive]}
              >
                <Text style={styles.optionText}>{option.name}</Text>
                <Text style={styles.optionKey}>{option.transpositionKey ?? "C"}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <ExperienceState
            kind="empty"
            message="No hay instrumentos registrados en Supabase."
            messageStyle={styles.empty}
          />
        )}
        <Text style={styles.label}>TONALIDAD ESCRITA</Text>
        <TextInput
          accessibilityLabel="Tonalidad escrita"
          value={key}
          onChangeText={setKey}
          placeholder={instrument ? suggestedInstrumentKey(songKey, instrument) : songKey}
          placeholderTextColor="#77706C"
          style={styles.input}
        />
        <Text style={styles.label}>NOTAS / SECUENCIA</Text>
        <TextInput
          accessibilityLabel="Notas o secuencia"
          multiline
          value={content}
          onChangeText={setContent}
          placeholder="Partitura textual, secuencia de notas o indicaciones"
          placeholderTextColor="#77706C"
          style={[styles.input, styles.contentInput]}
        />
        <Text style={styles.label}>INDICACIONES</Text>
        <TextInput
          accessibilityLabel="Indicaciones"
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholder="Notas para este instrumento"
          placeholderTextColor="#77706C"
          style={[styles.input, styles.notesInput]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    paddingBottom: 80,
    width: "100%",
    maxWidth: 650,
    alignSelf: "center",
  },
  eyebrow: { color: colors.accent, fontSize: 9, fontWeight: "900", letterSpacing: 1.4 },
  title: { color: colors.text, fontFamily: "serif", fontSize: 29, fontWeight: "600", marginTop: 8 },
  label: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginTop: 20,
    marginBottom: 8,
  },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  option: {
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionActive: { borderColor: colors.accent, backgroundColor: colors.surfaceSelected },
  optionText: { color: colors.text, fontSize: 10 },
  optionKey: { color: colors.accent, fontSize: 9, fontWeight: "800" },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  contentInput: {
    minHeight: 190,
    paddingTop: 14,
    textAlignVertical: "top",
    fontFamily: "monospace",
  },
  notesInput: { minHeight: 90, paddingTop: 14, textAlignVertical: "top" },
  empty: { color: colors.textSecondary, fontSize: 11 },
});
