"use client";

import { useRef, useState } from "react";

export function AdminSyncButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setMessage({ type: "error", text: "Solo se permiten archivos CSV." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const uploadRes = await fetch("/api/upload-initial-csv", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) {
        setMessage({ type: "error", text: uploadData.error || "Error al subir el archivo" });
        setLoading(false);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      const syncRes = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const syncData = await syncRes.json().catch(() => ({}));
      if (!syncRes.ok) {
        setMessage({ type: "error", text: syncData.error || "Error en la sincronización" });
        setLoading(false);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      setMessage({
        type: "ok",
        text: `Archivo subido y sincronizado. Insertados: ${syncData.inserted ?? 0}`,
      });
      window.location.reload();
    } catch {
      setMessage({ type: "error", text: "Error de red" });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
        disabled={loading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
      >
        {loading ? "Subiendo y sincronizando…" : "Subir CSV inicial"}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${message.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
