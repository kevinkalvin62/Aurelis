import { useEffect, useMemo } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '@/constants/design';
import { getDisplayLines, transposeContent, transposeNotationChord } from '@/features/music-engine/notation';
import { usePlayerStore } from '@/store/player-store';
import { useSongStore } from '@/store/song-store';

export default function SongScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const songs = useSongStore((state) => state.songs);
  const song = songs.find((item) => item.id === id);
  const { semitones, setSemitones, fontScale, changeFontScale, presentationMode, togglePresentationMode } = usePlayerStore();
  const content = useMemo(() => song ? transposeContent(song.content, semitones, song.contentType, song.notation) : '', [semitones, song]);
  const displayLines = useMemo(() => song ? getDisplayLines(content, song.contentType, song.notation) : [], [content, song]);
  const key = song ? transposeNotationChord(song.key, semitones, song.notation) : '';
  useEffect(() => { setSemitones(0); }, [id, setSemitones]);

  if (!song) return <SafeAreaView style={styles.safe}><View style={styles.missing}><Text style={styles.missingTitle}>Canción no disponible</Text><Text style={styles.missingCopy}>Puede haber sido eliminada o todavía no se ha sincronizado.</Text><Pressable onPress={() => router.replace('/library')}><Text style={styles.missingAction}>Volver a la biblioteca</Text></Pressable></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}><Pressable onPress={() => router.back()} style={styles.navButton}><Text style={styles.navIcon}>‹</Text></Pressable><Text style={styles.navLabel}>BIBLIOTECA</Text><Pressable onPress={() => router.push({ pathname: '/editor', params: { id: song.id } })} style={styles.navButton}><Text style={styles.more}>•••</Text></Pressable></View>
      <ScrollView contentContainerStyle={[styles.scroll, presentationMode && styles.presentation]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Text style={styles.eyebrow}>{song.artist.toUpperCase()}</Text><Text style={styles.title}>{song.title}</Text><View style={styles.metadata}><Text style={styles.meta}>{key}</Text><View style={styles.dot} /><Text style={styles.meta}>{song.bpm} BPM</Text><View style={styles.dot} /><Text style={styles.meta}>{song.notation === 'latin' ? 'NOTACIÓN LATINA' : 'NOTACIÓN AMERICANA'}</Text></View></View>
        <View style={styles.songSheet}>
          {displayLines.map((line, index) => <Text key={`${index}-${line.value}`} selectable style={[styles.songLine, line.kind === 'chord' && styles.chordLine, line.kind === 'melody' && styles.melodyLine, line.kind === 'space' && styles.spaceLine, { fontSize: (line.kind === 'chord' ? 14 : 16) * fontScale, lineHeight: (line.kind === 'chord' ? 22 : 29) * fontScale }]}>{line.value || ' '}</Text>)}
        </View>
      </ScrollView>
      <View style={styles.controls}>
        <View style={styles.transpose}><Pressable onPress={() => setSemitones(semitones - 1)} style={styles.controlButton}><Text style={styles.controlText}>−</Text></Pressable><View style={styles.keyDisplay}><Text style={styles.keyCaption}>TONO</Text><Text style={styles.keyValue}>{key}</Text></View><Pressable onPress={() => setSemitones(semitones + 1)} style={styles.controlButton}><Text style={styles.controlText}>＋</Text></Pressable></View>
        <View style={styles.separator} /><Pressable onPress={() => changeFontScale(fontScale >= 1.2 ? -0.4 : 0.2)} style={styles.tool}><Text style={styles.toolText}>Aᴀ</Text></Pressable><Pressable onPress={togglePresentationMode} style={[styles.tool, presentationMode && styles.toolActive]}><Text style={styles.toolText}>↕</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, nav: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, navButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' }, navIcon: { color: colors.text, fontSize: 36, fontWeight: '200' }, navLabel: { color: colors.textSecondary, fontSize: 9, fontWeight: '900', letterSpacing: 1.6 }, more: { color: colors.text, fontSize: 16, letterSpacing: 2 },
  scroll: { paddingBottom: 140, width: '100%', maxWidth: 760, alignSelf: 'center' }, presentation: { paddingTop: spacing.xl }, header: { paddingHorizontal: spacing.lg, paddingTop: 28, paddingBottom: 26 }, eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.7 }, title: { color: colors.text, fontFamily: 'serif', fontSize: 34, fontWeight: '600', marginTop: 8 }, metadata: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }, meta: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' }, dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#625D59' },
  songSheet: { paddingHorizontal: spacing.lg, paddingVertical: 8 }, songLine: { color: colors.text, fontFamily: 'monospace', minHeight: 22, letterSpacing: 0.1 }, chordLine: { color: '#D06474', fontWeight: '800', minHeight: 18 }, melodyLine: { color: '#E8DDD6', letterSpacing: 0.65 }, spaceLine: { minHeight: 15 }, note: { marginTop: 34, marginHorizontal: spacing.lg, color: colors.textSecondary, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 }, directorNote: { flexDirection: 'row', margin: spacing.lg, marginTop: 12, padding: 16, backgroundColor: colors.surface, borderRadius: radii.sm }, noteRule: { width: 2, backgroundColor: colors.primary, marginRight: 12 }, noteCopy: { flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 19, fontStyle: 'italic' },
  controls: { position: 'absolute', left: 16, right: 16, bottom: 18, height: 72, maxWidth: 720, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: '#202020FA', borderRadius: radii.lg, borderWidth: 1, borderColor: '#363636', padding: 8, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 20, elevation: 12 }, transpose: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }, controlButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }, controlText: { color: colors.text, fontSize: 21 }, keyDisplay: { alignItems: 'center', minWidth: 54 }, keyCaption: { color: colors.textSecondary, fontSize: 7, fontWeight: '900', letterSpacing: 1.2 }, keyValue: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 2 }, separator: { width: 1, height: 36, backgroundColor: colors.border, marginHorizontal: 6 }, tool: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, toolActive: { backgroundColor: colors.primary }, toolText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }, missingTitle: { color: colors.text, fontFamily: 'serif', fontSize: 26, fontWeight: '600' }, missingCopy: { color: colors.textSecondary, textAlign: 'center', fontSize: 12, marginTop: 8 }, missingAction: { color: colors.accent, fontSize: 12, fontWeight: '800', marginTop: 20 },
});
