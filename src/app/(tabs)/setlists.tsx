import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { colors, radii, spacing } from '@/constants/design';
import { useSetlistStore } from '@/store/setlist-store';
import { useSongStore } from '@/store/song-store';

export default function SetlistsScreen() {
  const songs = useSongStore((state) => state.songs);
  const setlists = useSetlistStore((state) => state.setlists);
  const createFromMessage = useSetlistStore((state) => state.createFromMessage);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const detected = message.split('\n').map((line) => line.trim()).filter(Boolean);
  const createSetlist = () => {
    if (detected.length === 0) return;
    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const requested = new Set(detected.slice(1).map(normalize));
    const songIds = songs.filter((song) => requested.has(normalize(song.title))).map((song) => song.id);
    createFromMessage(detected, songIds);
    setImporting(false);
  };

  return (
    <Screen eyebrow="PLANIFICA Y TOCA" title="Setlists" subtitle="Todos reciben la misma versión, siempre.">
      <Pressable onPress={() => setImporting((value) => !value)} style={styles.importCard}>
        <View style={styles.importIcon}><Text style={styles.importIconText}>⌁</Text></View>
        <View style={{ flex: 1 }}><Text style={styles.importTitle}>Importar desde un mensaje</Text><Text style={styles.importCopy}>Pega una lista de WhatsApp y Aurelis hará el resto.</Text></View>
        <Text style={styles.chevron}>{importing ? '⌃' : '›'}</Text>
      </Pressable>
      {importing ? <View style={styles.importPanel}><TextInput multiline value={message} onChangeText={setMessage} style={styles.messageInput} placeholder="Título del programa\nCanción 1\nCanción 2" placeholderTextColor={colors.textSecondary} /><Text style={styles.detected}>{Math.max(0, detected.length - 1)} canciones detectadas</Text><Button label="Crear setlist" disabled={detected.length === 0} onPress={createSetlist} /></View> : null}

      <Text style={styles.label}>TUS PROGRAMAS</Text>
      {setlists.map((setlist, index) => (
        <Pressable key={setlist.id} disabled={!setlist.songIds[0]} onPress={() => setlist.songIds[0] && router.push({ pathname: '/song/[id]', params: { id: setlist.songIds[0] } })} style={styles.card}>
          <View style={[styles.date, index > 0 && { backgroundColor: colors.surfaceElevated }]}><Text style={styles.dateDay}>{setlist.dateLabel.split(' · ')[0]}</Text><Text style={styles.dateNumber}>{setlist.dateLabel === 'SIN FECHA' ? '—' : index === 0 ? '05' : '10'}</Text><Text style={styles.dateMonth}>{setlist.dateLabel === 'SIN FECHA' ? '' : 'JUL'}</Text></View>
          <View style={{ flex: 1 }}><Text style={styles.title}>{setlist.title}</Text><Text style={styles.meta}>{setlist.time} · {setlist.location}</Text><View style={styles.stats}><Text style={styles.stat}>{setlist.songIds.length} canciones</Text><Text style={styles.stat}>·</Text><Text style={styles.stat}>{setlist.peopleCount} músicos</Text></View></View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
      {setlists.length === 0 ? <View style={styles.draft}><Text style={styles.draftMark}>◎</Text><View style={{ flex: 1 }}><Text style={styles.title}>Aún no tienes programas</Text><Text style={styles.meta}>{songs.length ? 'Importa una lista o créala manualmente.' : 'Primero crea canciones en tu biblioteca.'}</Text></View></View> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  importCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radii.md, borderWidth: 1, borderColor: '#51252D', backgroundColor: '#211719', marginBottom: spacing.md },
  importIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  importIconText: { color: colors.text, fontSize: 22 }, importTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  importCopy: { color: colors.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 4 }, chevron: { color: colors.textSecondary, fontSize: 24 },
  importPanel: { padding: 16, backgroundColor: colors.surface, borderRadius: radii.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  messageInput: { minHeight: 116, borderRadius: radii.sm, backgroundColor: colors.background, color: colors.text, padding: 12, textAlignVertical: 'top', fontSize: 13 },
  detected: { color: colors.success, fontSize: 11, fontWeight: '700', marginVertical: 10 },
  label: { color: colors.textSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 1.6, marginTop: spacing.lg, marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 14, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  date: { width: 54, height: 66, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  dateDay: { color: colors.textSecondary, fontSize: 8, fontWeight: '800' }, dateNumber: { color: colors.text, fontSize: 23, fontWeight: '800', lineHeight: 27 }, dateMonth: { color: colors.textSecondary, fontSize: 8, fontWeight: '800' },
  title: { color: colors.text, fontSize: 15, fontWeight: '700' }, meta: { color: colors.textSecondary, fontSize: 11, marginTop: 5 }, stats: { flexDirection: 'row', gap: 7, marginTop: 11 }, stat: { color: '#8D8681', fontSize: 10 },
  draft: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  draftMark: { color: colors.accent, fontSize: 24 },
});
