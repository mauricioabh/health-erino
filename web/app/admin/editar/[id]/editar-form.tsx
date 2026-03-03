"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import type { Medicamento } from "@/lib/types";

export function EditarForm({ medicamento }: { medicamento: Medicamento }) {
  const [nombre, setNombre] = useState(medicamento.nombre);
  const [descripcion, setDescripcion] = useState(medicamento.descripcion ?? "");
  const [fechaCaducidad, setFechaCaducidad] = useState(
    medicamento.fecha_caducidad ?? ""
  );
  const [stock, setStock] = useState(medicamento.stock);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
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
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Error al guardar");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-white/10 bg-slate-800/90 backdrop-blur-sm p-4">
      <div>
        <label htmlFor="nombre" className="block text-xs font-medium text-slate-300 mb-0.5">Nombre *</label>
        <input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full rounded-md border border-white/10 bg-slate-700/80 px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="descripcion" className="block text-xs font-medium text-slate-300 mb-0.5">Descripción</label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-white/10 bg-slate-700/80 px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="fecha_caducidad" className="block text-xs font-medium text-slate-300 mb-0.5">Fecha caducidad</label>
        <input
          id="fecha_caducidad"
          type="date"
          value={fechaCaducidad}
          onChange={(e) => setFechaCaducidad(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-slate-700/80 px-2.5 py-1.5 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="stock" className="block text-xs font-medium text-slate-300 mb-0.5">Stock</label>
        <input
          id="stock"
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
          className="w-full rounded-md border border-white/10 bg-slate-700/80 px-2.5 py-1.5 text-sm text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-1.5">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          <Save className="h-3.5 w-3.5" />
          {loading ? "Guardando…" : "Guardar"}
        </button>
        <Link href="/admin" className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 transition-colors">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
