"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

type FeedbackDialog = {
  type: "ok" | "error";
  title: string;
  message: string;
  technical?: string;
  reloadOnClose?: boolean;
};

function friendlyUploadError(raw: string): string {
  const text = raw.trim();
  if (!text) {
    return "No se pudo completar la operación. Intenta de nuevo.";
  }
  if (/no autorizado/i.test(text)) {
    return "Tu sesión no es válida o expiró. Vuelve a iniciar sesión e intenta otra vez.";
  }
  if (/parseando csv|parse/i.test(text)) {
    return "No se pudo leer el archivo como CSV. Comprueba que sea un CSV de texto (no Excel renombrado) con las columnas de la plantilla.";
  }
  if (/solo se permiten archivos csv/i.test(text)) {
    return "Solo se permiten archivos con extensión .csv.";
  }
  if (/falta el archivo/i.test(text)) {
    return "No se recibió el archivo. Elige un CSV e intenta de nuevo.";
  }
  if (/blob_read_write_token|blob/i.test(text)) {
    return "El almacenamiento de archivos no está disponible ahora. Intenta más tarde.";
  }
  if (/error de red|failed to fetch|network/i.test(text)) {
    return "Hubo un problema de conexión. Comprueba tu red e intenta de nuevo.";
  }
  if (/error al subir|error en la sincronización|error interno/i.test(text)) {
    return "No se pudo subir o sincronizar el archivo. Intenta de nuevo en unos segundos.";
  }
  return "No se pudo completar la importación. Revisa el detalle técnico si necesitas más información.";
}

export function AdminSyncButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<FeedbackDialog | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);

  function openError(raw: string, status?: number) {
    const technical =
      status != null ? `HTTP ${status}: ${raw}` : raw || undefined;
    setShowTechnical(false);
    setDialog({
      type: "error",
      title: "No se pudo importar el archivo",
      message: friendlyUploadError(raw),
      technical,
    });
  }

  function handleDialogClose() {
    const shouldReload = dialog?.reloadOnClose;
    setDialog(null);
    setShowTechnical(false);
    if (shouldReload) {
      window.location.reload();
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      openError("Solo se permiten archivos CSV.");
      return;
    }
    setLoading(true);
    setDialog(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const uploadRes = await fetch("/api/upload-initial-csv", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) {
        openError(
          typeof uploadData.error === "string"
            ? uploadData.error
            : "Error al subir el archivo",
          uploadRes.status,
        );
        return;
      }
      const syncRes = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const syncData = await syncRes.json().catch(() => ({}));
      if (!syncRes.ok) {
        openError(
          typeof syncData.error === "string"
            ? syncData.error
            : "Error en la sincronización",
          syncRes.status,
        );
        return;
      }
      const inserted = syncData.inserted ?? 0;
      setShowTechnical(false);
      setDialog({
        type: "ok",
        title: "Importación completada",
        message: `Archivo subido y sincronizado. Insertados: ${inserted}`,
        reloadOnClose: true,
      });
    } catch {
      openError("Error de red");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-1 md:flex-none min-w-0">
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
        aria-label={loading ? "Subiendo CSV" : "Subir CSV inicial"}
        title={loading ? "Subiendo…" : "Subir CSV inicial"}
        className="flex flex-1 md:flex-none items-center justify-center gap-1 rounded-md bg-emerald-600 px-2 py-2 md:gap-1.5 md:px-3 md:py-1.5 text-xs md:text-sm text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
      >
        <Upload className="h-4 w-4 md:h-3.5 md:w-3.5 shrink-0" />
        <span className="md:hidden font-medium">
          {loading ? "…" : "Upload"}
        </span>
        <span className="hidden md:inline">
          {loading ? "Subiendo…" : "Subir CSV inicial"}
        </span>
      </button>

      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="csv-feedback-title"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={handleDialogClose}
          />
          <div className="relative w-full max-w-md rounded-lg border border-white/10 bg-slate-900 shadow-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h2
                id="csv-feedback-title"
                className={`text-base font-semibold ${
                  dialog.type === "ok" ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {dialog.title}
              </h2>
              <button
                type="button"
                onClick={handleDialogClose}
                className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed mb-3">
              {dialog.message}
            </p>
            {dialog.type === "error" && dialog.technical && (
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => setShowTechnical((v) => !v)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline"
                >
                  {showTechnical
                    ? "Ocultar detalle técnico"
                    : "Ver detalle técnico"}
                </button>
                {showTechnical && (
                  <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-slate-950/80 border border-white/10 p-2 text-[11px] text-slate-300 whitespace-pre-wrap break-words">
                    {dialog.technical}
                  </pre>
                )}
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleDialogClose}
                className={`rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors ${
                  dialog.type === "ok"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                {dialog.type === "ok" ? "Aceptar" : "Cerrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
