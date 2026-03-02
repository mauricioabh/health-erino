"use client";

import Link from "next/link";
import type { Medicamento } from "@/lib/types";

export function MedicamentosList({
  initialData,
}: {
  initialData: Medicamento[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-700">Nombre</th>
            <th className="px-4 py-3 font-medium text-slate-700">Descripción</th>
            <th className="px-4 py-3 font-medium text-slate-700">Caducidad</th>
            <th className="px-4 py-3 font-medium text-slate-700">Stock</th>
            <th className="px-4 py-3 font-medium text-slate-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {initialData.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                No hay medicamentos. Usa &quot;Sincronización inicial&quot; o &quot;Nuevo medicamento&quot;.
              </td>
            </tr>
          ) : (
            initialData.map((m) => (
              <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">{m.nombre}</td>
                <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                  {m.descripcion ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {m.fecha_caducidad ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-800">{m.stock}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/editar/${m.id}`}
                    className="text-emerald-600 hover:underline mr-2"
                  >
                    Editar
                  </Link>
                  <DeleteButton id={m.id} nombre={m.nombre} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function DeleteButton({ id, nombre }: { id: string; nombre: string }) {
  async function handleDelete() {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    const res = await fetch(`/api/medicamentos/${id}`, { method: "DELETE" });
    if (res.ok) window.location.reload();
    else alert("Error al eliminar");
  }
  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-red-600 hover:underline"
    >
      Eliminar
    </button>
  );
}
