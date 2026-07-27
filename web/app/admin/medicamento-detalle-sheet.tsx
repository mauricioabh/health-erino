"use client";

import { createPortal } from "react-dom";
import { Pencil, Trash2, X } from "lucide-react";
import {
  formatDateWithMonth,
  getCaducidadStatus,
  type CaducidadStatus,
} from "@/lib/format-date";
import type { Medicamento } from "@/lib/types";

function statusLabel(status: CaducidadStatus): string | null {
  switch (status) {
    case "caducado":
      return "Caducado";
    case "sin_fecha":
      return "Sin fecha";
    case "valido":
      return null;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function statusBadgeClass(status: CaducidadStatus): string {
  switch (status) {
    case "caducado":
      return "bg-red-500/20 text-red-300";
    case "sin_fecha":
      return "bg-amber-500/20 text-amber-300";
    case "valido":
      return "";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function MedicamentoDetalleSheet({
  medicamento,
  onClose,
  onEdit,
  onDelete,
}: {
  medicamento: Medicamento | null;
  onClose: () => void;
  onEdit: (m: Medicamento) => void;
  onDelete: (m: Medicamento) => void;
}) {
  if (!medicamento) return null;

  const status = getCaducidadStatus(medicamento.fecha_caducidad);
  const label = statusLabel(status);
  const caducidadText = formatDateWithMonth(medicamento.fecha_caducidad) ?? "—";

  const sheet = (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medicamento-detalle-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-t-xl border border-white/10 bg-slate-800/95 shadow-xl sm:rounded-xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <h2
              id="medicamento-detalle-title"
              className="text-base font-bold text-white break-words"
            >
              {medicamento.nombre}
            </h2>
            {label && (
              <span
                className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusBadgeClass(status)}`}
              >
                {label}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-4 text-sm">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
              Descripción
            </p>
            <p className="text-slate-200 text-xs leading-snug break-words">
              {medicamento.descripcion?.trim() ? medicamento.descripcion : "—"}
            </p>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                Caducidad
              </p>
              <p
                className={`text-xs ${
                  status === "caducado"
                    ? "text-red-300"
                    : status === "sin_fecha"
                      ? "text-amber-300"
                      : "text-slate-200"
                }`}
              >
                {caducidadText}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                Stock
              </p>
              <p className="text-xs text-slate-200 tabular-nums">
                {medicamento.stock}
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => onEdit(medicamento)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm text-white font-medium hover:bg-indigo-500 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(medicamento)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300 font-medium hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(sheet, document.body)
    : null;
}
