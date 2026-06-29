import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { colors, radii, spacing } from '@/constants/design';
import { listOrganizationSongs } from '@/features/organizations/organization-service';
import { createRemoteSetlist } from '@/features/setlists/setlist-service';
import { parsePastedSetlist } from '@/features/setlists/parser';
import { useAuthStore } from '@/store/auth-store';
import { useSetlistStore } from '@/store/setlist-store';
import { useSongStore } from '@/store/song-store';
import { toast } from '@/store/toast-store';
import type { Song } from '@/types/domain';

type Mode = 'manual' | 'import';

export default function CreateSetlistScreen() {
  const { organizationId, mode: initialMode } = useLocalSearchParams<{ organizationId?: string; mode?: Mode }>();
  const accessMode = useAuthStore((state) => state.accessMode); const queryClient = useQueryClient();
  const allLocalSongs = useSongStore((state) => state.songs);
  const localSongs = useMemo(() => allLocalSongs.filter((song) => !song.organizationId), [allLocalSongs]);
  const createLocal = useSetlistStore((state) => state.createSetlist);
  const { data: organizationSongs = [] } = useQuery({ queryKey: ['organization-songs', organizationId], queryFn: () => listOrganizationSongs(organizationId!), enabled: Boolean(organizationId && accessMode === 'authenticated') });
  const songs = organizationId ? organizationSongs : localSongs;
  const [mode, setMode] = useState<Mode>(initialMode === 'import' ? 'import' : 'manual'); const [title, setTitle] = useState(''); const [date, setDate] = useState(''); const [notes, setNotes] = useState(''); const [source, setSource] = useState(''); const [selected, setSelected] = useState<string[]>([]); const [saving, setSaving] = useState(false);
  const parsed = useMemo(() => parsePastedSetlist(source, songs), [source, songs]); const matches = parsed.matches;

  const toggleSong = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const importMatches = () => { if (!title && parsed.title) setTitle(parsed.title); setSelected(matches.flatMap((match) => match.song ? [match.song.id] : [])); toast.info(`${matches.filter((match) => match.song).length} coincidencias confirmadas.`); };
  const move = (id: string, delta: number) => setSelected((current) => { const index = current.indexOf(id); const next = index + delta; if (index < 0 || next < 0 || next >= current.length) return current; const copy = [...current]; [copy[index], copy[next]] = [copy[next]!, copy[index]!]; return copy; });
  const submit = async () => {
    if (title.trim().length < 2) { toast.error('Escribe un título para el programa.'); return; }
    if (!selected.length) { toast.warning('Selecciona al menos una canción.'); return; }
    const orderedSongs = selected.map((id) => songs.find((song) => song.id === id)).filter((song): song is Song => Boolean(song)); setSaving(true);
    if (organizationId) {
      if (accessMode !== 'authenticated') { setSaving(false); toast.warning('Necesitas iniciar sesión para usar esta función.'); router.replace('/auth'); return; }
      const remoteSongs = orderedSongs.filter((song): song is Song & { remoteId: string } => Boolean(song.remoteId));
      if (remoteSongs.length !== orderedSongs.length) { setSaving(false); toast.error('Todas las canciones deben pertenecer a la biblioteca de la iglesia.'); return; }
      const result = await createRemoteSetlist({ organizationId, title: title.trim(), ...(date ? { serviceDate: date } : {}), ...(notes ? { notes } : {}), ...(mode === 'import' ? { sourceText: source } : {}), songs: remoteSongs.map((song) => ({ remoteId: song.remoteId, key: song.currentKey ?? song.key })) }); setSaving(false);
      if (!result.id) { toast.error(result.error ?? 'No fue posible crear el programa.'); return; }
      await queryClient.invalidateQueries({ queryKey: ['organization-setlists', organizationId] }); toast.success('Programa guardado en la iglesia.'); router.replace({ pathname: '/setlist/[id]', params: { id: result.id, organizationId } }); return;
    }
    const created = createLocal({ title: title.trim(), ...(date ? { serviceDate: date } : {}), ...(notes ? { notes } : {}), ...(mode === 'import' ? { sourceText: source } : {}), songIds: selected }); setSaving(false); toast.success('Programa guardado en este dispositivo.'); router.replace({ pathname: '/setlist/[id]', params: { id: created.id } });
  };

  return <SafeAreaView style={styles.safe}><View style={styles.nav}><Pressable onPress={() => router.back()}><Text style={styles.cancel}>Cancelar</Text></Pressable><Text style={styles.navTitle}>Nuevo programa</Text><Button label={saving ? 'Guardando…' : 'Guardar'} compact disabled={saving} onPress={submit} /></View><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.modeTabs}><Pressable onPress={() => setMode('manual')} style={[styles.mode, mode === 'manual' && styles.modeActive]}><Text style={styles.modeText}>Manual</Text></Pressable><Pressable onPress={() => setMode('import')} style={[styles.mode, mode === 'import' && styles.modeActive]}><Text style={styles.modeText}>Pegar lista</Text></Pressable></View>
    <Text style={styles.label}>TÍTULO</Text><TextInput value={title} onChangeText={setTitle} placeholder="Domingo AM" placeholderTextColor="#77706C" style={styles.input} />
    <View style={styles.twoCols}><View style={{ flex: 1 }}><Text style={styles.label}>FECHA</Text><TextInput value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" placeholderTextColor="#77706C" style={styles.input} /></View><View style={{ flex: 1 }}><Text style={styles.label}>CONTEXTO</Text><View style={styles.context}><Text style={styles.contextText}>{organizationId ? 'Iglesia' : 'Local'}</Text></View></View></View>
    <Text style={styles.label}>NOTAS GENERALES</Text><TextInput multiline value={notes} onChangeText={setNotes} placeholder="Indicaciones para el equipo" placeholderTextColor="#77706C" style={[styles.input, styles.notes]} />
    {mode === 'import' ? <><Text style={styles.label}>MENSAJE DE WHATSAPP</Text><TextInput multiline value={source} onChangeText={setSource} placeholder="Domingo AM\nCanción uno\nCanción dos" placeholderTextColor="#77706C" style={[styles.input, styles.source]} /><Button label="Detectar coincidencias" variant="secondary" onPress={importMatches} /><View style={styles.matches}>{matches.map((match, index) => <View key={`${match.line}-${index}`} style={styles.match}><View style={{ flex: 1 }}><Text style={styles.matchLine}>{match.line}</Text><Text style={[styles.matchResult, !match.song && styles.unmatched]}>{match.song ? `Coincide con: ${match.song.title}` : 'Sin coincidencia'}</Text></View>{match.song ? <Pressable onPress={() => toggleSong(match.song!.id)} style={[styles.check, selected.includes(match.song.id) && styles.checked]}><Text style={styles.checkText}>{selected.includes(match.song.id) ? '✓' : '+'}</Text></Pressable> : null}</View>)}</View></> : null}
    <View style={styles.songHeader}><Text style={styles.label}>{mode === 'manual' ? 'SELECCIONAR CANCIONES' : 'ORDEN CONFIRMADO'}</Text><Text style={styles.count}>{selected.length} seleccionadas</Text></View>
    {mode === 'manual' ? songs.map((song) => <Pressable key={song.id} onPress={() => toggleSong(song.id)} style={[styles.songRow, selected.includes(song.id) && styles.songSelected]}><View style={{ flex: 1 }}><Text style={styles.songTitle}>{song.title}</Text><Text style={styles.songMeta}>{song.artist || 'Sin autor'} · {song.key}</Text></View><View style={[styles.check, selected.includes(song.id) && styles.checked]}><Text style={styles.checkText}>{selected.includes(song.id) ? '✓' : '+'}</Text></View></Pressable>) : null}
    {selected.map((id, index) => { const song = songs.find((item) => item.id === id); return song ? <View key={id} style={styles.ordered}><Text style={styles.position}>{index + 1}</Text><Text style={[styles.songTitle, { flex: 1 }]}>{song.title}</Text><Pressable onPress={() => move(id, -1)}><Text style={styles.arrow}>↑</Text></Pressable><Pressable onPress={() => move(id, 1)}><Text style={styles.arrow}>↓</Text></Pressable></View> : null; })}
    {!songs.length ? <Text style={styles.empty}>No hay canciones disponibles en esta biblioteca.</Text> : null}
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, nav: { height: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, cancel: { color: colors.textSecondary, fontSize: 13 }, navTitle: { color: colors.text, fontSize: 14, fontWeight: '700' }, content: { padding: spacing.lg, paddingBottom: 100, width: '100%', maxWidth: 680, alignSelf: 'center' }, modeTabs: { flexDirection: 'row', padding: 3, backgroundColor: colors.surface, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border }, mode: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 7 }, modeActive: { backgroundColor: colors.surfaceElevated }, modeText: { color: colors.text, fontSize: 11, fontWeight: '700' }, label: { color: colors.textSecondary, fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 18, marginBottom: 8 }, input: { minHeight: 50, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, color: colors.text, paddingHorizontal: 14, fontSize: 13 }, notes: { minHeight: 76, paddingTop: 12, textAlignVertical: 'top' }, source: { minHeight: 130, paddingTop: 12, textAlignVertical: 'top', fontFamily: 'monospace', marginBottom: 10 }, twoCols: { flexDirection: 'row', gap: 10 }, context: { height: 50, justifyContent: 'center', paddingHorizontal: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md }, contextText: { color: colors.accent, fontSize: 12, fontWeight: '700' }, matches: { marginTop: 10 }, match: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, matchLine: { color: colors.text, fontSize: 12 }, matchResult: { color: colors.success, fontSize: 9, marginTop: 3 }, unmatched: { color: colors.warning }, check: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: colors.primary, borderColor: colors.primary }, checkText: { color: colors.text, fontWeight: '800' }, songHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, count: { color: colors.textSecondary, fontSize: 9, marginBottom: 8 }, songRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', padding: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: 7, borderRadius: radii.md }, songSelected: { borderColor: colors.accent }, songTitle: { color: colors.text, fontSize: 13, fontWeight: '700' }, songMeta: { color: colors.textSecondary, fontSize: 10, marginTop: 4 }, ordered: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, position: { color: colors.accent, fontSize: 11, fontWeight: '800', width: 20 }, arrow: { color: colors.textSecondary, fontSize: 18, padding: 8 }, empty: { color: colors.textSecondary, textAlign: 'center', padding: 28 } });
