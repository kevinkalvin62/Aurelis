import { Controller, useForm } from "react-hook-form";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { colors, radii, spacing } from "@/constants/design";
import { SOURCE_INSTRUMENT_OPTIONS } from "@/features/music-engine/instruments";
import {
  songContentTypes,
  songEditorSamples,
  songNotations,
  type SongEditorValues,
} from "@/features/songs/song-editor-model";
import { useSongEditor } from "@/features/songs/use-song-editor";

export default function EditorScreen() {
  const { id, organizationId } = useLocalSearchParams<{
    id?: string;
    organizationId?: string;
  }>();
  const {
    control,
    formState: { errors, isDirty },
    canDelete,
    chooseContentType,
    chooseNotation,
    contentType,
    notation,
    remove,
    saved,
    saveMessage,
    saving,
    song,
    sourceInstrumentName,
    submit,
  } = useSongEditor(id, organizationId);

  const confirmDelete = () => {
    if (!song) return;
    Alert.alert(
      "Eliminar canción",
      `¿Quitar “${song.title}” del repertorio? Se conservará en el historial.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => void remove(),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancelar</Text>
        </Pressable>
        <Text style={styles.navTitle}>{song ? "Editar canción" : "Nueva canción"}</Text>
        <Button
          label={saving ? "Guardando…" : saved ? "Guardada" : "Guardar"}
          compact
          disabled={saving}
          onPress={submit}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>{isDirty ? "CAMBIOS SIN GUARDAR" : "EDITOR AURELIS"}</Text>
        <Field
          control={control}
          name="title"
          placeholder="Título de la canción"
          large
          error={Boolean(errors.title)}
        />
        <Field
          control={control}
          name="artist"
          placeholder="Artista o autor (opcional)"
          error={Boolean(errors.artist)}
        />

        <Text style={styles.label}>TIPO DE CONTENIDO</Text>
        <View style={styles.typeGrid}>
          {songContentTypes.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => chooseContentType(option.value)}
              style={[styles.typeCard, contentType === option.value && styles.typeCardActive]}
            >
              <Text
                style={[styles.typeMark, contentType === option.value && styles.typeTextActive]}
              >
                {option.mark}
              </Text>
              <Text
                style={[styles.typeLabel, contentType === option.value && styles.typeTextActive]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.optionsRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>NOTACIÓN</Text>
            <View style={styles.notationGroup}>
              {songNotations.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => chooseNotation(option.value)}
                  style={[styles.notation, notation === option.value && styles.notationActive]}
                >
                  <Text
                    style={[
                      styles.notationLabel,
                      notation === option.value && styles.typeTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.notationExample}>{option.example}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.keyBlock}>
            <Text style={styles.label}>TONALIDAD</Text>
            <Field
              control={control}
              name="key"
              placeholder={notation === "latin" ? "DO" : "C"}
              centered
              error={Boolean(errors.key)}
            />
          </View>
        </View>
        <Text style={styles.label}>¿PARA QUÉ INSTRUMENTO ESTÁ ESCRITO ESTE MATERIAL?</Text>
        <Controller
          control={control}
          name="sourceInstrumentName"
          render={({ field: { onChange } }) => (
            <View style={styles.instrumentOptions}>
              {SOURCE_INSTRUMENT_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => onChange(option)}
                  style={[
                    styles.instrumentOption,
                    sourceInstrumentName === option && styles.instrumentOptionActive,
                  ]}
                >
                  <Text style={styles.instrumentOptionText}>
                    {option === "Concert" ? "General / Concert" : option}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        />
        <Text style={styles.instrumentHelp}>
          Si estas notas ya están escritas para trompeta, selecciona Trompeta Bb para evitar doble
          transporte.
        </Text>
        {!organizationId && !song?.organizationId ? (
          <>
            <Text style={styles.label}>VISIBILIDAD</Text>
            <Controller
              control={control}
              name="visibility"
              render={({ field: { value, onChange } }) => (
                <View style={styles.visibilityRow}>
                  <Pressable
                    onPress={() => onChange("private")}
                    style={[styles.visibility, value === "private" && styles.visibilityActive]}
                  >
                    <Text style={styles.visibilityTitle}>Privada</Text>
                    <Text style={styles.visibilityCopy}>Sólo tú</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onChange("public")}
                    style={[styles.visibility, value === "public" && styles.visibilityActive]}
                  >
                    <Text style={styles.visibilityTitle}>Pública</Text>
                    <Text style={styles.visibilityCopy}>Usuarios con cuenta</Text>
                  </Pressable>
                </View>
              )}
            />
          </>
        ) : null}

        <View style={styles.help}>
          <Text style={styles.helpTitle}>
            {contentType === "lyrics_chords"
              ? "Formato estilo LaCuerda"
              : contentType === "chords_only"
                ? "Progresión armónica"
                : "Secuencia para instrumentos de viento"}
          </Text>
          <Text style={styles.helpCopy}>
            {contentType === "lyrics_chords"
              ? "Escribe los acordes en una línea y la letra debajo. Los espacios conservan la alineación exacta."
              : contentType === "chords_only"
                ? "Escribe acordes separados por espacios. Puedes usar inversiones, extensiones y compases."
                : "Escribe notas y conserva libremente articulaciones como /, -, . y #. Las palabras no se modifican."}
          </Text>
        </View>
        <Controller
          control={control}
          name="content"
          render={({ field: { value, onChange } }) => (
            <TextInput
              multiline
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={songEditorSamples[contentType][notation]}
              placeholderTextColor="#625D59"
              style={[styles.editor, errors.content && styles.error]}
              textAlignVertical="top"
            />
          )}
        />
        {saveMessage ? (
          <Text style={[styles.saveMessage, saved && styles.saveSuccess]}>{saveMessage}</Text>
        ) : null}
        <Text style={styles.counter}>
          Texto plano compatible · espacios preservados · transporte automático
        </Text>
        {canDelete ? (
          <Pressable onPress={confirmDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Retirar canción</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  control,
  name,
  placeholder,
  large,
  centered,
  error,
}: {
  control: ReturnType<typeof useForm<SongEditorValues>>["control"];
  name: "title" | "artist" | "key";
  placeholder: string;
  large?: boolean;
  centered?: boolean;
  error?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur } }) => (
        <TextInput
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor="#6E6864"
          style={[
            styles.input,
            large && styles.inputLarge,
            centered && { textAlign: "center" },
            error && styles.error,
          ]}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  nav: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cancel: { color: colors.textSecondary, fontSize: 13 },
  navTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 80,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginBottom: 14,
  },
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    color: colors.text,
    fontSize: 15,
    marginBottom: 8,
  },
  inputLarge: {
    height: 68,
    fontFamily: "serif",
    fontSize: 30,
    fontWeight: "600",
  },
  error: { borderColor: colors.error },
  label: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginTop: 18,
    marginBottom: 10,
  },
  typeGrid: { flexDirection: "row", gap: 8 },
  typeCard: {
    flex: 1,
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  typeCardActive: { borderColor: colors.accent, backgroundColor: "#281A1D" },
  typeMark: { color: colors.textSecondary, fontSize: 18, fontWeight: "700" },
  typeLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
    marginTop: 7,
    textAlign: "center",
  },
  typeTextActive: { color: colors.text },
  optionsRow: { flexDirection: "row", gap: 16, alignItems: "flex-end" },
  notationGroup: {
    flexDirection: "row",
    padding: 3,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notation: { flex: 1, padding: 8, borderRadius: 7, alignItems: "center" },
  notationActive: { backgroundColor: colors.surfaceElevated },
  notationLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },
  notationExample: { color: "#77706C", fontSize: 8, marginTop: 3 },
  keyBlock: { width: 84 },
  instrumentOptions: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  instrumentOption: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instrumentOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  instrumentOptionText: { color: colors.text, fontSize: 9, fontWeight: "700" },
  instrumentHelp: {
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 8,
  },
  visibilityRow: { flexDirection: "row", gap: 8 },
  visibility: {
    flex: 1,
    padding: 12,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  visibilityActive: { borderColor: colors.accent, backgroundColor: "#281A1D" },
  visibilityTitle: { color: colors.text, fontSize: 11, fontWeight: "700" },
  visibilityCopy: { color: colors.textSecondary, fontSize: 9, marginTop: 3 },
  help: {
    backgroundColor: "#1D1819",
    borderRadius: radii.sm,
    padding: 14,
    marginTop: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#362326",
  },
  helpTitle: { color: colors.text, fontSize: 12, fontWeight: "700" },
  helpCopy: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  editor: {
    minHeight: 340,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: 18,
    fontFamily: "monospace",
    fontSize: 15,
    lineHeight: 27,
  },
  saveMessage: {
    color: "#D58A96",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 12,
  },
  saveSuccess: { color: "#80B19C" },
  counter: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 10,
    textAlign: "center",
  },
  deleteButton: { alignItems: "center", padding: 14, marginTop: 28 },
  deleteText: { color: "#D06474", fontSize: 12, fontWeight: "700" },
});
