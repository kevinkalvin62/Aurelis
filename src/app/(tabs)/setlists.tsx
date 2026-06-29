import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { colors, radii, spacing } from '@/constants/design';
import { useSetlistStore } from '@/store/setlist-store';

export default function SetlistsScreen() {
  const setlists = useSetlistStore((state) => state.setlists);
  return <Screen eyebrow="PLANIFICA Y TOCA" title="Programas" subtitle="Crea listas locales o trabaja con el repertorio de tu iglesia.">
    <View style={styles.actions}>
      <Pressable onPress={() => router.push({ pathname: '/setlist/create', params: { mode: 'manual' } })} style={styles.action}><Text style={styles.actionMark}>＋</Text><Text style={styles.actionTitle}>Crear manualmente</Text><Text style={styles.actionCopy}>Elige y ordena canciones</Text></Pressable>
      <Pressable onPress={() => router.push({ pathname: '/setlist/create', params: { mode: 'import' } })} style={styles.action}><Text style={styles.actionMark}>⌁</Text><Text style={styles.actionTitle}>Pegar mensaje</Text><Text style={styles.actionCopy}>Detecta coincidencias</Text></Pressable>
    </View>
    <Text style={styles.label}>PROGRAMAS LOCALES</Text>
    {setlists.map((setlist) => <Pressable key={setlist.id} onPress={() => router.push({ pathname: '/setlist/[id]', params: { id: setlist.id } })} style={styles.card}><View style={styles.date}><Text style={styles.dateDay}>{setlist.serviceDate ? 'FECHA' : 'LOCAL'}</Text><Text style={styles.dateNumber}>{setlist.serviceDate?.slice(-2) ?? '—'}</Text></View><View style={{ flex: 1 }}><Text style={styles.title}>{setlist.title}</Text><Text style={styles.meta}>{setlist.serviceDate ?? 'Sin fecha'} · {setlist.songIds.length} canciones</Text></View><Text style={styles.chevron}>›</Text></Pressable>)}
    {!setlists.length ? <View style={styles.empty}><Text style={styles.emptyMark}>◎</Text><Text style={styles.emptyTitle}>Aún no tienes programas</Text><Text style={styles.emptyCopy}>Crea uno manualmente o pega una lista recibida por mensaje.</Text></View> : null}
  </Screen>;
}

const styles = StyleSheet.create({ actions: { flexDirection: 'row', gap: 10, marginBottom: spacing.lg }, action: { flex: 1, padding: 16, minHeight: 122, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#51252D' }, actionMark: { color: colors.accent, fontSize: 22 }, actionTitle: { color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 12 }, actionCopy: { color: colors.textSecondary, fontSize: 10, marginTop: 4 }, label: { color: colors.textSecondary, fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 }, card: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 9 }, date: { width: 50, height: 56, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, dateDay: { color: colors.textSecondary, fontSize: 7, fontWeight: '900' }, dateNumber: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 2 }, title: { color: colors.text, fontSize: 14, fontWeight: '700' }, meta: { color: colors.textSecondary, fontSize: 10, marginTop: 5 }, chevron: { color: colors.textSecondary, fontSize: 23 }, empty: { alignItems: 'center', padding: 30, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, emptyMark: { color: colors.accent, fontSize: 25 }, emptyTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 10 }, emptyCopy: { color: colors.textSecondary, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 5 } });
