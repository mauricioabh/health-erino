import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  getCaducadosNotificationEnabled,
  setCaducadosNotificationEnabled,
  requestNotificationPermissions,
} from "@/lib/notifications";

export default function SettingsScreen() {
  const router = useRouter();
  const [caducadosEnabled, setCaducadosEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCaducadosNotificationEnabled().then(setCaducadosEnabled).finally(() => setLoading(false));
  }, []);

  const handleCaducadosToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          "Permisos necesarios",
          "Activa las notificaciones en Ajustes del dispositivo para recibir recordatorios de medicamentos caducados."
        );
        return;
      }
    }
    await setCaducadosNotificationEnabled(value);
    setCaducadosEnabled(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Recordatorio medicamentos caducados</Text>
          <Switch
            value={caducadosEnabled}
            onValueChange={handleCaducadosToggle}
            disabled={loading}
            trackColor={{ false: "#334155", true: "#4f46e5" }}
            thumbColor="#f8fafc"
          />
        </View>
        <Text style={styles.hint}>
          Si tienes medicamentos con fecha de caducidad pasada, recibirás una notificación al abrir la lista (máximo una vez al día).
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backText: { color: "#94a3b8", fontSize: 15, marginRight: 16 },
  title: { fontSize: 18, fontWeight: "600", color: "#f8fafc" },
  section: { padding: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(30,41,59,0.8)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  label: { fontSize: 15, color: "#e2e8f0", flex: 1, marginRight: 12 },
  hint: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    lineHeight: 18,
  },
});
