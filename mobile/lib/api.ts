const API_BASE =
  process.env.EXPO_PUBLIC_APP_URL || "http://localhost:3000";

export type UploadCsvResult = { url: string };
export type SyncResult = { ok: boolean; inserted: number; error?: string };

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
