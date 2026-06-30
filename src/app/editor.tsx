import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { router, useLocalSearchParams } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { colors, radii, spacing } from "@/constants/design";
import { canAdministerOrganization } from "@/features/organizations/permissions";
import { listMyOrganizations } from "@/features/organizations/organization-service";
import { deleteRemoteSong, syncSong } from "@/features/songs/song-sync";
import { normalizeSongKey } from "@/features/songs/song-mapper";
import { useAuthStore } from "@/store/auth-store";
import { useSongStore } from "@/store/song-store";
import { toast } from "@/store/toast-store";
import type { MusicNotation, SongContentType } from "@/types/domain";

const schema = z.object({
  title: z.string().trim().min(2),
  artist: z.string().trim(),
  key: z.string().trim().min(1),
  contentType: z.enum(["lyrics_chords", "chords_only", "wind_notes"]),
  notation: z.enum(["american", "latin"]),
  visibility: z.enum(["private", "public", "organization"]),
  content: z.string().trim().min(4),
});
type FormValues = z.infer<typeof schema>;

const contentTypes: { value: SongContentType; label: string; mark: string }[] =
  [
    { value: "lyrics_chords", label: "Letra + acordes", mark: "Aa" },
    { value: "chords_only", label: "Sólo acordes", mark: "♯" },
    { value: "wind_notes", label: "Notas de viento", mark: "♪" },
  ];
const notations: { value: MusicNotation; label: string; example: string }[] = [
  { value: "american", label: "Americana", example: "C · D · E" },
  { value: "latin", label: "Latina", example: "DO · RE · MI" },
];

const samples: Record<SongContentType, Record<MusicNotation, string>> = {
  lyrics_chords: {
    american:
      "C               Am    C\nTú decías que me amabas, pero era\n       G7\nmentira y con otro me engañabas,",
    latin:
      "DO              LAm   DO\nTú decías que me amabas, pero era\n       SOL7\nmentira y con otro me engañabas,",
  },
  chords_only: {
    american: "C   G/B   Am7   Fadd9\nC   G     F     G",
    latin: "DO   SOL/SI   LAm7   FAadd9\nDO   SOL      FA       SOL",
  },
  wind_notes: {
    american: "/////DEFEDA///// AGFGAGF E\nCD. DACD\nA A#  A# F A A#",
    latin: "/////RE MI FA MI RE LA/////\nDO RE.  RE LA DO RE",
  },
};

export default function EditorScreen() {
  const queryClient = useQueryClient();
  const { id, organizationId } = useLocalSearchParams<{
    id?: string;
    organizationId?: string;
  }>();
  const songs = useSongStore((state) => state.songs);
  const saveSong = useSongStore((state) => state.saveSong);
  const markSyncPending = useSongStore((state) => state.markSyncPending);
  const markSynced = useSongStore((state) => state.markSynced);
  const deleteSong = useSongStore((state) => state.deleteSong);
  const { accessMode, user } = useAuthStore();
  const song = songs.find((item) => item.id === id);
  const effectiveOrganizationId = organizationId || song?.organizationId;
  const { data: organizations = [] } = useQuery({
    queryKey: ["organizations", user?.id],
    queryFn: listMyOrganizations,
    enabled: Boolean(effectiveOrganizationId && accessMode === "authenticated"),
  });
  const membership = organizations.find(
    (organization) => organization.id === effectiveOrganizationId,
  );
  const canDelete = Boolean(
    song &&
    (!effectiveOrganizationId
      ? !song.ownerUserId || song.ownerUserId === user?.id
      : canAdministerOrganization(membership?.role)),
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      title: song?.title ?? "",
      artist: song?.artist ?? "",
      key: song?.key ?? "C",
      contentType: song?.contentType ?? "lyrics_chords",
      notation: song?.notation ?? "american",
      visibility:
        song?.visibility ?? (organizationId ? "organization" : "private"),
      content: song?.content ?? samples.lyrics_chords.american,
    },
  });
  const contentType = useWatch({ control, name: "contentType" });
  const notation = useWatch({ control, name: "notation" });

  const chooseContentType = (value: SongContentType) => {
    setValue("contentType", value, { shouldDirty: true });
    if (!song)
      setValue("content", samples[value][notation], { shouldDirty: true });
  };
  const chooseNotation = (value: MusicNotation) => {
    setValue("notation", value, { shouldDirty: true });
    if (!song)
      setValue("content", samples[contentType][value], { shouldDirty: true });
  };
  const submit = handleSubmit(
    async (values) => {
      const result = schema.safeParse(values);
      if (!result.success) {
        toast.error("Completa título, tono y contenido antes de guardar.");
        return;
      }
      const normalizedKey = normalizeSongKey(result.data.key);
      if (!normalizedKey) {
        toast.error(
          "Usa una tonalidad válida, por ejemplo C, F#, Bb, Do o Sol.",
        );
        return;
      }
      setSaving(true);
      setSaveMessage("");
      const localSong = saveSong(
        {
          title: result.data.title,
          artist: result.data.artist,
          key: normalizedKey,
          bpm: song?.bpm ?? 80,
          visibility: result.data.visibility,
          content: result.data.content,
          contentType: result.data.contentType,
          notation: result.data.notation,
          ...(organizationId || song?.organizationId
            ? {
                organizationId: organizationId || song!.organizationId,
                visibility: "organization" as const,
              }
            : {}),
          ...(song?.favorite !== undefined ? { favorite: song.favorite } : {}),
        },
        song?.id,
      );
      if (accessMode === "authenticated" && user) {
        markSyncPending(localSong.id);
        const synced = await syncSong(localSong, user.id);
        if (synced.remoteId) {
          markSynced(localSong.id, synced.remoteId);
          if (localSong.organizationId)
            await queryClient.invalidateQueries({
              queryKey: ["organization-songs", localSong.organizationId],
            });
          if (synced.error) {
            setSaveMessage(
              "Canción sincronizada; no fue posible guardar su historial de versión.",
            );
            toast.warning("Canción sincronizada sin historial de versión.");
          } else {
            setSaveMessage("Guardada y sincronizada.");
            toast.success("Canción guardada y sincronizada.");
          }
        } else {
          if (localSong.organizationId) {
            deleteSong(localSong.id);
            setSaving(false);
            setSaveMessage(
              "No fue posible guardar la canción en la organización.",
            );
            toast.error(
              synced.error ?? "No fue posible guardar la canción en Supabase.",
            );
            return;
          }
          setSaveMessage(
            "Guardada en este dispositivo. La sincronización se reintentará después.",
          );
          toast.warning(
            "Guardada localmente; la sincronización queda pendiente.",
          );
        }
      } else {
        setSaveMessage("Guardada en este dispositivo.");
        toast.success("Canción guardada en este dispositivo.");
      }
      setSaving(false);
      setSaved(true);
      setTimeout(
        () =>
          router.replace({
            pathname: "/song/[id]",
            params: { id: localSong.id },
          }),
        650,
      );
    },
    () => toast.error("Revisa los campos obligatorios."),
  );
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
          onPress: () => {
            void (async () => {
              if (accessMode === "authenticated" && song.remoteId) {
                const error = await deleteRemoteSong(song.remoteId);
                if (error) {
                  toast.error(
                    "No fue posible eliminar la canción de Supabase.",
                  );
                  return;
                }
              }
              deleteSong(song.id);
              if (effectiveOrganizationId) {
                await queryClient.invalidateQueries({
                  queryKey: ["organization-songs", effectiveOrganizationId],
                });
                toast.success("Canción retirada del repertorio.");
                router.replace({
                  pathname: "/organization/[id]",
                  params: { id: effectiveOrganizationId },
                });
              } else {
                toast.success("Canción retirada de tu biblioteca.");
                router.replace("/library");
              }
            })();
          },
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
        <Text style={styles.navTitle}>
          {song ? "Editar canción" : "Nueva canción"}
        </Text>
        <Button
          label={saving ? "Guardando…" : saved ? "Guardada" : "Guardar"}
          compact
          disabled={saving}
          onPress={submit}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>
          {isDirty ? "CAMBIOS SIN GUARDAR" : "EDITOR AURELIS"}
        </Text>
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
          {contentTypes.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => chooseContentType(option.value)}
              style={[
                styles.typeCard,
                contentType === option.value && styles.typeCardActive,
              ]}
            >
              <Text
                style={[
                  styles.typeMark,
                  contentType === option.value && styles.typeTextActive,
                ]}
              >
                {option.mark}
              </Text>
              <Text
                style={[
                  styles.typeLabel,
                  contentType === option.value && styles.typeTextActive,
                ]}
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
              {notations.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => chooseNotation(option.value)}
                  style={[
                    styles.notation,
                    notation === option.value && styles.notationActive,
                  ]}
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
                    style={[
                      styles.visibility,
                      value === "private" && styles.visibilityActive,
                    ]}
                  >
                    <Text style={styles.visibilityTitle}>Privada</Text>
                    <Text style={styles.visibilityCopy}>Sólo tú</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onChange("public")}
                    style={[
                      styles.visibility,
                      value === "public" && styles.visibilityActive,
                    ]}
                  >
                    <Text style={styles.visibilityTitle}>Pública</Text>
                    <Text style={styles.visibilityCopy}>
                      Usuarios con cuenta
                    </Text>
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
              placeholder={samples[contentType][notation]}
              placeholderTextColor="#625D59"
              style={[styles.editor, errors.content && styles.error]}
              textAlignVertical="top"
            />
          )}
        />
        {saveMessage ? (
          <Text style={[styles.saveMessage, saved && styles.saveSuccess]}>
            {saveMessage}
          </Text>
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
  control: ReturnType<typeof useForm<FormValues>>["control"];
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
