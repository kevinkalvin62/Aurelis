import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SongRow } from "@/components/song-row";
import { Button } from "@/components/ui/button";
import { colors, radii, spacing } from "@/constants/design";
import {
  addOrganizationMember,
  changeOrganizationRole,
  listInstruments,
  listMyOrganizations,
  listOrganizationMembers,
  listOrganizationSetlists,
  listOrganizationSongs,
  removeOrganizationMember,
  saveMemberInstruments,
} from "@/features/organizations/organization-service";
import {
  canAddOrganizationSong,
  canAdministerOrganization,
  isOrganizationLeader,
  organizationRoleLabel,
} from "@/features/organizations/permissions";
import { useAuthStore } from "@/store/auth-store";
import { useSongStore } from "@/store/song-store";
import { toast } from "@/store/toast-store";
import { formatFriendlyDate } from "@/lib/dates";
import type { OrganizationRole } from "@/types/domain";

type Section = "library" | "programs" | "members";

export default function OrganizationScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { accessMode, user } = useAuthStore();
  const [section, setSection] = useState<Section>("library");
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [instrumentMember, setInstrumentMember] = useState<string | null>(null);
  const [selectedInstrumentIds, setSelectedInstrumentIds] = useState<string[]>([]);
  const [primaryInstrumentId, setPrimaryInstrumentId] = useState<string | undefined>();
  const [savingInstruments, setSavingInstruments] = useState(false);
  const { data: organizations = [] } = useQuery({
    queryKey: ["organizations", user?.id],
    queryFn: listMyOrganizations,
    enabled: accessMode === "authenticated",
  });
  const organization = organizations.find((item) => item.id === id);
  const { data: songs = [], isLoading: songsLoading } = useQuery({
    queryKey: ["organization-songs", id],
    queryFn: () => listOrganizationSongs(id),
    enabled: Boolean(id && accessMode === "authenticated"),
  });
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["organization-members", id],
    queryFn: () => listOrganizationMembers(id),
    enabled: Boolean(id && accessMode === "authenticated"),
  });
  const { data: setlists = [] } = useQuery({
    queryKey: ["organization-setlists", id],
    queryFn: () => listOrganizationSetlists(id),
    enabled: Boolean(id && accessMode === "authenticated"),
  });
  const {
    data: instruments = [],
    isLoading: instrumentsLoading,
    isError: instrumentsError,
  } = useQuery({
    queryKey: ["instruments"],
    queryFn: listInstruments,
    enabled: accessMode === "authenticated",
  });
  const mergeSongs = useSongStore((state) => state.mergeRemoteSongs);
  useEffect(() => {
    if (songs.length) mergeSongs(songs);
  }, [mergeSongs, songs]);
  useEffect(() => {
    if (accessMode === "guest") {
      toast.warning("Necesitas iniciar sesión para usar esta función.");
      router.replace("/auth");
    }
  }, [accessMode]);
  const canDirect = isOrganizationLeader(organization?.role);
  const canAdmin = canAdministerOrganization(organization?.role);
  const canAddSong = canAddOrganizationSong(organization?.role);

  const addMember = async () => {
    if (!email.includes("@")) {
      toast.warning("Escribe un correo válido.");
      return;
    }
    setAdding(true);
    const error = await addOrganizationMember(id, email);
    setAdding(false);
    if (error) {
      toast.error(error);
      return;
    }
    setEmail("");
    await queryClient.invalidateQueries({
      queryKey: ["organization-members", id],
    });
    toast.success(
      "Integrante agregado. La organización aparecerá en su cuenta al volver a abrirla.",
    );
  };
  const changeRole = async (
    memberId: string,
    role: Exclude<OrganizationRole, "owner" | "guest">,
  ) => {
    const error = await changeOrganizationRole(memberId, role);
    if (error) {
      toast.error(error);
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: ["organization-members", id],
    });
    toast.success("Rol actualizado.");
  };
  const openInstrumentPicker = (member: (typeof members)[number]) => {
    if (instrumentMember === member.id) {
      setInstrumentMember(null);
      return;
    }
    const selected = member.instruments.map((instrument) => instrument.instrumentId);
    setSelectedInstrumentIds(selected);
    setPrimaryInstrumentId(
      member.instruments.find((instrument) => instrument.isPrimary)?.instrumentId ?? selected[0],
    );
    setInstrumentMember(member.id);
  };
  const toggleInstrument = (instrumentId: string) => {
    const selected = selectedInstrumentIds.includes(instrumentId)
      ? selectedInstrumentIds.filter((id) => id !== instrumentId)
      : [...selectedInstrumentIds, instrumentId];
    setSelectedInstrumentIds(selected);
    if (!selected.includes(primaryInstrumentId ?? "")) setPrimaryInstrumentId(selected[0]);
  };
  const saveInstruments = async (memberId: string) => {
    setSavingInstruments(true);
    const selected = instruments.filter((instrument) =>
      selectedInstrumentIds.includes(instrument.id),
    );
    const error = await saveMemberInstruments(memberId, selected, primaryInstrumentId);
    setSavingInstruments(false);
    if (error) {
      toast.error(error);
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: ["organization-members", id],
    });
    setInstrumentMember(null);
    toast.success("Instrumentos actualizados.");
  };
  const removeMember = (memberId: string, displayName: string) =>
    Alert.alert("Eliminar integrante", `¿Eliminar a ${displayName} de esta organización?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          void (async () => {
            const error = await removeOrganizationMember(memberId);
            if (error) {
              toast.error(error);
              return;
            }
            await queryClient.invalidateQueries({
              queryKey: ["organization-members", id],
            });
            toast.success("Integrante eliminado.");
          })();
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>{organization?.name ?? "Organización"}</Text>
          <Text style={styles.navMeta}>Tu rol: {organizationRoleLabel(organization?.role)}</Text>
        </View>
        <View style={styles.orgMark}>
          <Text style={styles.orgLetter}>
            {organization?.name?.slice(0, 1).toUpperCase() ?? "A"}
          </Text>
        </View>
      </View>
      <View style={styles.tabs}>
        {(
          [
            ["library", "Biblioteca"],
            ["programs", "Programas"],
            ["members", "Integrantes"],
          ] as const
        ).map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => setSection(value)}
            style={[styles.tab, section === value && styles.tabActive]}
          >
            <Text style={[styles.tabText, section === value && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {section === "library" ? (
          <>
            <View style={styles.sectionHead}>
              <View>
                <Text style={styles.eyebrow}>BIBLIOTECA DE LA ORGANIZACIÓN</Text>
                <Text style={styles.sectionTitle}>{songs.length} canciones compartidas</Text>
              </View>
              {canAddSong ? (
                <Button
                  compact
                  label="＋ Canción"
                  onPress={() =>
                    router.push({
                      pathname: "/editor",
                      params: { organizationId: id },
                    })
                  }
                />
              ) : null}
            </View>
            {songsLoading ? (
              <Text style={styles.empty}>Cargando biblioteca…</Text>
            ) : songs.length ? (
              <View style={styles.list}>
                {songs.map((song) => (
                  <View key={song.id}>
                    <SongRow song={song} />
                    {canDirect && song.remoteId ? (
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: "/material/editor",
                            params: {
                              organizationId: id,
                              songId: song.remoteId,
                              songTitle: song.title,
                              songKey: song.currentKey ?? song.key,
                            },
                          })
                        }
                        style={styles.materialLink}
                      >
                        <Text style={styles.materialLinkText}>＋ Material por instrumento</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.empty}>Esta organización todavía no tiene canciones.</Text>
            )}
          </>
        ) : null}
        {section === "programs" ? (
          <>
            <View style={styles.sectionHead}>
              <View>
                <Text style={styles.eyebrow}>PROGRAMAS</Text>
                <Text style={styles.sectionTitle}>{setlists.length} programas</Text>
              </View>
              {canDirect ? (
                <Button
                  compact
                  label="＋ Programa"
                  onPress={() =>
                    router.push({
                      pathname: "/setlist/create",
                      params: { organizationId: id },
                    })
                  }
                />
              ) : null}
            </View>
            {setlists.length ? (
              setlists.map((setlist) => (
                <Pressable
                  key={setlist.id}
                  onPress={() =>
                    router.push({
                      pathname: "/setlist/[id]",
                      params: { id: setlist.id, organizationId: id },
                    })
                  }
                  style={styles.program}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{setlist.title}</Text>
                    <Text style={styles.rowCopy}>
                      {formatFriendlyDate(setlist.serviceDate)} ·{" "}
                      {setlist.items?.length ?? setlist.songIds.length} canciones
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.empty}>Aún no hay programas para esta organización.</Text>
            )}
          </>
        ) : null}
        {section === "members" ? (
          <>
            <View style={styles.sectionHead}>
              <View>
                <Text style={styles.eyebrow}>EQUIPO</Text>
                <Text style={styles.sectionTitle}>{members.length} integrantes</Text>
              </View>
            </View>
            {canDirect ? (
              <View style={styles.addMember}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Correo del integrante"
                  placeholderTextColor="#77706C"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.emailInput}
                />
                <Button
                  compact
                  label={adding ? "Agregando…" : "Agregar"}
                  disabled={adding}
                  onPress={addMember}
                />
              </View>
            ) : null}
            {membersLoading ? (
              <Text style={styles.empty}>Cargando integrantes…</Text>
            ) : (
              members.map((member) => (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberTop}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitial}>
                        {member.displayName.slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>
                        {member.displayName}
                        {member.userId === user?.id ? " · Tú" : ""}
                      </Text>
                      <Text style={styles.rowCopy}>
                        {member.email} · {organizationRoleLabel(member.role)}
                      </Text>
                    </View>
                    {canAdmin ? (
                      <Pressable onPress={() => openInstrumentPicker(member)}>
                        <Text style={styles.smallAction}>Instrumentos</Text>
                      </Pressable>
                    ) : null}
                  </View>
                  {member.instruments.length ? (
                    <View style={styles.chips}>
                      {member.instruments.map((instrument) => (
                        <View key={instrument.id} style={styles.instrumentChip}>
                          <Text style={styles.chipText}>
                            {instrument.isPrimary ? "★ " : ""}
                            {instrument.instrumentName} · {instrument.transpositionKey ?? "C"}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {canAdmin && member.role !== "owner" ? (
                    <View style={styles.roles}>
                      {(["admin", "director", "musician"] as const).map((role) => (
                        <Pressable
                          key={role}
                          onPress={() => changeRole(member.id, role)}
                          style={[styles.role, member.role === role && styles.roleActive]}
                        >
                          <Text style={styles.roleText}>{organizationRoleLabel(role)}</Text>
                        </Pressable>
                      ))}
                      {organization?.role === "owner" ? (
                        <Pressable
                          onPress={() => removeMember(member.id, member.displayName)}
                          style={styles.role}
                        >
                          <Text style={[styles.roleText, { color: "#D06474" }]}>Eliminar</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ) : null}
                  {instrumentMember === member.id ? (
                    <View style={styles.instrumentPicker}>
                      {instrumentsLoading ? (
                        <Text style={styles.pickerMessage}>Cargando instrumentos…</Text>
                      ) : instrumentsError ? (
                        <Text style={styles.pickerMessage}>
                          No fue posible cargar los instrumentos.
                        </Text>
                      ) : instruments.length === 0 ? (
                        <Text style={styles.pickerMessage}>No hay instrumentos disponibles.</Text>
                      ) : (
                        <>
                          {instruments.map((option) => {
                            const selected = selectedInstrumentIds.includes(option.id);
                            return (
                              <View key={option.id} style={styles.instrumentOption}>
                                <Pressable
                                  onPress={() => toggleInstrument(option.id)}
                                  style={styles.instrumentChoice}
                                >
                                  <Text
                                    style={[
                                      styles.instrumentCheck,
                                      selected && styles.instrumentCheckActive,
                                    ]}
                                  >
                                    {selected ? "✓" : ""}
                                  </Text>
                                  <Text style={styles.optionText}>{option.name}</Text>
                                  <Text style={styles.optionKey}>
                                    {option.transpositionKey ?? "C"}
                                  </Text>
                                </Pressable>
                                {selected ? (
                                  <Pressable
                                    onPress={() => setPrimaryInstrumentId(option.id)}
                                    style={styles.primaryChoice}
                                  >
                                    <Text
                                      style={[
                                        styles.primaryChoiceText,
                                        primaryInstrumentId === option.id &&
                                          styles.primaryChoiceActive,
                                      ]}
                                    >
                                      {primaryInstrumentId === option.id
                                        ? "★ Principal"
                                        : "☆ Principal"}
                                    </Text>
                                  </Pressable>
                                ) : null}
                              </View>
                            );
                          })}
                          <View style={styles.pickerFooter}>
                            <Text style={styles.selectionCount}>
                              {selectedInstrumentIds.length} seleccionados
                            </Text>
                            <Button
                              compact
                              label={savingInstruments ? "Guardando…" : "Guardar"}
                              disabled={savingInstruments}
                              onPress={() => saveInstruments(member.id)}
                            />
                          </View>
                        </>
                      )}
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  nav: {
    minHeight: 66,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  back: { width: 34 },
  backText: { color: colors.text, fontSize: 34, fontWeight: "200" },
  navTitle: {
    color: colors.text,
    fontFamily: "serif",
    fontSize: 19,
    fontWeight: "600",
  },
  navMeta: {
    color: colors.textSecondary,
    fontSize: 9,
    textTransform: "uppercase",
    marginTop: 2,
  },
  orgMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#2A1B1E",
    alignItems: "center",
    justifyContent: "center",
  },
  orgLetter: { color: colors.accent, fontFamily: "serif", fontSize: 22 },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 14 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.accent },
  tabText: { color: colors.textSecondary, fontSize: 11, fontWeight: "700" },
  tabTextActive: { color: colors.text },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "700",
    marginTop: 6,
  },
  empty: {
    color: colors.textSecondary,
    textAlign: "center",
    padding: 34,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  materialLink: { alignItems: "flex-end", paddingBottom: 9 },
  materialLinkText: { color: colors.accent, fontSize: 8, fontWeight: "800" },
  program: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  rowCopy: { color: colors.textSecondary, fontSize: 10, marginTop: 4 },
  chevron: { color: colors.textSecondary, fontSize: 23 },
  addMember: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  emailInput: {
    flex: 1,
    color: colors.text,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  memberCard: {
    padding: 15,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  memberTop: { flexDirection: "row", alignItems: "center", gap: 11 },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2A1B1E",
    alignItems: "center",
    justifyContent: "center",
  },
  memberInitial: { color: colors.accent, fontWeight: "800" },
  smallAction: { color: colors.accent, fontSize: 9, fontWeight: "800" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  instrumentChip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
  },
  chipText: { color: colors.textSecondary, fontSize: 9 },
  roles: { flexDirection: "row", gap: 6, marginTop: 12 },
  role: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleActive: { borderColor: colors.accent, backgroundColor: "#281A1D" },
  roleText: {
    color: colors.textSecondary,
    fontSize: 8,
    textTransform: "uppercase",
    fontWeight: "800",
  },
  instrumentPicker: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  pickerMessage: {
    color: colors.textSecondary,
    fontSize: 11,
    paddingVertical: 12,
    textAlign: "center",
  },
  instrumentOption: {
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  instrumentChoice: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  instrumentCheck: {
    width: 19,
    height: 19,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 17,
  },
  instrumentCheckActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  primaryChoice: {
    alignSelf: "flex-end",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  primaryChoiceText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
  },
  primaryChoiceActive: { color: colors.accent },
  pickerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  selectionCount: { color: colors.textSecondary, fontSize: 10 },
  optionText: { flex: 1, color: colors.text, fontSize: 11 },
  optionKey: { color: colors.accent, fontSize: 10, fontWeight: "800" },
});
