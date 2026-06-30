import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SongRow } from "@/components/song-row";
import { colors, radii, spacing } from "@/constants/design";
import {
  listInstrumentMaterials,
  listOrganizationMembers,
  listOrganizationSetlists,
  listOrganizationSongs,
} from "@/features/organizations/organization-service";
import { getInstrumentTransposeOffset } from "@/features/organizations/instrument-material";
import { linkRemoteSetlistItem } from "@/features/setlists/setlist-service";
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
  const localSetlist = useSetlistStore((state) =>
    state.setlists.find((item) => item.id === id),
  );
  const linkLocalItem = useSetlistStore((state) => state.linkItem);
  const localSongs = useSongStore((state) => state.songs);
  const [linkingItem, setLinkingItem] = useState<string | null>(null);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<
    "all" | string
  >("all");
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
        titleSnapshot:
          songs.find((song) => song.id === songId)?.title ?? "Canción",
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
  const assignedInstruments = membership?.instruments ?? [];
  const activeInstrument =
    selectedInstrumentId === "all"
      ? undefined
      : assignedInstruments.find(
          (instrument) => instrument.instrumentId === selectedInstrumentId,
        );
  const transpose = activeInstrument
    ? getInstrumentTransposeOffset(activeInstrument)
    : 0;
  const linkedRemoteIds = remoteSongs.flatMap((song) =>
    song.remoteId ? [song.remoteId] : [],
  );
  const { data: materials = [] } = useQuery({
    queryKey: [
      "instrument-materials",
      activeInstrument?.instrumentId,
      linkedRemoteIds.join(","),
    ],
    queryFn: () =>
      listInstrumentMaterials(linkedRemoteIds, activeInstrument?.instrumentId),
    enabled: Boolean(
      organizationId && activeInstrument && linkedRemoteIds.length,
    ),
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
    toast.success("Canción vinculada; sus recursos ya están disponibles.");
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
        <Text style={styles.eyebrow}>
          {formatFriendlyDate(setlist?.serviceDate).toUpperCase()}
        </Text>
        <Text style={styles.title}>{setlist?.title ?? "Programa"}</Text>
        {setlist?.notes ? (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>NOTAS GENERALES</Text>
            <Text style={styles.notesText}>{setlist.notes}</Text>
          </View>
        ) : null}
        {organizationId ? (
          <View style={styles.instrumentView}>
            <Text style={styles.instrumentLabel}>VISTA POR INSTRUMENTO</Text>
            <View style={styles.instrumentFilters}>
              <Pressable
                onPress={() => setSelectedInstrumentId("all")}
                style={[
                  styles.instrumentFilter,
                  selectedInstrumentId === "all" &&
                    styles.instrumentFilterActive,
                ]}
              >
                <Text style={styles.instrumentFilterText}>Todos</Text>
              </Pressable>
              {assignedInstruments.map((instrument) => (
                <Pressable
                  key={instrument.id}
                  onPress={() =>
                    setSelectedInstrumentId(instrument.instrumentId)
                  }
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
        <Text style={styles.section}>
          {items.length} CANCIONES · ORDEN DEL EVENTO
        </Text>
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
                      semitones={material ? 0 : transpose}
                    />
                    {material ? (
                      <View style={styles.material}>
                        <Text style={styles.materialLabel}>
                          {material.instrumentName.toUpperCase()} ·{" "}
                          {material.key ?? song.key}
                          {material.adaptedFromInstrumentName
                            ? ` · ADAPTADO DE ${material.adaptedFromInstrumentName.toUpperCase()}`
                            : ""}
                        </Text>
                        {material.contentRaw ? (
                          <Text style={styles.materialContent}>
                            {material.contentRaw}
                          </Text>
                        ) : null}
                        {material.notes ? (
                          <Text style={styles.materialNotes}>
                            {material.notes}
                          </Text>
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
                        Sin recurso vinculado · permanece en el programa
                      </Text>
                      {item.notes ? (
                        <Text style={styles.itemNotes}>{item.notes}</Text>
                      ) : null}
                    </View>
                    {canManage ? (
                      <Pressable
                        onPress={() =>
                          setLinkingItem(
                            linkingItem === item.id ? null : item.id,
                          )
                        }
                      >
                        <Text style={styles.linkAction}>Vincular</Text>
                      </Pressable>
                    ) : null}
                  </View>
                )}
                {linkingItem === item.id ? (
                  <View style={styles.linkPicker}>
                    {songs.length ? (
                      songs.map((candidate) => (
                        <Pressable
                          key={candidate.id}
                          onPress={() => linkItem(item, candidate.id)}
                          style={styles.linkOption}
                        >
                          <Text style={styles.linkOptionTitle}>
                            {candidate.title}
                          </Text>
                          <Text style={styles.linkOptionMeta}>
                            {candidate.artist || "Sin autor"} · {candidate.key}
                          </Text>
                        </Pressable>
                      ))
                    ) : (
                      <Text style={styles.noResources}>
                        La biblioteca todavía está vacía. Esta canción seguirá
                        disponible como texto libre.
                      </Text>
                    )}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
        {!items.length ? (
          <Text style={styles.empty}>
            Este programa aún no tiene canciones.
          </Text>
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
  },
  linkPicker: {
    paddingVertical: 8,
    paddingLeft: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  linkOption: { paddingVertical: 9 },
  linkOptionTitle: { color: colors.text, fontSize: 11, fontWeight: "700" },
  linkOptionMeta: { color: colors.textSecondary, fontSize: 9, marginTop: 2 },
  noResources: {
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    paddingVertical: 10,
  },
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
  empty: { color: colors.textSecondary, textAlign: "center", padding: 28 },
});
