import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { sendChatMessage } from "@/lib/api";

let ExpoSpeechRecognitionModule: {
  start: (opts: { lang: string }) => void;
  stop: () => void;
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
} | null = null;
let useSpeechRecognitionEvent: (event: string, cb: (e: { results?: { transcript?: string }[] }) => void) => void = () => {};
try {
  const mod = require("expo-speech-recognition");
  ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule ?? null;
  useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent ?? (() => {});
} catch {
  // Package not installed
}

export default function HomeScreen() {
  const router = useRouter();
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");

  const handleResult = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;
    setLoading(true);
    setError(null);
    setReply("");
    try {
      const content = await sendChatMessage(transcript);
      setReply(content);
      Speech.speak(content, { language: "es-ES", rate: 0.95 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al conectar");
    } finally {
      setLoading(false);
    }
  }, []);

  useSpeechRecognitionEvent("result", (event) => {
    const t = event.results?.[0]?.transcript;
    if (t) handleResult(t);
  });
  useSpeechRecognitionEvent("end", () => setListening(false));

  const toggleMic = useCallback(async () => {
    if (listening && ExpoSpeechRecognitionModule) {
      ExpoSpeechRecognitionModule.stop();
      setListening(false);
      return;
    }
    if (!ExpoSpeechRecognitionModule) {
      setError("Reconocimiento de voz no disponible en este dispositivo.");
      return;
    }
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setError("Se necesita permiso de micrófono.");
      return;
    }
    setListening(true);
    setError(null);
    ExpoSpeechRecognitionModule.start({ lang: "es-ES" });
  }, [listening]);

  const sendText = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    await handleResult(text);
  }, [inputText, handleResult]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerLogo}>💊</Text>
        <Text style={styles.headerTitle}>Health-erino</Text>
      </View>
      <Text style={styles.subtitle}>Pregunta por tus medicamentos por voz</Text>

      <TouchableOpacity
        style={[styles.micButton, listening && styles.micButtonActive]}
        onPress={toggleMic}
        disabled={loading}
      >
        <Text style={styles.micIcon}>{listening ? "■" : "🎤"}</Text>
        <Text style={styles.micLabel}>
          {listening ? "Escuchando..." : "Toca para hablar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.uploadCsvLink}
        onPress={() => router.push("/upload-csv")}
      >
        <Text style={styles.uploadCsvText}>📤 Subir CSV inicial (medicamentos)</Text>
      </TouchableOpacity>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="O escribe tu pregunta..."
          placeholderTextColor="#94a3b8"
          value={inputText}
          onChangeText={setInputText}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={sendText}
          disabled={loading || !inputText.trim()}
        >
          <Text style={styles.sendLabel}>Enviar</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.status}>
          <ActivityIndicator size="small" color="#818cf8" />
          <Text style={styles.statusText}>Pensando...</Text>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      {reply ? (
        <ScrollView style={styles.replyBox}>
          <Text style={styles.replyText}>{reply}</Text>
        </ScrollView>
      ) : null}

      {/* Cómo funciona */}
      <Text style={styles.sectionTitle}>Cómo funciona</Text>
      <View style={styles.stepsContainer}>
        {[
          { step: "01", icon: "🔐", title: "Regístrate o inicia sesión", text: "Crea cuenta o usa Google. Solo usuarios autenticados acceden al panel.", accent: "cyan" as const },
          { step: "02", icon: "📋", title: "Administra medicamentos", text: "Añade, edita y revisa stock y caducidades desde el panel de admin.", accent: "rose" as const },
          { step: "03", icon: "🎤", title: "Consulta por voz o chat", text: "Pregunta con el asistente de voz o desde la web.", accent: "violet" as const },
        ].map((item) => (
          <View key={item.step} style={[styles.stepCard, styles[`stepCard_${item.accent}` as keyof typeof styles]]}>
            <Text style={[styles.stepNum, styles[`stepNum_${item.accent}` as keyof typeof styles]]}>{item.step}</Text>
            <View style={[styles.stepIcon, styles[`stepIcon_${item.accent}` as keyof typeof styles]]}>
              <Text style={styles.stepIconEmoji}>{item.icon}</Text>
            </View>
            <Text style={styles.stepTitle}>{item.title}</Text>
            <Text style={styles.stepText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerLogo: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#f8fafc",
  },
  subtitle: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 32,
  },
  micButton: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 24,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  micButtonActive: {
    backgroundColor: "#dc2626",
    shadowColor: "#dc2626",
  },
  micIcon: {
    fontSize: 40,
    color: "#fff",
  },
  micLabel: {
    fontSize: 12,
    color: "#fff",
    marginTop: 4,
  },
  uploadCsvLink: {
    alignSelf: "center",
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  uploadCsvText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#f1f5f9",
    backgroundColor: "#1e293b",
  },
  sendButton: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendLabel: {
    color: "#fff",
    fontWeight: "600",
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  statusText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  error: {
    color: "#f87171",
    marginTop: 12,
    textAlign: "center",
  },
  replyBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    maxHeight: 280,
  },
  replyText: {
    fontSize: 16,
    color: "#e2e8f0",
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8fafc",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  stepsContainer: {
    marginTop: 4,
  },
  stepCard: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 20,
    backgroundColor: "rgba(30,41,59,0.8)",
    borderColor: "rgba(255,255,255,0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  stepCard_cyan: {
    borderLeftColor: "#06b6d4",
    shadowColor: "#06b6d4",
  },
  stepCard_rose: {
    borderLeftColor: "#f43f5e",
    shadowColor: "#f43f5e",
  },
  stepCard_violet: {
    borderLeftColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
  },
  stepNum: {
    position: "absolute",
    top: 16,
    right: 16,
    fontSize: 32,
    fontWeight: "700",
    opacity: 0.25,
  },
  stepNum_cyan: { color: "#06b6d4" },
  stepNum_rose: { color: "#f43f5e" },
  stepNum_violet: { color: "#8b5cf6" },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  stepIcon_cyan: { backgroundColor: "rgba(6,182,212,0.2)" },
  stepIcon_rose: { backgroundColor: "rgba(244,63,94,0.2)" },
  stepIcon_violet: { backgroundColor: "rgba(139,92,246,0.2)" },
  stepIconEmoji: {
    fontSize: 20,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 6,
    paddingRight: 40,
  },
  stepText: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 20,
  },
});
