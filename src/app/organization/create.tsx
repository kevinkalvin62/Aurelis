import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { colors, radii, spacing } from '@/constants/design';
import { createOrganization, slugifyOrganization } from '@/features/organizations/organization-service';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/store/toast-store';
import type { OrganizationType } from '@/types/domain';

const organizationTypes: { value: OrganizationType; label: string }[] = [
  { value: 'church', label: 'Iglesia' }, { value: 'band', label: 'Banda' },
  { value: 'school', label: 'Escuela' }, { value: 'choir', label: 'Coro' },
  { value: 'group', label: 'Grupo' }, { value: 'personal', label: 'Proyecto personal' },
];

export default function CreateOrganizationScreen() {
  const queryClient = useQueryClient();
  const accessMode = useAuthStore((state) => state.accessMode);
  useEffect(() => { if (accessMode === 'guest') { toast.warning('Necesitas iniciar sesión para usar esta función.'); router.replace('/auth'); } }, [accessMode]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState<OrganizationType>('church');
  const [editedSlug, setEditedSlug] = useState(false);
  const [saving, setSaving] = useState(false);
  const changeName = (value: string) => { setName(value); if (!editedSlug) setSlug(slugifyOrganization(value)); };
  const submit = async () => {
    if (accessMode !== 'authenticated') { toast.warning('Necesitas iniciar sesión para usar esta función.'); router.replace('/auth'); return; }
    if (name.trim().length < 2 || slug.length < 2) { toast.error('Escribe un nombre válido para la organización.'); return; }
    setSaving(true);
    const result = await createOrganization(name.trim(), slug, type);
    setSaving(false);
    if (!result.data) { toast.error(result.error ?? 'No fue posible crear la organización.'); return; }
    await queryClient.invalidateQueries({ queryKey: ['organizations'] });
    toast.success('Organización creada. Ahora eres el owner.');
    router.replace({ pathname: '/organization/[id]', params: { id: result.data.id } });
  };
  return <SafeAreaView style={styles.safe}><View style={styles.nav}><Pressable onPress={() => router.back()}><Text style={styles.cancel}>Cancelar</Text></Pressable><Text style={styles.navTitle}>Nueva organización</Text><Button label={saving ? 'Creando…' : 'Crear'} compact disabled={saving} onPress={submit} /></View><View style={styles.content}>
    <Text style={styles.eyebrow}>ORGANIZACIÓN</Text><Text style={styles.title}>Crea tu espacio</Text><Text style={styles.copy}>Tendrás una biblioteca y un espacio privado para tu equipo. Tu rol inicial será owner.</Text>
    <Text style={styles.label}>TIPO</Text><View style={styles.typeOptions}>{organizationTypes.map((option) => <Pressable key={option.value} onPress={() => setType(option.value)} style={[styles.typeOption, type === option.value && styles.typeActive]}><Text style={[styles.typeText, type === option.value && styles.typeTextActive]}>{option.label}</Text></Pressable>)}</View>
    <Text style={styles.label}>NOMBRE</Text><TextInput value={name} onChangeText={changeName} placeholder="Nombre de tu grupo" placeholderTextColor="#77706C" style={styles.input} />
    <Text style={styles.label}>IDENTIFICADOR</Text><View style={styles.slugRow}><Text style={styles.at}>@</Text><TextInput value={slug} onChangeText={(value) => { setEditedSlug(true); setSlug(slugifyOrganization(value)); }} placeholder="mi-grupo" placeholderTextColor="#77706C" autoCapitalize="none" style={styles.slugInput} /></View>
    <Text style={styles.hint}>Se usa para identificar tu organización. Puedes cambiar el nombre visible después.</Text>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, nav: { height: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, cancel: { color: colors.textSecondary, fontSize: 13 }, navTitle: { color: colors.text, fontSize: 14, fontWeight: '700' }, content: { padding: spacing.lg, width: '100%', maxWidth: 620, alignSelf: 'center' }, eyebrow: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginTop: 18 }, title: { color: colors.text, fontFamily: 'serif', fontSize: 30, fontWeight: '600', marginTop: 10 }, copy: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 20 }, label: { color: colors.textSecondary, fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 18, marginBottom: 8 }, typeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, typeOption: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, typeActive: { borderColor: colors.accent, backgroundColor: '#281A1D' }, typeText: { color: colors.textSecondary, fontSize: 10, fontWeight: '700' }, typeTextActive: { color: colors.text }, input: { height: 54, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, color: colors.text, paddingHorizontal: 16, fontSize: 15 }, slugRow: { height: 54, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: 16 }, at: { color: colors.accent, fontSize: 16, fontWeight: '800' }, slugInput: { flex: 1, color: colors.text, paddingHorizontal: 8, fontSize: 14 }, hint: { color: '#77706C', fontSize: 10, lineHeight: 15, marginTop: 8 } });
