import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
import { FieldLabel } from "@/components/ui/field-label";
import { ModalHeader } from "@/components/ui/modal-header";
import { colors, radii, spacing } from "@/constants/design";
import type { SetlistCreationMode } from "@/features/setlists/setlist-draft";
import { useSetlistCreator } from "@/features/setlists/use-setlist-creator";

export default function CreateSetlistScreen() {
  const { organizationId, mode: initialMode } = useLocalSearchParams<{
    organizationId?: string;
    mode?: SetlistCreationMode;
  }>();
  const {
    addFreeEntry,
    addLibrarySong,
    date,
    entries,
    freeTitle,
    importList,
    mode,
    move,
    notes,
    parsed,
    remove,
    saving,
    setDate,
    setEntries,
    setFreeTitle,
    setMode,
    setNotes,
    setSource,
    setTitle,
    songs,
    source,
    submit,
    title,
  } = useSetlistCreator(organizationId, initialMode);

  return (
    <SafeAreaView style={styles.safe}>
      <ModalHeader
        title="Nuevo programa"
        onCancel={() => router.back()}
        action={
          <Button
            label={saving ? "Guardando…" : "Guardar"}
            compact
            disabled={saving}
            onPress={submit}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.modeTabs}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Crear programa manualmente"
            accessibilityState={{ selected: mode === "manual" }}
            onPress={() => setMode("manual")}
            style={[styles.mode, mode === "manual" && styles.modeActive]}
          >
            <Text style={styles.modeText}>Manual</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Crear programa pegando una lista"
            accessibilityState={{ selected: mode === "import" }}
            onPress={() => setMode("import")}
            style={[styles.mode, mode === "import" && styles.modeActive]}
          >
            <Text style={styles.modeText}>Pegar lista</Text>
          </Pressable>
        </View>
        <FieldLabel>TÍTULO</FieldLabel>
        <TextInput
          accessibilityLabel="Título del programa"
          value={title}
          onChangeText={setTitle}
          placeholder="Domingo AM"
          placeholderTextColor="#77706C"
          style={styles.input}
        />
        <View style={styles.twoCols}>
          <View style={{ flex: 1 }}>
            <FieldLabel>FECHA</FieldLabel>
            <DateField value={date} onChange={setDate} />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel>CONTEXTO</FieldLabel>
            <View style={styles.context}>
              <Text style={styles.contextText}>{organizationId ? "Organización" : "Local"}</Text>
            </View>
          </View>
        </View>
        <FieldLabel>NOTAS GENERALES</FieldLabel>
        <TextInput
          accessibilityLabel="Notas generales"
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholder="Indicaciones para el equipo"
          placeholderTextColor="#77706C"
          style={[styles.input, styles.notes]}
        />
        {mode === "import" ? (
          <>
            <FieldLabel>MENSAJE O LISTA</FieldLabel>
            <TextInput
              accessibilityLabel="Mensaje o lista de canciones"
              multiline
              value={source}
              onChangeText={setSource}
              placeholder={"Lista domingo:\n1. Paloma Blanca\n2. Canción nueva"}
              placeholderTextColor="#77706C"
              style={[styles.input, styles.source]}
            />
            <Button
              label="Crear orden y buscar coincidencias"
              variant="secondary"
              onPress={importList}
            />
            <View style={styles.matches}>
              {parsed.matches.map((match, index) => (
                <View key={`${match.line}-${index}`} style={styles.match}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.matchLine}>
                      {index + 1}. {match.line}
                    </Text>
                    <Text style={[styles.matchResult, !match.song && styles.unmatched]}>
                      {match.song
                        ? `Recurso encontrado: ${match.song.title}`
                        : "Se conservará como texto libre"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <FieldLabel>AGREGAR CANCIÓN LIBRE</FieldLabel>
            <View style={styles.addRow}>
              <TextInput
                accessibilityLabel="Nombre de la canción libre"
                value={freeTitle}
                onChangeText={setFreeTitle}
                onSubmitEditing={addFreeEntry}
                placeholder="Nombre de la canción"
                placeholderTextColor="#77706C"
                style={[styles.input, { flex: 1 }]}
              />
              <Button compact label="Agregar" onPress={addFreeEntry} />
            </View>
            <FieldLabel>RECURSOS DISPONIBLES (OPCIONALES)</FieldLabel>
            {songs.map((song) => (
              <Pressable
                key={song.id}
                accessibilityRole="button"
                accessibilityLabel={`Agregar ${song.title} al programa`}
                onPress={() => addLibrarySong(song)}
                style={styles.songRow}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.songTitle}>{song.title}</Text>
                  <Text style={styles.songMeta}>
                    {song.artist || "Sin autor"} · {song.key}
                  </Text>
                </View>
                <Text style={styles.addResource}>＋ agregar</Text>
              </Pressable>
            ))}
            {!songs.length ? (
              <Text style={styles.empty}>
                La biblioteca está vacía; puedes crear el programa con canciones libres.
              </Text>
            ) : null}
          </>
        )}
        <View style={styles.songHeader}>
          <FieldLabel>ORDEN DEL EVENTO</FieldLabel>
          <Text style={styles.count}>{entries.length} canciones</Text>
        </View>
        {process.env.EXPO_OS === "web" ? (
          entries.map((item, index) => (
            <View key={item.clientId} style={styles.ordered}>
              <Text style={styles.position}>{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.songTitle}>{item.titleSnapshot}</Text>
                <Text style={[styles.linkState, !item.songId && styles.unmatched]}>
                  {item.songId ? "Vinculada a biblioteca" : "Texto libre · recursos opcionales"}
                </Text>
              </View>
              <Pressable onPress={() => move(item.clientId, -1)}>
                <Text style={styles.arrow}>↑</Text>
              </Pressable>
              <Pressable onPress={() => move(item.clientId, 1)}>
                <Text style={styles.arrow}>↓</Text>
              </Pressable>
              <Pressable onPress={() => remove(item.clientId)} hitSlop={8}>
                <Text style={styles.remove}>×</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <DraggableFlatList
            data={entries}
            keyExtractor={(entry) => entry.clientId}
            scrollEnabled={false}
            onDragEnd={({ data }) => setEntries(data)}
            renderItem={({ item, getIndex, drag, isActive }) => {
              const index = getIndex() ?? 0;
              return (
                <Pressable
                  onLongPress={drag}
                  disabled={isActive}
                  delayLongPress={180}
                  style={[styles.ordered, isActive && styles.orderedActive]}
                >
                  <Text style={styles.dragHandle}>≡</Text>
                  <Text style={styles.position}>{index + 1}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.songTitle}>{item.titleSnapshot}</Text>
                    <Text style={[styles.linkState, !item.songId && styles.unmatched]}>
                      {item.songId ? "Vinculada a biblioteca" : "Texto libre · recursos opcionales"}
                    </Text>
                  </View>
                  <Pressable onPress={() => remove(item.clientId)} hitSlop={8}>
                    <Text style={styles.remove}>×</Text>
                  </Pressable>
                </Pressable>
              );
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
  },
  modeTabs: {
    flexDirection: "row",
    padding: 3,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mode: { flex: 1, alignItems: "center", padding: 10, borderRadius: 7 },
  modeActive: { backgroundColor: colors.surfaceElevated },
  modeText: { color: colors.text, fontSize: 11, fontWeight: "700" },
  input: {
    minHeight: 50,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    color: colors.text,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  notes: { minHeight: 76, paddingTop: 12, textAlignVertical: "top" },
  source: {
    minHeight: 130,
    paddingTop: 12,
    textAlignVertical: "top",
    fontFamily: "monospace",
    marginBottom: 10,
  },
  twoCols: { flexDirection: "row", gap: 10 },
  context: {
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  contextText: { color: colors.accent, fontSize: 12, fontWeight: "700" },
  addRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  matches: { marginTop: 10 },
  match: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  matchLine: { color: colors.text, fontSize: 12 },
  matchResult: { color: colors.success, fontSize: 9, marginTop: 3 },
  unmatched: { color: colors.warning },
  songHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  count: { color: colors.textSecondary, fontSize: 9, marginBottom: 8 },
  songRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 7,
    borderRadius: radii.md,
  },
  songTitle: { color: colors.text, fontSize: 13, fontWeight: "700" },
  songMeta: { color: colors.textSecondary, fontSize: 10, marginTop: 4 },
  addResource: { color: colors.accent, fontSize: 9, fontWeight: "800" },
  ordered: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  orderedActive: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.accent,
    borderWidth: 1,
  },
  dragHandle: { color: colors.textSecondary, fontSize: 20, width: 16 },
  position: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "800",
    width: 20,
  },
  linkState: { color: colors.success, fontSize: 8, marginTop: 3 },
  arrow: { color: colors.textSecondary, fontSize: 18, padding: 7 },
  remove: { color: colors.destructive, fontSize: 21, padding: 7 },
  empty: {
    color: colors.textSecondary,
    textAlign: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
});
