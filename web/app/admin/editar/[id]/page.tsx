import { sql } from "@/lib/db/neon";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditarForm } from "./editar-form";

export default async function EditarMedicamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = (await sql`
    select * from public.medicamentos
    where id = ${id}
  `) as Array<{
    id: string;
    nombre: string;
    descripcion: string | null;
    fecha_caducidad: string | null;
    stock: number;
    created_at: string | null;
  }>;

  const data = rows[0];
  if (!data) notFound();

  return (
    <div className="max-w-lg">
      <Link href="/admin" className="text-slate-600 hover:text-slate-800 mb-4 inline-block">
        Volver
      </Link>
      <h1 className="text-xl font-bold text-slate-800 mb-4">Editar medicamento</h1>
      <EditarForm medicamento={data} />
    </div>
  );
}
