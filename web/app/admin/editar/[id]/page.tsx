import { sql } from "@/lib/db/neon";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { EditarForm } from "./editar-form";
import type { Medicamento } from "@/lib/types";

export default async function EditarMedicamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/admin");

  const { id } = await params;
  const rows = (await sql`
    select id, nombre, descripcion, fecha_caducidad, stock, user_id, created_at
    from public.medicamentos
    where id = ${id} and user_id = ${userId}
  `) as Array<{
    id: string;
    nombre: string;
    descripcion: string | null;
    fecha_caducidad: string | null;
    stock: number;
    user_id: string;
    created_at: string | null;
  }>;

  const row = rows[0];
  if (!row) notFound();

  const data: Medicamento = {
    id: String(row.id),
    nombre: String(row.nombre),
    descripcion: row.descripcion != null ? String(row.descripcion) : null,
    fecha_caducidad:
      row.fecha_caducidad != null
        ? String(row.fecha_caducidad).slice(0, 10)
        : null,
    stock: Number(row.stock) || 0,
    user_id: String(row.user_id),
    created_at: row.created_at != null ? String(row.created_at) : undefined,
  };

  return (
    <div className="max-w-lg">
      <Link
        href="/admin"
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-2 transition-colors w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver
      </Link>
      <h1 className="text-base font-bold text-white mb-3">
        Editar medicamento
      </h1>
      <EditarForm medicamento={data} />
    </div>
  );
}
