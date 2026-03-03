"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ArrowDownAZ, ArrowUpAZ, AlertTriangle, CheckCircle, CalendarOff } from "lucide-react";
import type { CaducidadFilter } from "@/lib/db/medicamentos";

type SortBy = "nombre" | "descripcion" | "fecha_caducidad";

export function MedicamentosToolbar({
  initialQ,
  initialSortBy,
  initialOrder,
  initialCaducidadFilter,
  totalCount,
  showingCount,
}: {
  initialQ: string;
  initialSortBy: SortBy;
  initialOrder: "asc" | "desc";
  initialCaducidadFilter: CaducidadFilter;
  totalCount: number;
  showingCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQ);

  const updateParams = useCallback(
    (updates: { q?: string; sortBy?: SortBy; order?: "asc" | "desc"; caducidad?: CaducidadFilter }) => {
      const p = new URLSearchParams(searchParams.toString());
      if (updates.q !== undefined) (updates.q === "" ? p.delete("q") : p.set("q", updates.q));
      if (updates.sortBy !== undefined) p.set("sortBy", updates.sortBy);
      if (updates.order !== undefined) p.set("order", updates.order);
      if (updates.caducidad !== undefined) (updates.caducidad === "all" ? p.delete("caducidad") : p.set("caducidad", updates.caducidad));
      router.push(`/admin?${p.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: q.trim() });
  };

  const currentSortBy = (searchParams.get("sortBy") ?? "nombre") as SortBy;
  const currentOrder = (searchParams.get("order") ?? "asc") as "asc" | "desc";
  const currentCaducidad = (searchParams.get("caducidad") ?? initialCaducidadFilter) as CaducidadFilter;

  const isFiltered = showingCount < totalCount || initialQ.trim() !== "" || currentCaducidad !== "all";

  return (
    <div className="mb-2 flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-400">
          {isFiltered ? (
            <>Mostrando <span className="font-medium text-slate-300">{showingCount}</span> de <span className="font-medium text-slate-300">{totalCount}</span> medicamentos</>
          ) : (
            <><span className="font-medium text-slate-300">{totalCount}</span> medicamentos</>
          )}
        </span>
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] text-slate-400 mr-0.5">Filtrar:</span>
          <button
            type="button"
            onClick={() => updateParams({ caducidad: "all" })}
            className={`flex items-center gap-1 rounded-md border px-1.5 py-1 text-[11px] transition-colors ${
              currentCaducidad === "all"
                ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                : "border-white/10 bg-slate-800/80 text-slate-400 hover:text-slate-200"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => updateParams({ caducidad: "caducados" })}
            className={`flex items-center gap-0.5 rounded-md border px-1.5 py-1 text-[11px] transition-colors ${
              currentCaducidad === "caducados"
                ? "border-red-500/50 bg-red-500/20 text-red-300"
                : "border-white/10 bg-slate-800/80 text-slate-400 hover:text-slate-200"
            }`}
            title="Solo caducados"
          >
            <AlertTriangle className="h-3 w-3" />
            Caducados
          </button>
          <button
            type="button"
            onClick={() => updateParams({ caducidad: "validos" })}
            className={`flex items-center gap-0.5 rounded-md border px-1.5 py-1 text-[11px] transition-colors ${
              currentCaducidad === "validos"
                ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                : "border-white/10 bg-slate-800/80 text-slate-400 hover:text-slate-200"
            }`}
            title="Solo vigentes"
          >
            <CheckCircle className="h-3 w-3" />
            Válidos
          </button>
          <button
            type="button"
            onClick={() => updateParams({ caducidad: "sin_fecha" })}
            className={`flex items-center gap-0.5 rounded-md border px-1.5 py-1 text-[11px] transition-colors ${
              currentCaducidad === "sin_fecha"
                ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                : "border-white/10 bg-slate-800/80 text-slate-400 hover:text-slate-200"
            }`}
            title="Sin fecha de caducidad"
          >
            <CalendarOff className="h-3 w-3" />
            Sin fecha
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <form onSubmit={handleSearchSubmit} className="flex gap-1.5 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar en nombre, descripción, caducidad, stock..."
            className="w-full rounded-md border border-white/10 bg-slate-800/80 pl-7 pr-2 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs text-white hover:bg-emerald-500 transition-colors shrink-0"
        >
          Buscar
        </button>
      </form>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-slate-400 mr-0.5">Ordenar:</span>
        <button
          type="button"
          onClick={() => updateParams({ sortBy: "nombre", order: currentSortBy === "nombre" && currentOrder === "asc" ? "desc" : "asc" })}
          className={`flex items-center gap-0.5 rounded-md border px-1.5 py-1 text-[11px] transition-colors ${
            currentSortBy === "nombre"
              ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
              : "border-white/10 bg-slate-800/80 text-slate-400 hover:text-slate-200"
          }`}
          title="Nombre A-Z / Z-A"
        >
          Nombre {currentSortBy === "nombre" ? (currentOrder === "asc" ? "A-Z" : "Z-A") : null}
          {currentSortBy === "nombre"
            ? (currentOrder === "asc" ? <ArrowUpAZ className="h-3.5 w-3.5 shrink-0" /> : <ArrowDownAZ className="h-3.5 w-3.5 shrink-0" />)
            : <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />}
        </button>
        <button
          type="button"
          onClick={() => updateParams({ sortBy: "descripcion", order: currentSortBy === "descripcion" && currentOrder === "asc" ? "desc" : "asc" })}
          className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs transition-colors ${
            currentSortBy === "descripcion"
              ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
              : "border-white/10 bg-slate-800/80 text-slate-400 hover:text-slate-200"
          }`}
          title="Descripción A-Z / Z-A"
        >
          Descripción {currentSortBy === "descripcion" ? (currentOrder === "asc" ? "A-Z" : "Z-A") : null}
          {currentSortBy === "descripcion"
            ? (currentOrder === "asc" ? <ArrowUpAZ className="h-3.5 w-3.5 shrink-0" /> : <ArrowDownAZ className="h-3.5 w-3.5 shrink-0" />)
            : <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />}
        </button>
        <button
          type="button"
          onClick={() => updateParams({ sortBy: "fecha_caducidad", order: currentSortBy === "fecha_caducidad" && currentOrder === "desc" ? "asc" : "desc" })}
          className={`flex items-center gap-0.5 rounded-md border px-1.5 py-1 text-[11px] transition-colors ${
            currentSortBy === "fecha_caducidad"
              ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
              : "border-white/10 bg-slate-800/80 text-slate-400 hover:text-slate-200"
          }`}
          title="Caducidad: más reciente primero / más antigua primero"
        >
          Caducidad {currentSortBy === "fecha_caducidad" ? (currentOrder === "desc" ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />) : <ArrowUpDown className="h-3.5 w-3.5" />}
        </button>
      </div>
      </div>
    </div>
  );
}
