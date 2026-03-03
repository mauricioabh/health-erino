import { Pill } from "lucide-react";
import { getMedicamentosFiltered, getMedicamentosCount } from "@/lib/db/medicamentos";
import { AdminSyncButton } from "./sync-button";
import { DownloadTemplateButton } from "./download-template-button";
import { NuevoMedicamentoModal } from "./nuevo-medicamento-modal";
import { MedicamentosList } from "./medicamentos-list";
import { MedicamentosToolbar } from "./medicamentos-toolbar";
import type { Medicamento } from "@/lib/types";
import type { CaducidadFilter } from "@/lib/db/medicamentos";

export const dynamic = "force-dynamic";

function toDateString(v: unknown): string | null {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") return v || null;
  return null;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sortBy?: string; order?: string; caducidad?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const sortBy = params.sortBy ?? "nombre";
  const order = (params.order === "desc" ? "desc" : "asc") as "asc" | "desc";
  const caducidadFilter: CaducidadFilter = ["caducados", "validos", "sin_fecha"].includes(params.caducidad ?? "")
    ? (params.caducidad as CaducidadFilter)
    : "all";
  const [raw, totalCount] = await Promise.all([
    getMedicamentosFiltered({ q: q || undefined, sortBy, order, caducidadFilter }),
    getMedicamentosCount({ q: q || undefined }),
  ]);
  const medicamentos: Medicamento[] = raw.map((m) => ({
    id: String(m.id),
    nombre: String(m.nombre),
    descripcion: m.descripcion != null ? String(m.descripcion) : null,
    fecha_caducidad: toDateString(m.fecha_caducidad),
    stock: Number(m.stock) || 0,
  }));

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="flex items-center gap-1.5 text-lg font-bold text-white">
          <Pill className="h-5 w-5 text-indigo-400 shrink-0" />
          Panel de medicamentos
        </h1>
        <div className="flex flex-wrap items-center gap-1.5">
          <DownloadTemplateButton />
          <AdminSyncButton />
          <NuevoMedicamentoModal />
        </div>
      </div>
      <MedicamentosToolbar
        initialQ={q}
        initialSortBy={sortBy as "nombre" | "descripcion" | "fecha_caducidad"}
        initialOrder={order}
        initialCaducidadFilter={caducidadFilter}
        totalCount={totalCount}
        showingCount={medicamentos.length}
      />
      <MedicamentosList initialData={medicamentos} />
    </div>
  );
}
