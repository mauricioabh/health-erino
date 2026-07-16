import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db/neon";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = (await sql`
    delete from public.medicamentos where id = ${id} and user_id = ${userId}
    returning id
  `) as Array<{ id: string }>;
  if (deleted.length === 0) {
    const exists = await sql`
      select id from public.medicamentos where id = ${id} limit 1
    `;
    if (exists.length === 0) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const rows = (await sql`
    select nombre, descripcion, fecha_caducidad, stock from public.medicamentos
    where id = ${id} and user_id = ${userId}
  `) as Array<{
    nombre: string;
    descripcion: string | null;
    fecha_caducidad: string | null;
    stock: number;
  }>;
  if (rows.length === 0) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  const cur = rows[0];
  const nombre = body.nombre !== undefined ? String(body.nombre) : cur.nombre;
  const descripcion =
    body.descripcion !== undefined ? body.descripcion || null : cur.descripcion;
  const fecha_caducidad =
    body.fecha_caducidad !== undefined
      ? body.fecha_caducidad || null
      : cur.fecha_caducidad;
  const stock = body.stock !== undefined ? Number(body.stock) : cur.stock;

  await sql`
    update public.medicamentos
    set nombre = ${nombre}, descripcion = ${descripcion}, fecha_caducidad = ${fecha_caducidad}, stock = ${stock}
    where id = ${id} and user_id = ${userId}
  `;
  return NextResponse.json({ ok: true });
}
