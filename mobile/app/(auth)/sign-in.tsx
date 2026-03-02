import { useSignIn } from "@clerk/clerk-expo";
import type { EmailCodeFactor } from "@clerk/types";
import { Link, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState("");

  const onSignIn = useCallback(async () => {
    if (!isLoaded) return;
    setError("");
    try {
      const attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === "complete") {
        await setActive({
          session: attempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) return;
            router.replace("/");
          },
        });
      } else if (attempt.status === "needs_second_factor") {
        const factor = attempt.supportedSecondFactors?.find(
          (f): f is EmailCodeFactor => f.strategy === "email_code"
        );
        if (factor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: factor.emailAddressId,
          });
          setShowCode(true);
        }
      }
    } catch (e: unknown) {
      const err = e as { errors?: { message?: string }[] };
      const msg = err?.errors?.[0]?.message ?? (e instanceof Error ? e.message : "Error al iniciar sesión");
      setError(String(msg));
    }
  }, [isLoaded, signIn, setActive, router, email, password]);

  const onVerify = useCallback(async () => {
    if (!isLoaded) return;
    setError("");
    try {
      const attempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });
      if (attempt.status === "complete") {
        await setActive({
          session: attempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) return;
            router.replace("/");
          },
        });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Código inválido");
    }
  }, [isLoaded, signIn, setActive, router, code]);

  if (showCode) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.title}>Verificar email</Text>
        <Text style={styles.subtitle}>Te enviamos un código a tu correo.</Text>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Código"
          placeholderTextColor="#64748b"
          onChangeText={setCode}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={onVerify}>
          <Text style={styles.buttonText}>Verificar</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput
        style={styles.input}
        value={email}
        placeholder="Email"
        placeholderTextColor="#64748b"
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Contraseña"
        placeholderTextColor="#64748b"
        secureTextEntry
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.button, (!email || !password) && styles.buttonDisabled]}
        onPress={onSignIn}
        disabled={!email || !password}
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes cuenta? </Text>
        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>Regístrate</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 24,
    paddingTop: 80,
  },
  title: { fontSize: 24, fontWeight: "600", color: "#f8fafc", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#94a3b8", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#f1f5f9",
    backgroundColor: "#1e293b",
    marginBottom: 12,
  },
  error: { color: "#f87171", marginBottom: 12, fontSize: 14 },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  footer: { flexDirection: "row", marginTop: 24, alignItems: "center" },
  footerText: { color: "#94a3b8", fontSize: 15 },
  link: { color: "#818cf8", fontSize: 15, fontWeight: "500" },
});
