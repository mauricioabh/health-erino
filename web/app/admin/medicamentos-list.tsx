"use client";

import { useState, useCallback } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { formatDateWithMonth } from "@/lib/format-date";
import { EditarMedicamentoModal } from "./editar-medicamento-modal";
import { EliminarMedicamentoDialog } from "./eliminar-medicamento-dialog";
import type { Medicamento } from "@/lib/types";

export function MedicamentosList({
  initialData,
}: {
  initialData: Medicamento[];
}) {
  const [editingMedicamento, setEditingMedicamento] = useState<Medicamento | null>(null);
  const [deletingMedicamento, setDeletingMedicamento] = useState<{ id: string; nombre: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSuccess = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  }, []);

  return (
    <div className="relative rounded-xl border border-white/10 bg-slate-800/90 backdrop-blur-sm overflow-x-auto">
      {isRefreshing && (
        <div className="absolute inset-0 z-40 flex items-center justify-center rounded-xl bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg bg-slate-800/95 px-4 py-3 text-sm text-slate-300 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            Actualizando tabla…
          </div>
        </div>
      )}
      <table className="w-full text-left min-w-[900px]" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "22%" }} />
          <col style={{ width: "46%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "15%" }} />
        </colgroup>
        <thead className="border-b border-white/10 bg-slate-800/80">
          <tr>
            <th className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Nombre</th>
            <th className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Descripción</th>
            <th className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Caducidad</th>
            <th className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Stock</th>
            <th className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {initialData.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-slate-400 text-sm">
                No hay medicamentos. Usa &quot;Subir CSV inicial&quot; o &quot;Nuevo medicamento&quot;.
              </td>
            </tr>
          ) : (
            initialData.map((m) => (
              <tr key={m.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-3 py-2 text-slate-200 text-xs leading-snug break-words align-top">
                  {m.nombre}
                </td>
                <td className="px-3 py-2 text-slate-400 text-xs leading-snug break-words align-top line-clamp-3" title={m.descripcion ?? undefined}>
                  {m.descripcion ?? "—"}
                </td>
                <td className={`px-3 py-2 text-xs whitespace-nowrap ${!m.fecha_caducidad ? "bg-red-500/20 text-slate-300" : "text-slate-400"}`}>
                  {formatDateWithMonth(m.fecha_caducidad) ?? "—"}
                </td>
                <td className="px-3 py-2 text-slate-200 text-xs tabular-nums">
                  {m.stock}
                </td>
                <td className="px-3 py-2 text-xs whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => setEditingMedicamento(m)}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors mr-2"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingMedicamento({ id: m.id, nombre: m.nombre })}
                    className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {editingMedicamento && (
        <EditarMedicamentoModal
          medicamento={editingMedicamento}
          onClose={() => setEditingMedicamento(null)}
          onSuccess={handleSuccess}
        />
      )}
      {deletingMedicamento && (
        <EliminarMedicamentoDialog
          medicamento={deletingMedicamento}
          onClose={() => setDeletingMedicamento(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
