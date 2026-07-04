import { useEffect, useState } from "react";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { colors, radii, spacing } from "@/constants/design";
import { supabase } from "@/lib/supabase";
import { toast } from "@/store/toast-store";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    void (async () => {
      const current = await supabase.auth.getSession();
      if (current.data.session) {
        setReady(true);
        return;
      }
      const url = await Linking.getInitialURL();
      if (url) {
        const params = new URLSearchParams(url.split("#")[1] ?? url.split("?")[1] ?? "");
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          const result = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!result.error) {
            setReady(true);
            return;
          }
        }
      }
      toast.error("El enlace de recuperación no es válido o ya expiró.");
    })();
  }, []);
  const submit = async () => {
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contraseña actualizada.");
    router.replace("/");
  };
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>SEGURIDAD</Text>
        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.copy}>Elige una contraseña segura para tu cuenta Aurelis.</Text>
        {!ready ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 30 }} />
        ) : (
          <>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Nueva contraseña"
              placeholderTextColor="#77706C"
              style={styles.input}
            />
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholder="Confirmar contraseña"
              placeholderTextColor="#77706C"
              style={styles.input}
            />
            <Button
              label={saving ? "Actualizando…" : "Actualizar contraseña"}
              disabled={saving}
              onPress={submit}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    gap: 12,
  },
  eyebrow: { color: colors.accent, fontSize: 9, fontWeight: "900", letterSpacing: 1.5 },
  title: { color: colors.text, fontFamily: "serif", fontSize: 30, fontWeight: "600" },
  copy: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  input: {
    height: 52,
    paddingHorizontal: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
});
