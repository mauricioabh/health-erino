"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
        <input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
        />
      </div>
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
        />
      </div>
      <div>
        <label htmlFor="fecha_caducidad" className="block text-sm font-medium text-slate-700 mb-1">Fecha caducidad</label>
        <input
          id="fecha_caducidad"
          type="date"
          value={fechaCaducidad}
          onChange={(e) => setFechaCaducidad(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
        />
      </div>
      <div>
        <label htmlFor="stock" className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
        <input
          id="stock"
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Guardando…" : "Guardar"}
        </button>
        <Link href="/admin" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
