"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, X } from "lucide-react";

export function EliminarMedicamentoDialog({
  medicamento,
  onClose,
  onSuccess,
}: {
  medicamento: { id: string; nombre: string } | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!medicamento) return null;

  async function handleConfirm() {
    if (!medicamento) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/medicamentos/${medicamento.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Error al eliminar");
        return;
      }
      onSuccess?.();
      onClose();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    onClose();
  }

  const dialog = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="eliminar-medicamento-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm rounded-lg border border-white/10 bg-slate-800/95 shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="eliminar-medicamento-title" className="text-base font-bold text-white mb-1">
              ¿Eliminar medicamento?
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Se eliminará &quot;{medicamento.nombre}&quot;. Esta acción no se puede deshacer.
            </p>
            {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white font-medium hover:bg-red-500 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {loading ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(dialog, document.body)
    : null;
}
