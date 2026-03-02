import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { uploadInitialCsv, syncMedicamentos } from "@/lib/api";

export default function UploadCsvScreen() {
  const { isSignedIn, getToken, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  if (!isSignedIn) {
    router.replace("/(auth)/sign-in");
    return null;
  }

  const handlePickAndUpload = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });
      if (result.canceled) {
        setLoading(false);
        return;
      }
      const file = result.assets[0];
      if (!file.uri || !file.name) {
        setMessage({ type: "error", text: "No se pudo leer el archivo." });
        setLoading(false);
        return;
      }
      await uploadInitialCsv(file.uri, file.name, getToken);
      const sync = await syncMedicamentos(getToken);
      if (!sync.ok) {
        if (sync.error?.includes("autorizado") || sync.error?.includes("Sube primero")) {
          setMessage({
            type: "error",
            text: sync.error || "Error en la sincronización. Inicia sesión en la web si es necesario.",
          });
        } else {
          setMessage({ type: "error", text: sync.error || "Error en la sincronización" });
        }
        setLoading(false);
        return;
      }
      setMessage({
        type: "ok",
        text: `Archivo subido y sincronizado. Insertados: ${sync.inserted}`,
      });
      Alert.alert("Listo", `Se insertaron ${sync.inserted} medicamentos.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      const err = e instanceof Error ? e.message : "Error al subir el archivo";
      setMessage({ type: "error", text: err });
    } finally {
      setLoading(false);
    }
  }, [router, getToken]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Subir CSV inicial</Text>
        <Text style={styles.subtitle}>
          Elige un archivo CSV desde tu dispositivo. Se subirá a la nube y se usará para cargar los
          medicamentos.
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePickAndUpload}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Elegir archivo CSV</Text>
        )}
      </TouchableOpacity>
      {message && (
        <Text style={[styles.message, message.type === "ok" ? styles.messageOk : styles.messageError]}>
          {message.text}
        </Text>
      )}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 24, paddingTop: 60 },
  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: "600", color: "#f8fafc", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#94a3b8", lineHeight: 22 },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  message: { marginTop: 16, fontSize: 14, textAlign: "center" },
  messageOk: { color: "#34d399" },
  messageError: { color: "#f87171" },
  backButton: { marginTop: 32, alignItems: "center" },
  backButtonText: { color: "#94a3b8", fontSize: 15 },
  signOutButton: { marginTop: 16, alignItems: "center" },
  signOutButtonText: { color: "#64748b", fontSize: 14 },
});
