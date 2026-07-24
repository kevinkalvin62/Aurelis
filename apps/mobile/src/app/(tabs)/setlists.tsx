import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { colors, radii, spacing } from "@/constants/design";
import { useSetlistStore } from "@/store/setlist-store";
import { formatFriendlyDate } from "@/lib/dates";
import { listMyOrganizationSetlists } from "@/features/organizations/organization-service";
import { splitSetlistsByTime } from "@/features/setlists/setlist-time";
import { useAuthStore } from "@/store/auth-store";
import type { Setlist } from "@/types/domain";

export default function SetlistsScreen() {
  const setlists = useSetlistStore((state) => state.setlists);
  const deleteSetlist = useSetlistStore((state) => state.deleteSetlist);
  const { accessMode, user } = useAuthStore();
  const { data: organizationSetlists = [] } = useQuery({
    queryKey: ["organization-setlists-all", user?.id],
    queryFn: listMyOrganizationSetlists,
    enabled: accessMode === "authenticated",
  });
  const sections = splitSetlistsByTime([...organizationSetlists, ...setlists]);
  const hasVisibleSetlists =
    sections.upcoming.length || sections.undated.length || sections.past.length;

  const confirmDeletePersonalPast = (setlist: Setlist) =>
    Alert.alert(
      "Eliminar programa",
      `¿Quitar “${setlist.title}” de tus programas? Se conservará como borrado lógico.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteSetlist(setlist.id),
        },
      ],
    );

  return (
    <Screen
      eyebrow="PLANIFICA Y TOCA"
      title="Programas"
      subtitle="Define el orden del evento; la biblioteca sólo agrega recursos opcionales."
    >
      <View style={styles.actions}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/setlist/create",
              params: { mode: "manual" },
            })
          }
          style={styles.action}
        >
          <Text style={styles.actionMark}>＋</Text>
          <Text style={styles.actionTitle}>Crear manualmente</Text>
          <Text style={styles.actionCopy}>Elige y ordena canciones</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/setlist/create",
              params: { mode: "import" },
            })
          }
          style={styles.action}
        >
          <Text style={styles.actionMark}>⌁</Text>
          <Text style={styles.actionTitle}>Pegar mensaje</Text>
          <Text style={styles.actionCopy}>Detecta coincidencias</Text>
        </Pressable>
      </View>
      <Text style={styles.label}>TUS PROGRAMAS</Text>
      <SetlistSection title="Próximos" setlists={sections.upcoming} />
      <SetlistSection title="Borradores" setlists={sections.undated} />
      <SetlistSection
        title="Historial"
        setlists={sections.past}
        onDeletePersonalPast={confirmDeletePersonalPast}
      />
      {!hasVisibleSetlists ? (
        <View style={styles.empty}>
          <Text style={styles.emptyMark}>◎</Text>
          <Text style={styles.emptyTitle}>Aún no tienes programas</Text>
          <Text style={styles.emptyCopy}>
            Crea uno manualmente o pega una lista recibida por mensaje.
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

function SetlistSection({
  title,
  setlists,
  onDeletePersonalPast,
}: {
  title: string;
  setlists: Setlist[];
  onDeletePersonalPast?: (setlist: Setlist) => void;
}) {
  if (!setlists.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {setlists.map((setlist) => (
        <SetlistCard
          key={`${setlist.organizationId ?? "local"}-${setlist.id}`}
          setlist={setlist}
          {...(onDeletePersonalPast ? { onDeletePersonalPast } : {})}
        />
      ))}
    </View>
  );
}

function SetlistCard({
  setlist,
  onDeletePersonalPast,
}: {
  setlist: Setlist;
  onDeletePersonalPast?: (setlist: Setlist) => void;
}) {
  const canDelete = !setlist.organizationId && Boolean(onDeletePersonalPast);
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/setlist/[id]",
          params: {
            id: setlist.id,
            ...(setlist.organizationId ? { organizationId: setlist.organizationId } : {}),
          },
        })
      }
      style={styles.card}
    >
      <View style={styles.date}>
        <Text style={styles.dateDay}>
          {setlist.serviceDate ? "FECHA" : setlist.organizationId ? "GRUPO" : "LOCAL"}
        </Text>
        <Text style={styles.dateNumber}>{setlist.serviceDate?.slice(-2) ?? "—"}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{setlist.title}</Text>
        <Text style={styles.meta}>
          {formatFriendlyDate(setlist.serviceDate)} · {setlist.organizationName ?? "Personal"} ·{" "}
          {setlist.items?.length ?? setlist.songIds.length} canciones
        </Text>
      </View>
      {canDelete ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${setlist.title}`}
          hitSlop={10}
          onPress={(event) => {
            event.stopPropagation();
            onDeletePersonalPast?.(setlist);
          }}
          style={styles.deleteAction}
        >
          <Text style={styles.deleteActionText}>Eliminar</Text>
        </Pressable>
      ) : null}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: 10, marginBottom: spacing.lg },
  action: {
    flex: 1,
    padding: 16,
    minHeight: 122,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#51252D",
  },
  actionMark: { color: colors.accent, fontSize: 22 },
  actionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
  },
  actionCopy: { color: colors.textSecondary, fontSize: 10, marginTop: 4 },
  label: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  section: { marginBottom: spacing.md },
  sectionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  card: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 9,
  },
  date: {
    width: 50,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  dateDay: { color: colors.textSecondary, fontSize: 7, fontWeight: "900" },
  dateNumber: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  title: { color: colors.text, fontSize: 14, fontWeight: "700" },
  meta: { color: colors.textSecondary, fontSize: 10, marginTop: 5 },
  chevron: { color: colors.textSecondary, fontSize: 23 },
  deleteAction: { padding: 8 },
  deleteActionText: { color: "#D06474", fontSize: 9, fontWeight: "800" },
  empty: {
    alignItems: "center",
    padding: 30,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  emptyMark: { color: colors.accent, fontSize: 25 },
  emptyTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
  },
  emptyCopy: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 5,
  },
});
