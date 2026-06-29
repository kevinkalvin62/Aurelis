import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { SectionTitle } from '@/components/ui/section-title';
import { SongRow } from '@/components/song-row';
import { colors, radii, spacing } from '@/constants/design';
import { useSetlistStore } from '@/store/setlist-store';
import { useSongStore } from '@/store/song-store';
import { useAuthStore } from '@/store/auth-store';

export default function HomeScreen() {
  const songs = useSongStore((state) => state.songs);
  const setlists = useSetlistStore((state) => state.setlists);
  const { accessMode, user } = useAuthStore();
  const next = setlists[0];
  const displayName = accessMode === 'guest' ? 'Invitado' : user?.name || 'Músico';
  const initials = accessMode === 'guest' ? 'IN' : displayName.slice(0, 2).toUpperCase();
  const dateLabel = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toUpperCase();
  return (
    <Screen eyebrow={dateLabel} title={`Buenas tardes, ${displayName}`} subtitle="Tu música, ordenada y lista para tocar." right={<View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>}>
      {next ? <Pressable onPress={() => router.push('/setlists')} style={({ pressed }) => pressed && { opacity: 0.85 }}>
        <LinearGradient colors={['#35151B', '#1B1717']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroTop}><Text style={styles.heroEyebrow}>PRÓXIMO SERVICIO</Text><View style={styles.liveDot} /></View>
          <Text style={styles.heroTitle}>{next.title}</Text>
          <Text style={styles.heroMeta}>{next.dateLabel}  ·  {next.time}  ·  {next.location}</Text>
          <View style={styles.heroBottom}>
            <View><Text style={styles.heroNumber}>{next.songIds.length}</Text><Text style={styles.heroCaption}>CANCIONES</Text></View>
            <View style={styles.rule} />
            <View><Text style={styles.heroNumber}>{next.peopleCount}</Text><Text style={styles.heroCaption}>MÚSICOS</Text></View>
            <Button label="Abrir setlist  ›" compact style={{ marginLeft: 'auto' }} />
          </View>
        </LinearGradient>
      </Pressable> : <Pressable onPress={() => router.push('/setlists')} style={styles.emptyHero}><Text style={styles.heroEyebrow}>TU PRÓXIMO PROGRAMA</Text><Text style={styles.emptyHeroTitle}>Aún no tienes programas</Text><Text style={styles.emptyHeroCopy}>Crea una lista local o inicia sesión para trabajar con tu iglesia.</Text></Pressable>}

      <View style={styles.quickRow}>
        <Pressable onPress={() => router.push('/editor')} style={styles.quickCard}><Text style={styles.quickMark}>＋</Text><Text style={styles.quickTitle}>Nueva canción</Text><Text style={styles.quickCopy}>Letra y acordes</Text></Pressable>
        <Pressable onPress={() => router.push('/library')} style={styles.quickCard}><Text style={styles.quickMark}>♯</Text><Text style={styles.quickTitle}>Transportar</Text><Text style={styles.quickCopy}>Cualquier tonalidad</Text></Pressable>
      </View>

      <SectionTitle title={songs.length ? 'Continúa practicando' : 'Tu repertorio'} {...(songs.length ? { action: 'Ver biblioteca' } : {})} />
      {songs.length ? <View style={styles.list}>{songs.slice(0, 3).map((song) => <SongRow key={song.id} song={song} />)}</View> : <Pressable onPress={() => router.push('/editor')} style={styles.emptyLibrary}><Text style={styles.insightMark}>A</Text><View style={{ flex: 1 }}><Text style={styles.insightTitle}>Crea tu primera canción</Text><Text style={styles.insightCopy}>Puedes escribir letra, acordes o una secuencia para viento.</Text></View><Text style={styles.chevron}>›</Text></Pressable>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white14 },
  avatarText: { color: colors.text, fontWeight: '800', fontSize: 12 },
  hero: { borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: '#51252D', marginBottom: spacing.md },
  emptyHero: { borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: '#51252D', backgroundColor: '#1D1718', marginBottom: spacing.md }, emptyHeroTitle: { color: colors.text, fontFamily: 'serif', fontSize: 23, fontWeight: '600', marginTop: 12 }, emptyHeroCopy: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 8 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  heroEyebrow: { color: '#D38B96', fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#D38B96' },
  heroTitle: { color: colors.text, fontFamily: 'serif', fontSize: 27, fontWeight: '600' },
  heroMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 9 },
  heroBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 28, gap: 14 },
  heroNumber: { color: colors.text, fontSize: 18, fontWeight: '800' },
  heroCaption: { color: colors.textSecondary, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  rule: { height: 30, width: 1, backgroundColor: colors.white14 },
  quickRow: { flexDirection: 'row', gap: 12, marginBottom: spacing.xl },
  quickCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 16 },
  quickMark: { color: colors.accent, fontSize: 22, height: 28 },
  quickTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 10 },
  quickCopy: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  list: { backgroundColor: colors.surface, borderRadius: radii.md, paddingHorizontal: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  insight: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radii.md, backgroundColor: '#181D1B', borderWidth: 1, borderColor: '#26352F' },
  emptyLibrary: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  insightMark: { color: '#80B19C', fontFamily: 'serif', fontSize: 22 },
  insightTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  insightCopy: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  chevron: { color: colors.textSecondary, fontSize: 24 },
});
