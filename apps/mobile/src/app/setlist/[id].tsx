import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SongRow } from "@/components/song-row";
import { ExperienceState } from "@/components/ui/experience-state";
import { colors, radii, spacing } from "@/constants/design";
import {
  listInstrumentMaterials,
  listOrganizationMembers,
  listOrganizationSetlists,
  listOrganizationSongs,
} from "@/features/organizations/organization-service";
import { getInstrumentTransposeOffset } from "@/features/organizations/instrument-material";
import { getTransposeDeltaBetweenInstruments } from "@/features/music-engine/instruments";
import { listPersonalInstruments } from "@/features/auth/profile-service";
import { linkRemoteSetlistItem } from "@/features/setlists/setlist-service";
import { searchSongs } from "@/features/songs/song-search";
import { useAuthStore } from "@/store/auth-store";
import { useSetlistStore } from "@/store/setlist-store";
import { useSongStore } from "@/store/song-store";
import { toast } from "@/store/toast-store";
import type { SetlistItem } from "@/types/domain";
import { formatFriendlyDate } from "@/lib/dates";

export default function SetlistDetailScreen() {
  const { id = "", organizationId } = useLocalSearchParams<{
    id: string;
    organizationId?: string;
  }>();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const localSetlist = useSetlistStore((state) => state.setlists.find((item) => item.id === id));
  const linkLocalItem = useSetlistStore((state) => state.linkItem);
  const localSongs = useSongStore((state) => state.songs);
  const [linkingItem, setLinkingItem] = useState<string | null>(null);
  const [linkQuery, setLinkQuery] = useState("");
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<"all" | string>("all");
  const { data: remoteSetlists = [] } = useQuery({
    queryKey: ["organization-setlists", organizationId],
    queryFn: () => listOrganizationSetlists(organizationId!),
    enabled: Boolean(organizationId),
  });
  const { data: remoteSongs = [] } = useQuery({
    queryKey: ["organization-songs", organizationId],
    queryFn: () => listOrganizationSongs(organizationId!),
    enabled: Boolean(organizationId),
  });
  const { data: members = [] } = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId!),
    enabled: Boolean(organizationId),
  });
  const { data: personalInstruments = [] } = useQuery({
    queryKey: ["personal-instruments", user?.id],
    queryFn: () => listPersonalInstruments(user!.id),
    enabled: Boolean(!organizationId && user),
  });
  const mergeSongs = useSongStore((state) => state.mergeRemoteSongs);
  useEffect(() => {
    if (remoteSongs.length) mergeSongs(remoteSongs);
  }, [mergeSongs, remoteSongs]);
  const setlist = localSetlist ?? remoteSetlists.find((item) => item.id === id);
  const songs = organizationId ? remoteSongs : localSongs;
  const items = useMemo<SetlistItem[]>(
    () =>
      setlist?.items ??
      (setlist?.songIds ?? []).map((songId, position) => ({
        id: `${id}-legacy-${position}`,
        setlistId: id,
        songId,
        titleSnapshot: songs.find((song) => song.id === songId)?.title ?? "Canción",
        position,
      })),
    [id, setlist, songs],
  );
  const membership = members.find((member) => member.userId === user?.id);
  const canManage =
    !organizationId ||
    membership?.role === "owner" ||
    membership?.role === "admin" ||
    membership?.role === "director";
  const assignedInstruments = useMemo(
    () => (organizationId ? (membership?.instruments ?? []) : personalInstruments),
    [organizationId, membership?.instruments, personalInstruments],
  );
  useEffect(() => {
    const preferred =
      assignedInstruments.find((instrument) => instrument.isPrimary) ?? assignedInstruments[0];
    // Account and membership changes intentionally reset the active instrument.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedInstrumentId(preferred?.instrumentId ?? "all");
  }, [organizationId, user?.id, assignedInstruments]);
  const activeInstrument =
    selectedInstrumentId === "all"
      ? undefined
      : assignedInstruments.find((instrument) => instrument.instrumentId === selectedInstrumentId);
  const transpose = activeInstrument ? getInstrumentTransposeOffset(activeInstrument) : 0;
  const linkedRemoteIds = remoteSongs.flatMap((song) => (song.remoteId ? [song.remoteId] : []));
  const { data: materials = [] } = useQuery({
    queryKey: ["instrument-materials", activeInstrument?.instrumentId, linkedRemoteIds.join(",")],
    queryFn: () => listInstrumentMaterials(linkedRemoteIds, activeInstrument?.instrumentId),
    enabled: Boolean(organizationId && activeInstrument && linkedRemoteIds.length),
  });

  const linkItem = async (item: SetlistItem, songId: string) => {
    const song = songs.find((candidate) => candidate.id === songId);
    if (!song) return;
    if (organizationId) {
      if (!song.remoteId) {
        toast.error("La canción todavía no está sincronizada.");
        return;
      }
      const error = await linkRemoteSetlistItem(item.id, song.remoteId);
      if (error) {
        toast.error(error);
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: ["organization-setlists", organizationId],
      });
    } else linkLocalItem(id, item.id, song.id);
    setLinkingItem(null);
    setLinkQuery("");
    toast.success("Canción agregada desde tu biblioteca.");
  };

  const toggleSongSearch = (item: SetlistItem) => {
    const isClosing = linkingItem === item.id;
    setLinkingItem(isClosing ? null : item.id);
    setLinkQuery(isClosing ? "" : item.titleSnapshot);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.navTitle}>PROGRAMA</Text>
        <View style={{ width: 30 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{formatFriendlyDate(setlist?.serviceDate).toUpperCase()}</Text>
        <Text style={styles.title}>{setlist?.title ?? "Programa"}</Text>
        {setlist?.notes ? (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>NOTAS GENERALES</Text>
            <Text style={styles.notesText}>{setlist.notes}</Text>
          </View>
        ) : null}
        {organizationId || personalInstruments.length ? (
          <View style={styles.instrumentView}>
            <Text style={styles.instrumentLabel}>VISTA POR INSTRUMENTO</Text>
            <View style={styles.instrumentFilters}>
              <Pressable
                onPress={() => setSelectedInstrumentId("all")}
                style={[
                  styles.instrumentFilter,
                  selectedInstrumentId === "all" && styles.instrumentFilterActive,
                ]}
              >
                <Text style={styles.instrumentFilterText}>Todos</Text>
              </Pressable>
              {assignedInstruments.map((instrument) => (
                <Pressable
                  key={instrument.id}
                  onPress={() => setSelectedInstrumentId(instrument.instrumentId)}
                  style={[
                    styles.instrumentFilter,
                    selectedInstrumentId === instrument.instrumentId &&
                      styles.instrumentFilterActive,
                  ]}
                >
                  <Text style={styles.instrumentFilterText}>
                    {instrument.isPrimary ? "★ " : ""}
                    {instrument.instrumentName}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.instrumentCopy}>
              {activeInstrument
                ? `Mostrando recursos para ${activeInstrument.instrumentName}${transpose ? " con transporte automático" : ""}.`
                : assignedInstruments.length
                  ? "Vista general del programa y sus canciones base."
                  : "No tienes instrumento asignado; se mostrará la canción base."}
            </Text>
          </View>
        ) : null}
        <Text style={styles.section}>{items.length} CANCIONES · ORDEN DEL EVENTO</Text>
        <View style={styles.list}>
          {items.map((item, index) => {
            const song = item.songId
              ? songs.find((candidate) => candidate.id === item.songId)
              : undefined;
            const material = song
              ? materials.find((candidate) => candidate.songId === song.id)
              : undefined;
            return (
              <View key={item.id}>
                {song ? (
                  <>
                    <SongRow
                      song={song}
                      index={index + 1}
                      semitones={
                        material
                          ? 0
                          : activeInstrument
                            ? getTransposeDeltaBetweenInstruments(
                                song.sourceInstrumentName,
                                activeInstrument.instrumentName,
                              )
                            : 0
                      }
                    />
                    {material ? (
                      <View style={styles.material}>
                        <Text style={styles.materialLabel}>
                          {material.instrumentName.toUpperCase()} · {material.key ?? song.key}
                          {material.adaptedFromInstrumentName
                            ? ` · ADAPTADO DE ${material.adaptedFromInstrumentName.toUpperCase()}`
                            : ""}
                        </Text>
                        {material.contentRaw ? (
                          <Text style={styles.materialContent}>{material.contentRaw}</Text>
                        ) : null}
                        {material.notes ? (
                          <Text style={styles.materialNotes}>{material.notes}</Text>
                        ) : null}
                      </View>
                    ) : organizationId && activeInstrument ? (
                      <Text style={styles.baseFallback}>
                        Sin material específico · se usará la canción base
                        {transpose ? " transportada" : ""}
                      </Text>
                    ) : null}
                  </>
                ) : (
                  <View style={styles.freeItem}>
                    <View style={styles.freePosition}>
                      <Text style={styles.freePositionText}>
                        {String(index + 1).padStart(2, "0")}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.freeTitle}>{item.titleSnapshot}</Text>
                      <Text style={styles.freeCopy}>
                        Sin canción de la biblioteca · permanece en el programa
                      </Text>
                      {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
                    </View>
                    {canManage ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Buscar ${item.titleSnapshot} en la biblioteca`}
                        onPress={() => toggleSongSearch(item)}
                      >
                        <Text style={styles.linkAction}>Buscar en biblioteca</Text>
                      </Pressable>
                    ) : null}
                  </View>
                )}
                {linkingItem === item.id ? (
                  <View style={styles.linkPicker}>
                    <View style={styles.search}>
                      <Text style={styles.searchIcon}>⌕</Text>
                      <TextInput
                        autoFocus
                        autoCorrect={false}
                        returnKeyType="search"
                        accessibilityLabel="Buscar canción o artista"
                        value={linkQuery}
                        onChangeText={setLinkQuery}
                        placeholder="Buscar canción o artista"
                        placeholderTextColor="#77706C"
                        style={styles.searchInput}
                      />
                      {linkQuery ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Limpiar búsqueda"
                          hitSlop={10}
                          onPress={() => setLinkQuery("")}
                        >
                          <Text style={styles.searchClear}>×</Text>
                        </Pressable>
                      ) : null}
                    </View>
                    {!songs.length ? (
                      <ExperienceState
                        kind="empty"
                        title={
                          organizationId
                            ? "Aquí crecerá el repertorio de tu agrupación."
                            : "Aquí comenzará tu repertorio personal."
                        }
                        message={
                          organizationId
                            ? "Cada canción que agreguen ayudará a que los próximos ensayos comiencen mejor preparados."
                            : "Guarda canciones, notas y materiales para tenerlos siempre listos cuando los necesites."
                        }
                        style={styles.pickerState}
                      />
                    ) : linkQuery.trim() ? (
                      searchSongs(songs, linkQuery).map((candidate) => (
                        <Pressable
                          key={candidate.id}
                          onPress={() => linkItem(item, candidate.id)}
                          style={styles.linkOption}
                        >
                          <Text style={styles.linkOptionTitle}>{candidate.title}</Text>
                          <Text style={styles.linkOptionMeta}>
                            {candidate.artist || "Sin autor"} · {candidate.key}
                          </Text>
                        </Pressable>
                      ))
                    ) : (
                      <ExperienceState
                        kind="empty"
                        message="Escribe el nombre de una canción o artista para encontrarla."
                        style={styles.pickerState}
                      />
                    )}
                    {songs.length && linkQuery.trim() && !searchSongs(songs, linkQuery).length ? (
                      <ExperienceState
                        kind="empty"
                        title="No encontramos canciones con ese nombre."
                        message="Revisa la búsqueda o agrega una nueva canción a tu biblioteca."
                        style={styles.pickerState}
                      />
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
        {!items.length ? (
          <ExperienceState
            kind="empty"
            title="Este programa todavía no tiene canciones."
            message="Agrega el repertorio que prepararán para el próximo ensayo o presentación."
            style={styles.empty}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  nav: {
    height: 58,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  back: { color: colors.text, fontSize: 34 },
  navTitle: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  title: {
    color: colors.text,
    fontFamily: "serif",
    fontSize: 34,
    fontWeight: "600",
    marginTop: 8,
  },
  notes: {
    marginTop: 20,
    padding: 15,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesLabel: {
    color: colors.textSecondary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  notesText: { color: colors.text, fontSize: 12, lineHeight: 18, marginTop: 7 },
  instrumentView: {
    marginTop: 14,
    padding: 15,
    borderRadius: radii.md,
    backgroundColor: "#1D1819",
    borderWidth: 1,
    borderColor: "#362326",
  },
  instrumentLabel: {
    color: colors.accent,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  instrumentFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 10,
  },
  instrumentFilter: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instrumentFilterActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  instrumentFilterText: { color: colors.text, fontSize: 9, fontWeight: "700" },
  instrumentCopy: {
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  section: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginTop: 26,
    marginBottom: 10,
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  freeItem: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  freePosition: {
    width: 30,
    height: 30,
    borderRadius: radii.sm,
    backgroundColor: colors.white08,
    alignItems: "center",
    justifyContent: "center",
  },
  freePositionText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  freeTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  freeCopy: { color: colors.warning, fontSize: 9, marginTop: 4 },
  itemNotes: { color: colors.textSecondary, fontSize: 9, marginTop: 4 },
  linkAction: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "900",
    padding: 8,
    maxWidth: 90,
    textAlign: "right",
  },
  linkPicker: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  search: {
    minHeight: 46,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: { color: colors.textSecondary, fontSize: 20 },
  searchInput: { flex: 1, color: colors.text, fontSize: 12, outlineStyle: "none" } as never,
  searchClear: { color: colors.textSecondary, fontSize: 21, lineHeight: 23 },
  pickerState: { paddingVertical: spacing.md },
  linkOption: { paddingVertical: 9 },
  linkOptionTitle: { color: colors.text, fontSize: 11, fontWeight: "700" },
  linkOptionMeta: { color: colors.textSecondary, fontSize: 9, marginTop: 2 },
  material: {
    marginBottom: 12,
    marginLeft: 46,
    padding: 11,
    borderRadius: radii.sm,
    backgroundColor: "#1D1819",
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },
  materialLabel: { color: colors.accent, fontSize: 8, fontWeight: "900" },
  materialContent: {
    color: colors.text,
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },
  materialNotes: {
    color: colors.textSecondary,
    fontSize: 10,
    fontStyle: "italic",
    marginTop: 5,
  },
  baseFallback: {
    color: "#77706C",
    fontSize: 8,
    marginLeft: 46,
    marginBottom: 10,
  },
  empty: { padding: 28 },
});
