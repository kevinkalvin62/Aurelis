import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/ui/screen';
import { colors, radii, spacing } from '@/constants/design';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/store/toast-store';
import { listMyInstruments, listMyOrganizations } from '@/features/organizations/organization-service';

export default function ProfileScreen() {
  const { accessMode, user } = useAuthStore();
  const { data: organizations = [], isLoading } = useQuery({ queryKey: ['organizations', user?.id], queryFn: listMyOrganizations, enabled: accessMode === 'authenticated' });
  const { data: instruments = [] } = useQuery({ queryKey: ['my-instruments', user?.id], queryFn: () => listMyInstruments(user!.id), enabled: Boolean(accessMode === 'authenticated' && user) });
  const displayName = accessMode === 'guest' ? 'Invitado' : user?.name || 'Músico';
  const createOrganization = () => { if (accessMode !== 'authenticated') { toast.warning('Necesitas iniciar sesión para usar esta función.'); router.push('/auth'); return; } router.push('/organization/create'); };
  return (
    <Screen eyebrow="CUENTA Y EQUIPO" title="Perfil">
      <View style={styles.identity}><View style={styles.avatar}><Text style={styles.avatarText}>{accessMode === 'guest' ? 'IN' : displayName.slice(0, 2).toUpperCase()}</Text></View><View><Text style={styles.name}>{displayName}</Text><Text style={styles.email}>{accessMode === 'authenticated' ? user?.email : 'Modo invitado · datos locales'}</Text><View style={styles.plan}><Text style={styles.planText}>{accessMode === 'authenticated' ? 'SINCRONIZADO' : 'INVITADO'}</Text></View></View></View>
      <Text style={styles.label}>IGLESIAS Y ORGANIZACIONES</Text>
      {accessMode !== 'authenticated' ? <Pressable onPress={createOrganization} style={styles.org}><View style={styles.orgMark}><Text style={styles.orgLetter}>A</Text></View><View style={{ flex: 1 }}><Text style={styles.rowTitle}>Función disponible con cuenta</Text><Text style={styles.rowCopy}>Inicia sesión para crear o unirte a una organización</Text></View><Text style={styles.chevron}>›</Text></Pressable> : <View style={styles.group}>
        {organizations.map((organization) => <Pressable key={organization.id} onPress={() => router.push({ pathname: '/organization/[id]', params: { id: organization.id } })} style={styles.row}><View style={{ flex: 1 }}><Text style={styles.rowTitle}>{organization.name}</Text><Text style={styles.rowCopy}>{organization.role} · @{organization.slug}</Text></View><Text style={styles.chevron}>›</Text></Pressable>)}
        {isLoading ? <Text style={styles.emptyCopy}>Cargando iglesias…</Text> : null}
        {!isLoading && organizations.length === 0 ? <Text style={styles.emptyCopy}>Aún no perteneces a ninguna iglesia.</Text> : null}
        <Pressable onPress={createOrganization} style={styles.row}><Text style={styles.addMark}>＋</Text><Text style={[styles.rowTitle, { flex: 1 }]}>Crear organización</Text><Text style={styles.chevron}>›</Text></Pressable>
      </View>}
      <Text style={styles.label}>MIS INSTRUMENTOS</Text>
      <View style={styles.group}>{instruments.map((instrument) => <View key={instrument.id} style={styles.row}><View style={{ flex: 1 }}><Text style={styles.rowTitle}>{instrument.instrumentName}</Text><Text style={styles.rowCopy}>{instrument.organizationName} · {instrument.transpositionKey ?? 'C'}</Text></View>{instrument.isPrimary ? <Text style={styles.primary}>PRINCIPAL</Text> : null}</View>)}{!instruments.length ? <View style={styles.row}><View style={{ flex: 1 }}><Text style={styles.rowTitle}>Sin instrumentos asignados</Text><Text style={styles.rowCopy}>{accessMode === 'authenticated' ? 'Un líder puede asignarlos dentro de cada iglesia' : 'Los instrumentos de iglesia requieren una cuenta'}</Text></View></View> : null}</View>
      <Text style={styles.label}>PREFERENCIAS</Text>
      <View style={styles.group}><View style={styles.row}><Text style={[styles.rowTitle, { flex: 1 }]}>Notación predeterminada</Text><Text style={styles.rowCopy}>Americana</Text></View><View style={styles.row}><Text style={[styles.rowTitle, { flex: 1 }]}>Almacenamiento</Text><Text style={styles.rowCopy}>{accessMode === 'authenticated' ? 'Local + Supabase' : 'Sólo local'}</Text></View></View>
      <Pressable onPress={() => router.push('/auth')} style={styles.signOut}><Text style={styles.signOutText}>{accessMode === 'authenticated' ? 'Gestionar cuenta' : 'Crear cuenta o iniciar sesión'}</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingBottom: spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#51252D' }, avatarText: { color: colors.text, fontSize: 20, fontWeight: '800' },
  name: { color: colors.text, fontFamily: 'serif', fontSize: 22, fontWeight: '600' }, email: { color: colors.textSecondary, fontSize: 12, marginTop: 4 }, plan: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: '#37251C', borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 4 }, planText: { color: '#D5AA79', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  label: { color: colors.textSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 1.6, marginTop: spacing.lg, marginBottom: 10 },
  org: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: radii.md, padding: 16, borderWidth: 1, borderColor: colors.border }, orgMark: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#2A1B1E', alignItems: 'center', justifyContent: 'center' }, orgLetter: { color: colors.accent, fontFamily: 'serif', fontSize: 24 },
  group: { borderRadius: radii.md, backgroundColor: colors.surface, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border }, row: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, rowTitle: { color: colors.text, fontSize: 14, fontWeight: '600' }, rowCopy: { color: colors.textSecondary, fontSize: 11, marginTop: 4 }, chevron: { color: colors.textSecondary, fontSize: 23 }, primary: { color: colors.accent, fontSize: 8, fontWeight: '900', letterSpacing: 1 }, emptyCopy: { color: colors.textSecondary, fontSize: 12, paddingVertical: 18 }, addMark: { color: colors.accent, fontSize: 20 },
  signOut: { marginTop: spacing.lg, alignItems: 'center', padding: 14 }, signOutText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
});
