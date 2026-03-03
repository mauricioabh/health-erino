"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import type { Medicamento } from "@/lib/types";

export function EditarMedicamentoModal({
  medicamento,
  onClose,
  onSuccess,
}: {
  medicamento: Medicamento | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaCaducidad, setFechaCaducidad] = useState("");
  const [stock, setStock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (medicamento) {
      setNombre(medicamento.nombre);
      setDescripcion(medicamento.descripcion ?? "");
      setFechaCaducidad(medicamento.fecha_caducidad ?? "");
      setStock(medicamento.stock);
      setError(null);
    }
  }, [medicamento]);

  if (!medicamento) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!medicamento) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/medicamentos/${medicamento.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          descripcion: descripcion || null,
          fecha_caducidad: fechaCaducidad || null,
          stock,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Error al guardar");
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

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editar-medicamento-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-lg border border-white/10 bg-slate-800/95 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <h2 id="editar-medicamento-title" className="text-base font-bold text-white">
            Editar medicamento
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 p-4">
          <div>
            <label htmlFor="edit-modal-nombre" className="block text-xs font-medium text-slate-300 mb-0.5">
              Nombre *
            </label>
            <input
              id="edit-modal-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full rounded-md border border-white/10 bg-slate-700/80 px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="edit-modal-descripcion" className="block text-xs font-medium text-slate-300 mb-0.5">
              Descripción
            </label>
            <textarea
              id="edit-modal-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-white/10 bg-slate-700/80 px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="edit-modal-fecha" className="block text-xs font-medium text-slate-300 mb-0.5">
              Fecha caducidad
            </label>
            <input
              id="edit-modal-fecha"
              type="date"
              value={fechaCaducidad}
              onChange={(e) => setFechaCaducidad(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-slate-700/80 px-2.5 py-1.5 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="edit-modal-stock" className="block text-xs font-medium text-slate-300 mb-0.5">
              Stock
            </label>
            <input
              id="edit-modal-stock"
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-md border border-white/10 bg-slate-700/80 px-2.5 py-1.5 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex justify-between pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              {loading ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
