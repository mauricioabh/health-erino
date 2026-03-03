import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  useWindowDimensions,
  TextInput,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { getMedicamentos, type Medicamento, type MedicamentosSortBy, type MedicamentosOrder, type CaducidadFilter } from "@/lib/api";
import { formatDateWithMonth } from "@/lib/format-date";
import { maybeNotifyCaducados } from "@/lib/notifications";

export default function MedicamentosListScreen() {
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [list, setList] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<MedicamentosSortBy>("nombre");
  const [order, setOrder] = useState<MedicamentosOrder>("asc");
  const [caducidadFilter, setCaducidadFilter] = useState<CaducidadFilter>("all");

  const load = useCallback(async () => {
    if (!getToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMedicamentos(getToken, {
        q: searchQuery.trim() || undefined,
        sortBy,
        order,
        caducidad: caducidadFilter,
      });
      setList(data);
      const today = new Date().toISOString().slice(0, 10);
      const expired = data.filter((m) => m.fecha_caducidad && m.fecha_caducidad < today);
      if (expired.length > 0) maybeNotifyCaducados(expired.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [getToken, searchQuery, sortBy, order, caducidadFilter]);

  useEffect(() => {
    if (!isSignedIn) {
      router.replace("/(auth)/sign-in");
      return;
    }
    load();
  }, [isSignedIn, router, load]);

  const applySearch = () => load();

  if (!isSignedIn) return null;

  const colNombre = Math.floor(width * 0.2);
  const colDesc = Math.floor(width * 0.48);
  const colCaducidad = Math.floor(width * 0.16);
  const colStock = Math.floor(width * 0.1);

  const toggleSort = (field: MedicamentosSortBy) => {
    if (sortBy === field) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else setSortBy(field);
  };

  const renderRow = ({ item }: { item: Medicamento }) => (
    <View style={styles.row}>
      <View style={[styles.cellNombre, { width: colNombre }]}>
        <Text style={styles.cellTextNombre} numberOfLines={2}>
          {item.nombre}
        </Text>
      </View>
      <View style={[styles.cellDesc, { width: colDesc }]}>
        <Text style={styles.cellTextDesc} numberOfLines={2}>
          {item.descripcion ?? "—"}
        </Text>
      </View>
      <View style={[styles.cellRest, { width: colCaducidad }, !item.fecha_caducidad && styles.cellCaducidadEmpty]}>
        <Text style={styles.cellTextRest} numberOfLines={1}>
          {formatDateWithMonth(item.fecha_caducidad) ?? "—"}
        </Text>
      </View>
      <View style={[styles.cellRest, { width: colStock }]}>
        <Text style={styles.cellTextRest}>{item.stock}</Text>
      </View>
    </View>
  );

  const HeaderRow = () => (
    <View style={styles.headerRow}>
      <View style={[styles.headerCell, { width: colNombre }]}>
        <Text style={styles.headerText}>Nombre</Text>
      </View>
      <View style={[styles.headerCell, { width: colDesc }]}>
        <Text style={styles.headerText}>Descripción</Text>
      </View>
      <View style={[styles.headerCell, { width: colCaducidad }]}>
        <Text style={styles.headerText}>Caducidad</Text>
      </View>
      <View style={[styles.headerCell, { width: colStock }]}>
        <Text style={styles.headerText}>Stock</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Medicamentos</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#818cf8" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.toolbar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={applySearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={applySearch}>
              <Text style={styles.searchBtnText}>Buscar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.sortLabel}>Filtrar: </Text>
            <TouchableOpacity
              style={[styles.sortBtn, caducidadFilter === "all" && styles.sortBtnActive]}
              onPress={() => setCaducidadFilter("all")}
            >
              <Text style={styles.sortBtnText}>Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortBtn, caducidadFilter === "caducados" && styles.sortBtnActive]}
              onPress={() => setCaducidadFilter("caducados")}
            >
              <Text style={styles.sortBtnText}>Caducados</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortBtn, caducidadFilter === "validos" && styles.sortBtnActive]}
              onPress={() => setCaducidadFilter("validos")}
            >
              <Text style={styles.sortBtnText}>Válidos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortBtn, caducidadFilter === "sin_fecha" && styles.sortBtnActive]}
              onPress={() => setCaducidadFilter("sin_fecha")}
            >
              <Text style={styles.sortBtnText}>Sin fecha</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>Ordenar: </Text>
            <TouchableOpacity
              style={[styles.sortBtn, sortBy === "nombre" && styles.sortBtnActive]}
              onPress={() => toggleSort("nombre")}
            >
              <Text style={styles.sortBtnText}>Nombre {sortBy === "nombre" ? (order === "asc" ? "A-Z" : "Z-A") : ""}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortBtn, sortBy === "descripcion" && styles.sortBtnActive]}
              onPress={() => toggleSort("descripcion")}
            >
              <Text style={styles.sortBtnText}>Desc. {sortBy === "descripcion" ? (order === "asc" ? "A-Z" : "Z-A") : ""}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortBtn, sortBy === "fecha_caducidad" && styles.sortBtnActive]}
              onPress={() => toggleSort("fecha_caducidad")}
            >
              <Text style={styles.sortBtnText}>Caducidad</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={list}
            keyExtractor={(item) => item.id}
            renderItem={renderRow}
            ListHeaderComponent={HeaderRow}
            ListEmptyComponent={
              <Text style={styles.empty}>No hay medicamentos.</Text>
            }
            contentContainerStyle={styles.listContent}
            style={styles.list}
          />
        </>
      )}
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
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(30,41,59,0.6)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#e2e8f0",
    backgroundColor: "#1e293b",
  },
  searchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#059669",
  },
  searchBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  sortLabel: { fontSize: 11, color: "#64748b", marginRight: 4 },
  sortBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(51,65,85,0.8)",
  },
  sortBtnActive: { backgroundColor: "rgba(5,150,105,0.4)" },
  sortBtnText: { fontSize: 11, color: "#94a3b8" },
  list: { flex: 1 },
  listContent: { paddingBottom: 24 },
  headerRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(30,41,59,0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerCell: { paddingHorizontal: 4 },
  headerText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  cellNombre: { paddingHorizontal: 4, justifyContent: "center" },
  cellDesc: { paddingHorizontal: 4, justifyContent: "center" },
  cellRest: { paddingHorizontal: 4, justifyContent: "center" },
  cellCaducidadEmpty: { backgroundColor: "rgba(239,68,68,0.2)" },
  cellTextNombre: {
    fontSize: 11,
    color: "#e2e8f0",
    lineHeight: 14,
  },
  cellTextDesc: {
    fontSize: 10,
    color: "#94a3b8",
    lineHeight: 13,
  },
  cellTextRest: {
    fontSize: 10,
    color: "#94a3b8",
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  errorText: { color: "#f87171", textAlign: "center", marginBottom: 12 },
  retryButton: { paddingVertical: 10, paddingHorizontal: 20 },
  retryText: { color: "#818cf8", fontSize: 14 },
  empty: { padding: 24, color: "#64748b", fontSize: 13, textAlign: "center" },
});
