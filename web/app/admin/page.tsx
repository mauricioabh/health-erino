import { sql } from "@/lib/db/neon";
import Link from "next/link";
import { AdminSyncButton } from "./sync-button";
import { MedicamentosList } from "./medicamentos-list";

export default async function AdminPage() {
  const medicamentos = (await sql`
    select * from public.medicamentos
    order by nombre
  `) as Array<{
    id: string;
    nombre: string;
    descripcion: string | null;
    fecha_caducidad: string | null;
    stock: number;
    created_at: string | null;
  }>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Panel de medicamentos
        </h1>
        <div className="flex gap-2">
          <AdminSyncButton />
          <Link
            href="/admin/nuevo"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white font-medium hover:bg-emerald-700"
          >
            Nuevo medicamento
          </Link>
        </div>
      </div>
      <MedicamentosList initialData={medicamentos} />
    </div>
  );
}
