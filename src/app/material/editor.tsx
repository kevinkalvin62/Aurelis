import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { colors, radii, spacing } from '@/constants/design';
import { listInstruments, saveInstrumentMaterial } from '@/features/organizations/organization-service';
import { toast } from '@/store/toast-store';

export default function MaterialEditorScreen() {
  const { songId = '', songTitle = 'Canción' } = useLocalSearchParams<{ organizationId: string; songId: string; songTitle?: string }>();
  const { data: instruments = [], isLoading } = useQuery({ queryKey: ['instruments'], queryFn: listInstruments });
  const [instrumentId, setInstrumentId] = useState('');
  const [key, setKey] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const instrument = instruments.find((item) => item.id === instrumentId) ?? instruments[0];

  useEffect(() => { if (!instrumentId && instruments[0]) setInstrumentId(instruments[0].id); }, [instrumentId, instruments]);

  const submit = async () => {
    if (!instrument) { toast.warning('No hay instrumentos disponibles.'); return; }
    setSaving(true);
    const materialKey = key || instrument.transpositionKey;
    const error = await saveInstrumentMaterial({ songId, instrumentId: instrument.id, ...(materialKey ? { key: materialKey } : {}), ...(content ? { contentRaw: content } : {}), ...(notes ? { notes } : {}) });
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success('Material de instrumento guardado.');
    router.back();
  };

  return <SafeAreaView style={styles.safe}><View style={styles.nav}><Pressable onPress={() => router.back()}><Text style={styles.cancel}>Cancelar</Text></Pressable><Text style={styles.navTitle}>Material</Text><Button compact label={saving ? 'Guardando…' : 'Guardar'} disabled={saving || !instrument} onPress={submit} /></View><ScrollView contentContainerStyle={styles.content}><Text style={styles.eyebrow}>MATERIAL POR INSTRUMENTO</Text><Text style={styles.title}>{songTitle}</Text><Text style={styles.label}>INSTRUMENTO</Text>{isLoading ? <Text style={styles.empty}>Cargando instrumentos…</Text> : instruments.length ? <View style={styles.options}>{instruments.map((option) => <Pressable key={option.id} onPress={() => { setInstrumentId(option.id); if (!key) setKey(option.transpositionKey ?? ''); }} style={[styles.option, instrument?.id === option.id && styles.optionActive]}><Text style={styles.optionText}>{option.name}</Text><Text style={styles.optionKey}>{option.transpositionKey ?? 'C'}</Text></Pressable>)}</View> : <Text style={styles.empty}>No hay instrumentos registrados en Supabase.</Text>}<Text style={styles.label}>TONALIDAD / TRANSPOSICIÓN</Text><TextInput value={key} onChangeText={setKey} placeholder={instrument?.transpositionKey ?? 'C'} placeholderTextColor="#77706C" style={styles.input} /><Text style={styles.label}>CONTENIDO ESPECÍFICO</Text><TextInput multiline value={content} onChangeText={setContent} placeholder="Partitura textual, secuencia de notas o indicaciones" placeholderTextColor="#77706C" style={[styles.input, styles.contentInput]} /><Text style={styles.label}>NOTAS</Text><TextInput multiline value={notes} onChangeText={setNotes} placeholder="Notas para este instrumento" placeholderTextColor="#77706C" style={[styles.input, styles.notesInput]} /></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, nav: { height: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, cancel: { color: colors.textSecondary, fontSize: 13 }, navTitle: { color: colors.text, fontSize: 14, fontWeight: '700' }, content: { padding: spacing.lg, paddingBottom: 80, width: '100%', maxWidth: 650, alignSelf: 'center' }, eyebrow: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 }, title: { color: colors.text, fontFamily: 'serif', fontSize: 29, fontWeight: '600', marginTop: 8 }, label: { color: colors.textSecondary, fontSize: 9, fontWeight: '900', letterSpacing: 1.3, marginTop: 20, marginBottom: 8 }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, option: { flexDirection: 'row', gap: 7, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border }, optionActive: { borderColor: colors.accent, backgroundColor: '#281A1D' }, optionText: { color: colors.text, fontSize: 10 }, optionKey: { color: colors.accent, fontSize: 9, fontWeight: '800' }, input: { minHeight: 50, paddingHorizontal: 14, color: colors.text, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md }, contentInput: { minHeight: 190, paddingTop: 14, textAlignVertical: 'top', fontFamily: 'monospace' }, notesInput: { minHeight: 90, paddingTop: 14, textAlignVertical: 'top' }, empty: { color: colors.textSecondary, fontSize: 11 } });
