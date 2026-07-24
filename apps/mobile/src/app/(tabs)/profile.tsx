import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/components/ui/screen";
import { colors, radii, spacing } from "@/constants/design";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import {
  listMyInstruments,
  listMyOrganizations,
  listSelectableInstruments,
} from "@/features/organizations/organization-service";
import { listPersonalInstruments, savePersonalInstruments } from "@/features/auth/profile-service";

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const { accessMode, user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [primaryId, setPrimaryId] = useState<string>();
  const authenticated = accessMode === "authenticated" && Boolean(user);
  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ["organizations", user?.id],
    queryFn: listMyOrganizations,
    enabled: authenticated,
  });
  const { data: organizationInstruments = [] } = useQuery({
    queryKey: ["my-instruments", user?.id],
    queryFn: () => listMyInstruments(user!.id),
    enabled: authenticated,
  });
  const { data: personalInstruments = [] } = useQuery({
    queryKey: ["personal-instruments", user?.id],
    queryFn: () => listPersonalInstruments(user!.id),
    enabled: authenticated,
  });
  const { data: catalog = [] } = useQuery({
    queryKey: ["selectable-instruments"],
    queryFn: listSelectableInstruments,
    enabled: authenticated,
  });
  const displayName = accessMode === "guest" ? "Invitado" : user?.name || "Músico";

  const createOrganization = () => {
    if (!authenticated) {
      toast.warning("Necesitas iniciar sesión para usar esta función.");
      router.push("/auth");
      return;
    }
    router.push("/organization/create");
  };
  const openEditor = () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    setSelectedIds(
      personalInstruments.flatMap((item) => {
        const match = catalog.find((instrument) => instrument.name === item.instrumentName);
        return match ? [match.id] : [];
      }),
    );
    const primary = personalInstruments.find((item) => item.isPrimary) ?? personalInstruments[0];
    setPrimaryId(catalog.find((instrument) => instrument.name === primary?.instrumentName)?.id);
    setEditing(true);
  };
  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];
    setSelectedIds(next);
    if (!next.includes(primaryId ?? "")) setPrimaryId(next[0]);
  };
  const save = async () => {
    if (!user) return;
    const visibleInstrumentNames = new Set(catalog.map((instrument) => instrument.name));
    const hiddenExistingInstrumentNames = personalInstruments
      .map((instrument) => instrument.instrumentName)
      .filter((instrumentName) => !visibleInstrumentNames.has(instrumentName));
    const error = await savePersonalInstruments(
      user.id,
      catalog.filter((item) => selectedIds.includes(item.id)),
      primaryId,
      hiddenExistingInstrumentNames,
    );
    if (error) {
      toast.error(error);
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: ["personal-instruments", user.id],
    });
    setEditing(false);
    toast.success("Instrumentos personales guardados.");
  };

  return (
    <Screen eyebrow="CUENTA Y EQUIPO" title="Perfil">
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {accessMode === "guest" ? "IN" : displayName.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>
            {authenticated ? user?.email : "Modo invitado · datos locales"}
          </Text>
          <View style={styles.plan}>
            <Text style={styles.planText}>{authenticated ? "SINCRONIZADO" : "INVITADO"}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.label}>IGLESIAS Y ORGANIZACIONES</Text>
      {!authenticated ? (
        <Pressable onPress={createOrganization} style={styles.org}>
          <View style={styles.orgMark}>
            <Text style={styles.orgLetter}>A</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Función disponible con cuenta</Text>
            <Text style={styles.rowCopy}>Inicia sesión para crear o unirte a una organización</Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.group}>
          {organizations.map((organization) => (
            <Pressable
              key={organization.id}
              onPress={() =>
                router.push({
                  pathname: "/organization/[id]",
                  params: { id: organization.id },
                })
              }
              style={styles.row}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{organization.name}</Text>
                <Text style={styles.rowCopy}>
                  {organization.role} · @{organization.slug}
                </Text>
              </View>
            </Pressable>
          ))}
          {isLoading ? <Text style={styles.emptyCopy}>Cargando organizaciones…</Text> : null}
          {!isLoading && !organizations.length ? (
            <Text style={styles.emptyCopy}>Aún no perteneces a ninguna organización.</Text>
          ) : null}
          <Pressable onPress={createOrganization} style={styles.row}>
            <Text style={styles.addMark}>＋</Text>
            <Text style={styles.rowTitle}>Crear organización</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.label}>MIS INSTRUMENTOS PERSONALES</Text>
      <View style={styles.group}>
        {personalInstruments.map((instrument) => (
          <View key={instrument.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{instrument.instrumentName}</Text>
              <Text style={styles.rowCopy}>Biblioteca y programas personales</Text>
            </View>
            {instrument.isPrimary ? <Text style={styles.primary}>PRINCIPAL</Text> : null}
          </View>
        ))}
        <Pressable onPress={openEditor} style={styles.row}>
          <Text style={styles.addMark}>＋</Text>
          <Text style={styles.rowTitle}>
            {personalInstruments.length ? "Editar instrumentos" : "Agregar instrumentos"}
          </Text>
        </Pressable>
      </View>
      {editing ? (
        <View style={styles.picker}>
          {catalog.map((instrument) => {
            const selected = selectedIds.includes(instrument.id);
            return (
              <View key={instrument.id} style={styles.choice}>
                <Pressable onPress={() => toggle(instrument.id)} style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>
                    {selected ? "✓ " : ""}
                    {instrument.name}
                  </Text>
                </Pressable>
                {selected ? (
                  <Pressable onPress={() => setPrimaryId(instrument.id)}>
                    <Text style={styles.primary}>
                      {primaryId === instrument.id ? "★ PRINCIPAL" : "HACER PRINCIPAL"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
          <Pressable onPress={save} style={styles.save}>
            <Text style={styles.actionText}>Guardar instrumentos</Text>
          </Pressable>
        </View>
      ) : null}

      {organizationInstruments.length ? (
        <>
          <Text style={styles.label}>INSTRUMENTOS EN ORGANIZACIONES</Text>
          <View style={styles.group}>
            {organizationInstruments.map((instrument) => (
              <View key={instrument.id} style={styles.row}>
                <View>
                  <Text style={styles.rowTitle}>{instrument.instrumentName}</Text>
                  <Text style={styles.rowCopy}>{instrument.organizationName}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : null}
      <Pressable onPress={() => router.push("/auth")} style={styles.save}>
        <Text style={styles.actionText}>
          {authenticated ? "Gestionar cuenta" : "Crear cuenta o iniciar sesión"}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#51252D",
  },
  avatarText: { color: colors.text, fontSize: 20, fontWeight: "800" },
  name: {
    color: colors.text,
    fontFamily: "serif",
    fontSize: 22,
    fontWeight: "600",
  },
  email: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  plan: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#37251C",
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  planText: { color: "#D5AA79", fontSize: 8, fontWeight: "900" },
  label: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.6,
    marginTop: spacing.lg,
    marginBottom: 10,
  },
  org: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orgMark: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#2A1B1E",
    alignItems: "center",
    justifyContent: "center",
  },
  orgLetter: { color: colors.accent, fontFamily: "serif", fontSize: 24 },
  group: {
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: "600" },
  rowCopy: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  primary: { color: colors.accent, fontSize: 8, fontWeight: "900" },
  emptyCopy: { color: colors.textSecondary, fontSize: 12, paddingVertical: 18 },
  addMark: { color: colors.accent, fontSize: 20 },
  picker: {
    marginTop: 10,
    padding: 14,
    borderRadius: radii.md,
    backgroundColor: "#1D1819",
    borderWidth: 1,
    borderColor: "#362326",
  },
  choice: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  save: { marginTop: spacing.lg, alignItems: "center", padding: 14 },
  actionText: { color: colors.accent, fontSize: 13, fontWeight: "700" },
});
