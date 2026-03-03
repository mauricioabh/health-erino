const API_BASE =
  process.env.EXPO_PUBLIC_APP_URL || "http://localhost:3000";

export type UploadCsvResult = { url: string };
export type SyncResult = { ok: boolean; inserted: number; error?: string };

export type Medicamento = {
  id: string;
  nombre: string;
  descripcion: string | null;
  fecha_caducidad: string | null;
  stock: number;
};

export type MedicamentosSortBy = "nombre" | "descripcion" | "fecha_caducidad";
export type MedicamentosOrder = "asc" | "desc";
export type CaducidadFilter = "all" | "caducados" | "validos" | "sin_fecha";

export async function getMedicamentos(
  getToken?: () => Promise<string | null>,
  opts?: { q?: string; sortBy?: MedicamentosSortBy; order?: MedicamentosOrder; caducidad?: CaducidadFilter }
): Promise<Medicamento[]> {
  const headers: Record<string, string> = {};
  if (getToken) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const sp = new URLSearchParams();
  if (opts?.q?.trim()) sp.set("q", opts.q.trim());
  if (opts?.sortBy) sp.set("sortBy", opts.sortBy);
  if (opts?.order) sp.set("order", opts.order);
  if (opts?.caducidad && opts.caducidad !== "all") sp.set("caducidad", opts.caducidad);
  const url = sp.toString() ? `${API_BASE}/api/medicamentos?${sp}` : `${API_BASE}/api/medicamentos`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Error al cargar medicamentos");
  }
  return res.json();
}

export async function uploadInitialCsv(
  fileUri: string,
  fileName: string,
  getToken?: () => Promise<string | null>
): Promise<UploadCsvResult> {
  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    name: fileName,
    type: "text/csv",
  } as unknown as Blob);

  const headers: Record<string, string> = {};
  if (getToken) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/upload-initial-csv`, {
    method: "POST",
    body: formData,
    headers,
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok) throw new Error(data.error || "Error al subir el archivo");
  if (!data.url) throw new Error("No se devolvió la URL del archivo");
  return { url: data.url };
}

export async function syncMedicamentos(
  getToken?: () => Promise<string | null>
): Promise<SyncResult> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (getToken) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/api/sync`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  const data = (await res.json().catch(() => ({}))) as { inserted?: number; error?: string };
  if (!res.ok) return { ok: false, inserted: 0, error: data.error };
  return { ok: true, inserted: data.inserted ?? 0 };
}

export async function sendChatMessage(userMessage: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/chat?stream=false`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { content?: string };
  return data.content ?? "";
}
