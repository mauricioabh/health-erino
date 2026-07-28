import { Pill } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getMedicamentosFiltered,
  getMedicamentosCount,
} from "@/lib/db/medicamentos";
import { AdminSyncButton } from "./sync-button";
import { DownloadTemplateButton } from "./download-template-button";
import { NuevoMedicamentoModal } from "./nuevo-medicamento-modal";
import { MedicamentosList } from "./medicamentos-list";
import { MedicamentosToolbar, MedicamentosCount } from "./medicamentos-toolbar";
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
  searchParams: Promise<{
    q?: string;
    sortBy?: string;
    order?: string;
    caducidad?: string;
  }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/admin");

  const params = await searchParams;
  const q = params.q ?? "";
  const sortBy = params.sortBy ?? "nombre";
  const order = (params.order === "desc" ? "desc" : "asc") as "asc" | "desc";
  const caducidadFilter: CaducidadFilter = [
    "caducados",
    "validos",
    "sin_fecha",
  ].includes(params.caducidad ?? "")
    ? (params.caducidad as CaducidadFilter)
    : "all";
  const [raw, totalCount] = await Promise.all([
    getMedicamentosFiltered({
      userId,
      q: q || undefined,
      sortBy,
      order,
      caducidadFilter,
    }),
    getMedicamentosCount({ userId, q: q || undefined }),
  ]);
  const medicamentos: Medicamento[] = raw.map((m) => ({
    id: String(m.id),
    nombre: String(m.nombre),
    descripcion: m.descripcion != null ? String(m.descripcion) : null,
    fecha_caducidad: toDateString(m.fecha_caducidad),
    stock: Number(m.stock) || 0,
    user_id: String(m.user_id),
    created_at: m.created_at != null ? String(m.created_at) : undefined,
  }));

  const isFiltered =
    medicamentos.length < totalCount ||
    q.trim() !== "" ||
    caducidadFilter !== "all";

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 md:mb-4">
        <h1 className="hidden md:flex items-center gap-1.5 text-lg font-bold text-white">
          <Pill className="h-5 w-5 text-indigo-400 shrink-0" />
          Panel de medicamentos
        </h1>
        <div className="flex w-full md:w-auto gap-1 md:gap-1.5 md:flex-wrap md:items-center">
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
      <div className="md:hidden mb-2">
        <MedicamentosCount
          totalCount={totalCount}
          showingCount={medicamentos.length}
          isFiltered={isFiltered}
        />
      </div>
      <MedicamentosList initialData={medicamentos} />
    </div>
  );
}
