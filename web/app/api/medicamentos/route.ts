import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db/neon";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { nombre, descripcion, fecha_caducidad, stock } = body;
  if (!nombre || typeof nombre !== "string") {
    return NextResponse.json(
      { error: "nombre es requerido" },
      { status: 400 }
    );
  }

  const desc = descripcion?.trim() || null;
  const fecha = fecha_caducidad || null;
  const st = typeof stock === "number" ? stock : parseInt(String(stock), 10) || 0;

  const rows = await sql`
    insert into public.medicamentos (nombre, descripcion, fecha_caducidad, stock)
    values (${nombre.trim()}, ${desc}, ${fecha}, ${st})
    returning id
  `;
  const id = (rows as { id: string }[])[0]?.id;
  return NextResponse.json({ ok: true, id });
}
