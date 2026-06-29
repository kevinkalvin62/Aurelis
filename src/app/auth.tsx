import { useState } from 'react';
import { CormorantGaramond_600SemiBold_Italic, useFonts } from '@expo-google-fonts/cormorant-garamond';
import { Controller, useForm } from 'react-hook-form';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { colors, radii, spacing } from '@/constants/design';
import { ensureProfile } from '@/features/auth/profile-service';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/store/toast-store';

interface AuthForm { displayName: string; email: string; password: string }

function friendlyAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) return 'El correo o la contraseña no son correctos.';
  if (normalized.includes('email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.';
  if (normalized.includes('user already registered') || normalized.includes('already been registered')) return 'Este correo ya tiene una cuenta. Inicia sesión.';
  if (normalized.includes('password')) return 'La contraseña debe tener al menos 8 caracteres.';
  if (normalized.includes('rate limit')) return 'Demasiados intentos. Espera un momento y vuelve a probar.';
  return message;
}

export default function AuthScreen() {
  const [fontsLoaded] = useFonts({ CormorantGaramond_600SemiBold_Italic });
  const { accessMode, user, continueAsGuest, setAuthenticated, clearAccess } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, getValues, formState: { errors } } = useForm<AuthForm>({ defaultValues: { displayName: '', email: '', password: '' } });

  const enterAsGuest = () => { continueAsGuest(); router.replace('/'); };
  const submit = handleSubmit(async ({ displayName, email, password }) => {
    if (!isSupabaseConfigured) { toast.error('La conexión con Supabase no está configurada.'); return; }
    setLoading(true); setMessage(''); setSuccess(false);
    const cleanEmail = email.trim();
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: cleanEmail, password })
      : await supabase.auth.signUp({ email: cleanEmail, password, options: { data: { display_name: displayName.trim() } } });
    setLoading(false);
    if (result.error) { const friendly = friendlyAuthError(result.error.message); setMessage(friendly); toast.error(friendly); return; }
    if (result.data.session?.user) {
      const signedUser = result.data.session.user;
      const profile = await ensureProfile(signedUser, displayName);
      setAuthenticated({ id: signedUser.id, email: signedUser.email ?? cleanEmail, name: profile?.displayName || displayName.trim() || cleanEmail.split('@')[0] || 'Músico' });
      toast.success(mode === 'register' ? 'Cuenta creada correctamente.' : 'Sesión iniciada.');
      router.replace('/');
      return;
    }
    setSuccess(true); setMessage('Revisa tu correo para confirmar tu cuenta. Después vuelve aquí para iniciar sesión.');
    toast.info('Revisa tu correo para confirmar tu cuenta.');
  }, () => toast.error('Revisa los campos obligatorios.'));

  const resetPassword = async () => {
    const email = getValues('email').trim();
    if (!email.includes('@')) { toast.warning('Escribe primero tu correo electrónico.'); return; }
    setLoading(true); const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: Linking.createURL('/reset-password') }); setLoading(false);
    const text = error ? friendlyAuthError(error.message) : 'Te enviamos un enlace para recuperar tu contraseña.';
    setSuccess(!error); setMessage(text); error ? toast.error(text) : toast.success(text);
  };

  const signOut = async () => {
    setLoading(true); await supabase.auth.signOut(); clearAccess(); setLoading(false); toast.info('Sesión cerrada. Tus datos locales siguen en este dispositivo.');
  };

  if (!fontsLoaded) return <SafeAreaView style={styles.safe}><ActivityIndicator color={colors.accent} style={{ flex: 1 }} /></SafeAreaView>;
  if (accessMode === 'authenticated' && user) return <SafeAreaView style={styles.safe}><View style={styles.container}>
    <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
    <Brand />
    <View style={styles.accountCard}><Text style={styles.accountEyebrow}>CUENTA CONECTADA</Text><Text style={styles.accountName}>{user.name}</Text><Text style={styles.copy}>{user.email}</Text><Text style={styles.syncCopy}>Tus canciones personales se sincronizan con Supabase cuando hay conexión.</Text>{loading ? <ActivityIndicator color={colors.accent} /> : <Button label="Cerrar sesión" variant="secondary" onPress={signOut} />}</View>
  </View></SafeAreaView>;

  return <SafeAreaView style={styles.safe}><View style={styles.container}>
    {accessMode === 'guest' ? <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable> : <View style={styles.back} />}
    <Brand />
    <View style={styles.form}><Text style={styles.title}>{mode === 'login' ? 'Bienvenido' : 'Crea tu biblioteca'}</Text><Text style={styles.copy}>{mode === 'login' ? 'Inicia sesión para sincronizar tu música entre dispositivos.' : 'Crea una cuenta y lleva tu repertorio a cualquier lugar.'}</Text>
      {mode === 'register' ? <Controller control={control} name="displayName" rules={{ required: true, minLength: 2 }} render={({ field: { value, onChange } }) => <TextInput value={value} onChangeText={onChange} placeholder="Tu nombre" placeholderTextColor="#77706C" autoCapitalize="words" style={[styles.input, errors.displayName && styles.inputError]} />} /> : null}
      <Controller control={control} name="email" rules={{ required: true, pattern: /\S+@\S+\.\S+/ }} render={({ field: { value, onChange } }) => <TextInput value={value} onChangeText={onChange} placeholder="Correo electrónico" placeholderTextColor="#77706C" keyboardType="email-address" autoCapitalize="none" autoComplete="email" style={[styles.input, errors.email && styles.inputError]} />} />
      <Controller control={control} name="password" rules={{ required: true, minLength: 8 }} render={({ field: { value, onChange } }) => <TextInput value={value} onChangeText={onChange} placeholder="Contraseña (8+ caracteres)" placeholderTextColor="#77706C" secureTextEntry autoComplete={mode === 'login' ? 'current-password' : 'new-password'} style={[styles.input, errors.password && styles.inputError]} />} />
      {message ? <Text style={[styles.message, success && styles.success]}>{message}</Text> : null}
      {loading ? <ActivityIndicator color={colors.accent} style={{ height: 48 }} /> : <Button label={mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'} onPress={submit} />}
      {mode === 'login' ? <Pressable onPress={resetPassword}><Text style={styles.linkText}>Olvidé mi contraseña</Text></Pressable> : null}
      <Pressable onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(''); setSuccess(false); }}><Text style={styles.switchText}>{mode === 'login' ? '¿Aún no tienes cuenta? Crear cuenta' : 'Ya tengo cuenta · Iniciar sesión'}</Text></Pressable>
      <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>O</Text><View style={styles.line} /></View>
      <Button label={accessMode === 'guest' ? 'Seguir como invitado' : 'Continuar como invitado'} variant="secondary" onPress={enterAsGuest} />
      <Text style={styles.guestCopy}>Sin cuenta. Tus canciones se guardarán sólo en este dispositivo y podrás sincronizarlas más adelante.</Text>
    </View>
  </View></SafeAreaView>;
}

function Brand() { return <View style={styles.brand}><View style={styles.mark}><Text style={styles.markText}>A</Text></View><Text style={styles.wordmark}>Aurelis</Text><Text style={styles.tagline}>Tu repertorio. Una sola verdad.</Text></View>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, container: { flex: 1, padding: spacing.lg, width: '100%', maxWidth: 520, alignSelf: 'center' }, back: { width: 44, height: 44, justifyContent: 'center' }, backText: { color: colors.text, fontSize: 36, fontWeight: '200' }, brand: { alignItems: 'center', marginTop: 8, marginBottom: 30 }, mark: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, markText: { color: colors.text, fontFamily: 'serif', fontSize: 31, fontWeight: '700' }, wordmark: { color: colors.text, fontFamily: 'CormorantGaramond_600SemiBold_Italic', fontSize: 42, lineHeight: 48, marginTop: 8 }, tagline: { color: colors.textSecondary, fontSize: 11, letterSpacing: 0.6 }, form: { gap: 11 }, title: { color: colors.text, fontFamily: 'serif', fontSize: 25, fontWeight: '600' }, copy: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 6 }, input: { height: 52, paddingHorizontal: 16, color: colors.text, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border }, inputError: { borderColor: colors.error }, message: { color: '#D58A96', fontSize: 11, lineHeight: 16 }, success: { color: '#80B19C' }, linkText: { color: colors.textSecondary, textAlign: 'right', fontSize: 11, fontWeight: '600', padding: 4 }, switchText: { color: colors.textSecondary, textAlign: 'center', fontSize: 12, fontWeight: '600', padding: 8 }, divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 }, line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border }, or: { color: '#6E6864', fontSize: 9, fontWeight: '800' }, guestCopy: { color: '#77706C', textAlign: 'center', fontSize: 10, lineHeight: 15, paddingHorizontal: 10 }, accountCard: { padding: spacing.lg, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 12 }, accountEyebrow: { color: colors.success, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 }, accountName: { color: colors.text, fontFamily: 'serif', fontSize: 26, fontWeight: '600' }, syncCopy: { color: colors.textSecondary, fontSize: 11, lineHeight: 17, marginBottom: 8 },
});
