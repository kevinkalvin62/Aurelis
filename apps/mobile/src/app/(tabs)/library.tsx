import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { SongRow } from "@/components/song-row";
import { Button } from "@/components/ui/button";
import { ExperienceState } from "@/components/ui/experience-state";
import { Screen } from "@/components/ui/screen";
import { colors, radii, spacing } from "@/constants/design";
import { searchSongs } from "@/features/songs/song-search";
import { useSongStore } from "@/store/song-store";
import { useAuthStore } from "@/store/auth-store";

const filters = ["Todas", "Favoritas", "Públicas", "Privadas"] as const;

export default function LibraryScreen() {
  const songs = useSongStore((state) => state.songs);
  const accessMode = useAuthStore((state) => state.accessMode);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todas");
  const personalSongs = useMemo(() => songs.filter((song) => !song.organizationId), [songs]);
  const visibleSongs = useMemo(
    () =>
      searchSongs(personalSongs, query).filter((song) => {
        const matchesFilter =
          filter === "Todas" ||
          (filter === "Favoritas" && song.favorite) ||
          (filter === "Públicas" && song.visibility === "public") ||
          (filter === "Privadas" && song.visibility === "private");
        return matchesFilter;
      }),
    [filter, personalSongs, query],
  );

  return (
    <Screen
      eyebrow="BIBLIOTECA PERSONAL"
      title="Biblioteca"
      subtitle={`${personalSongs.length} canciones · ${accessMode === "authenticated" ? "sincronización activa" : "guardadas localmente"}`}
      scroll={false}
      right={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Agregar canción"
          onPress={() => router.push("/editor")}
          style={styles.add}
        >
          <Text style={styles.addText}>＋</Text>
        </Pressable>
      }
    >
      <View style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar canción o artista"
          placeholderTextColor="#77706C"
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Buscar canción o artista"
        />
        {query ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpiar búsqueda"
            hitSlop={10}
            onPress={() => setQuery("")}
          >
            <Text style={styles.clear}>×</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.filters}>
        {filters.map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[styles.filter, filter === item && styles.filterActive]}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.heading}>
        <Text style={styles.count}>{visibleSongs.length} CANCIONES</Text>
        <Text style={styles.sort}>Actualizadas recientemente ↕</Text>
      </View>
      <FlatList
        data={visibleSongs}
        keyExtractor={(song) => song.id}
        renderItem={({ item, index }) => <SongRow song={item} index={index + 1} />}
        style={styles.list}
        contentContainerStyle={visibleSongs.length ? styles.listContent : styles.emptyContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ExperienceState
            kind="empty"
            title={
              query
                ? "No encontramos canciones con ese nombre."
                : personalSongs.length
                  ? "No encontramos canciones con ese criterio."
                  : "Aquí comenzará tu repertorio personal."
            }
            message={
              query
                ? "Revisa la búsqueda o agrega una nueva canción a tu biblioteca."
                : personalSongs.length
                  ? "Prueba con otro filtro para volver a ver tu repertorio."
                  : "Guarda canciones, notas y materiales para tenerlos siempre listos cuando los necesites."
            }
            action={
              query || !personalSongs.length ? (
                <Button
                  label={query ? "Agregar canción" : "Agregar primera canción"}
                  onPress={() => router.push("/editor")}
                />
              ) : undefined
            }
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  add: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: colors.text, fontSize: 23, fontWeight: "300" },
  search: {
    height: 50,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  searchIcon: { color: colors.textSecondary, fontSize: 22 },
  input: { flex: 1, color: colors.text, fontSize: 14, outlineStyle: "none" } as never,
  clear: { color: colors.textSecondary, fontSize: 22, lineHeight: 24 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: spacing.md },
  filter: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterActive: { backgroundColor: colors.text, borderColor: colors.text },
  filterText: { color: colors.textSecondary, fontSize: 11, fontWeight: "700" },
  filterTextActive: { color: colors.background },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 4,
  },
  count: { color: colors.textSecondary, fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  sort: { color: colors.textSecondary, fontSize: 10 },
  list: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: 116 },
  emptyContent: { flexGrow: 1, justifyContent: "center", padding: spacing.xl },
});
