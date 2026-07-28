"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle,
  CalendarOff,
  ArrowUpAZ,
  ArrowDownAZ,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import type { CaducidadFilter } from "@/lib/db/medicamentos";

type SortBy = "nombre" | "descripcion" | "fecha_caducidad";

const FILTER_OPTIONS: {
  value: CaducidadFilter;
  label: string;
  icon: ReactNode | null;
  activeClass: string;
}[] = [
  {
    value: "all",
    label: "Todos",
    icon: null,
    activeClass: "border-indigo-500 bg-indigo-500/20 text-indigo-300",
  },
  {
    value: "caducados",
    label: "Caducados",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    activeClass: "border-red-500/50 bg-red-500/20 text-red-300",
  },
  {
    value: "validos",
    label: "Válidos",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    activeClass: "border-emerald-500/50 bg-emerald-500/20 text-emerald-300",
  },
  {
    value: "sin_fecha",
    label: "Sin fecha",
    icon: <CalendarOff className="h-3.5 w-3.5" />,
    activeClass: "border-amber-500/50 bg-amber-500/20 text-amber-300",
  },
];

const SORT_OPTIONS: {
  sortBy: SortBy;
  label: string;
  toggleOrder: (
    currentSortBy: SortBy,
    currentOrder: "asc" | "desc",
  ) => "asc" | "desc";
}[] = [
  {
    sortBy: "nombre",
    label: "Nombre",
    toggleOrder: (currentSortBy, currentOrder) =>
      currentSortBy === "nombre" && currentOrder === "asc" ? "desc" : "asc",
  },
  {
    sortBy: "descripcion",
    label: "Descripción",
    toggleOrder: (currentSortBy, currentOrder) =>
      currentSortBy === "descripcion" && currentOrder === "asc"
        ? "desc"
        : "asc",
  },
  {
    sortBy: "fecha_caducidad",
    label: "Caducidad",
    toggleOrder: (currentSortBy, currentOrder) =>
      currentSortBy === "fecha_caducidad" && currentOrder === "desc"
        ? "asc"
        : "desc",
  },
];

function SortIcon({
  sortBy,
  currentSortBy,
  currentOrder,
}: {
  sortBy: SortBy;
  currentSortBy: SortBy;
  currentOrder: "asc" | "desc";
}) {
  if (currentSortBy !== sortBy) {
    return <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />;
  }
  if (sortBy === "fecha_caducidad") {
    return currentOrder === "desc" ? (
      <ArrowDown className="h-3.5 w-3.5 shrink-0" />
    ) : (
      <ArrowUp className="h-3.5 w-3.5 shrink-0" />
    );
  }
  return currentOrder === "asc" ? (
    <ArrowUpAZ className="h-3.5 w-3.5 shrink-0" />
  ) : (
    <ArrowDownAZ className="h-3.5 w-3.5 shrink-0" />
  );
}

export function MedicamentosFiltersSheet({
  open,
  onClose,
  currentCaducidad,
  currentSortBy,
  currentOrder,
  onFilterChange,
  onSortChange,
}: {
  open: boolean;
  onClose: () => void;
  currentCaducidad: CaducidadFilter;
  currentSortBy: SortBy;
  currentOrder: "asc" | "desc";
  onFilterChange: (caducidad: CaducidadFilter) => void;
  onSortChange: (sortBy: SortBy, order: "asc" | "desc") => void;
}) {
  if (!open) return null;

  const sheet = (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medicamentos-filters-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-t-xl border border-white/10 bg-slate-800/95 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2
            id="medicamentos-filters-title"
            className="text-base font-bold text-white"
          >
            Filtrar y ordenar
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Filtrar por caducidad
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onFilterChange(opt.value);
                    onClose();
                  }}
                  className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                    currentCaducidad === opt.value
                      ? opt.activeClass
                      : "border-white/10 bg-slate-800/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Ordenar por
            </p>
            <div className="flex flex-col gap-1.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.sortBy}
                  type="button"
                  onClick={() => {
                    onSortChange(
                      opt.sortBy,
                      opt.toggleOrder(currentSortBy, currentOrder),
                    );
                    onClose();
                  }}
                  className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs transition-colors ${
                    currentSortBy === opt.sortBy
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                      : "border-white/10 bg-slate-800/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{opt.label}</span>
                  <SortIcon
                    sortBy={opt.sortBy}
                    currentSortBy={currentSortBy}
                    currentOrder={currentOrder}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(sheet, document.body)
    : null;
}
