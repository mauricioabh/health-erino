import { sql } from "@/lib/db/neon";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EditarForm } from "./editar-form";

export default async function EditarMedicamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = (await sql`
    select id, nombre, descripcion, fecha_caducidad, stock from public.medicamentos
    where id = ${id}
  `) as Array<{
    id: string;
    nombre: string;
    descripcion: string | null;
    fecha_caducidad: string | null;
    stock: number;
  }>;

  const data = rows[0];
  if (!data) notFound();

  return (
    <div className="max-w-lg">
      <Link href="/admin" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-2 transition-colors w-fit">
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver
      </Link>
      <h1 className="text-base font-bold text-white mb-3">Editar medicamento</h1>
      <EditarForm medicamento={data} />
    </div>
  );
}
