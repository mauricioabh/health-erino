"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, X } from "lucide-react";

export function NuevoMedicamentoModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaCaducidad, setFechaCaducidad] = useState("");
  const [stock, setStock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/medicamentos", {
        method: "POST",
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
        setError(data.error || "Error al crear");
        return;
      }
      setOpen(false);
      setNombre("");
      setDescripcion("");
      setFechaCaducidad("");
      setStock(0);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setOpen(false);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white font-medium hover:bg-indigo-500 transition-colors"
      >
        <Plus className="h-3.5 w-3.5 shrink-0" />
        Nuevo medicamento
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nuevo-medicamento-title"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg rounded-lg border border-white/10 bg-slate-800/95 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
              <h2 id="nuevo-medicamento-title" className="text-base font-bold text-white">
                Nuevo medicamento
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
                <label htmlFor="modal-nombre" className="block text-xs font-medium text-slate-300 mb-0.5">
                  Nombre
                </label>
                <input
                  id="modal-nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full rounded-md border border-white/10 bg-slate-700/80 px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="modal-descripcion" className="block text-xs font-medium text-slate-300 mb-0.5">
                  Descripcion
                </label>
                <textarea
                  id="modal-descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-white/10 bg-slate-700/80 px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="modal-fecha" className="block text-xs font-medium text-slate-300 mb-0.5">
                  Fecha caducidad
                </label>
                <input
                  id="modal-fecha"
                  type="date"
                  value={fechaCaducidad}
                  onChange={(e) => setFechaCaducidad(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-slate-700/80 px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="modal-stock" className="block text-xs font-medium text-slate-300 mb-0.5">
                  Stock
                </label>
                <input
                  id="modal-stock"
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-md border border-white/10 bg-slate-700/80 px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                  {loading ? "Guardando..." : "Guardar"}
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
      )}
    </>
  );
}
