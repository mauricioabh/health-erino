"use client";

import { useState, useCallback } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import {
  formatDateWithMonth,
  formatDateYYMM,
  getCaducidadStatus,
  type CaducidadStatus,
} from "@/lib/format-date";
import { EditarMedicamentoModal } from "./editar-medicamento-modal";
import { EliminarMedicamentoDialog } from "./eliminar-medicamento-dialog";
import { MedicamentoDetalleSheet } from "./medicamento-detalle-sheet";
import type { Medicamento } from "@/lib/types";

function rowAccentClass(status: CaducidadStatus): string {
  switch (status) {
    case "caducado":
      return "border-l-2 border-l-red-500/70 bg-red-500/10";
    case "sin_fecha":
      return "border-l-2 border-l-amber-500/70 bg-amber-500/10";
    case "valido":
      return "border-l-2 border-l-transparent";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function expiryTextClass(status: CaducidadStatus): string {
  switch (status) {
    case "caducado":
      return "text-red-300";
    case "sin_fecha":
      return "text-amber-300";
    case "valido":
      return "text-slate-400";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function MedicamentosList({
  initialData,
}: {
  initialData: Medicamento[];
}) {
  const [editingMedicamento, setEditingMedicamento] =
    useState<Medicamento | null>(null);
  const [deletingMedicamento, setDeletingMedicamento] = useState<{
    id: string;
    nombre: string;
  } | null>(null);
  const [detailMedicamento, setDetailMedicamento] =
    useState<Medicamento | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSuccess = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  }, []);

  const emptyMessage = (
    <>
      No hay medicamentos. Usa &quot;Subir CSV inicial&quot; o &quot;Nuevo
      medicamento&quot;.
    </>
  );

  return (
    <div className="relative rounded-xl border border-white/10 bg-slate-800/90 backdrop-blur-sm overflow-hidden">
      {isRefreshing && (
        <div className="absolute inset-0 z-40 flex items-center justify-center rounded-xl bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg bg-slate-800/95 px-4 py-3 text-sm text-slate-300 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            Actualizando tabla…
          </div>
        </div>
      )}

      {/* Compact list — mobile / PWA */}
      <ul className="md:hidden divide-y divide-white/5">
        {initialData.length === 0 ? (
          <li className="px-3 py-6 text-center text-slate-400 text-sm">
            {emptyMessage}
          </li>
        ) : (
          initialData.map((m) => {
            const status = getCaducidadStatus(m.fecha_caducidad);
            const yymm = formatDateYYMM(m.fecha_caducidad) ?? "—";
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setDetailMedicamento(m)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-left hover:bg-white/5 transition-colors ${rowAccentClass(status)}`}
                >
                  <span className="min-w-0 flex-1 text-slate-200 text-sm leading-snug break-words">
                    {m.nombre}
                  </span>
                  <span
                    className={`shrink-0 text-xs tabular-nums font-medium ${expiryTextClass(status)}`}
                  >
                    {yymm}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>

      {/* Full table — desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table
          className="w-full text-left min-w-[900px]"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: "22%" }} />
            <col style={{ width: "46%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "5%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead className="border-b border-white/10 bg-slate-800/80">
            <tr>
              <th className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Caducidad
              </th>
              <th className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {initialData.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-slate-400 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              initialData.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-3 py-2 text-slate-200 text-xs leading-snug break-words align-top">
                    {m.nombre}
                  </td>
                  <td
                    className="px-3 py-2 text-slate-400 text-xs leading-snug break-words align-top line-clamp-3"
                    title={m.descripcion ?? undefined}
                  >
                    {m.descripcion ?? "—"}
                  </td>
                  <td
                    className={`px-3 py-2 text-xs whitespace-nowrap ${!m.fecha_caducidad ? "bg-red-500/20 text-slate-300" : "text-slate-400"}`}
                  >
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
                      onClick={() =>
                        setDeletingMedicamento({ id: m.id, nombre: m.nombre })
                      }
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
      </div>

      <MedicamentoDetalleSheet
        medicamento={detailMedicamento}
        onClose={() => setDetailMedicamento(null)}
        onEdit={(m) => {
          setDetailMedicamento(null);
          setEditingMedicamento(m);
        }}
        onDelete={(m) => {
          setDetailMedicamento(null);
          setDeletingMedicamento({ id: m.id, nombre: m.nombre });
        }}
      />
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
