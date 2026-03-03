import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db/neon";
import { NextResponse } from "next/server";
import { getMedicamentosFiltered, getMedicamentosCount } from "@/lib/db/medicamentos";

const SORT_KEYS = ["nombre", "descripcion", "fecha_caducidad"] as const;
const CADUCIDAD_VALUES = ["all", "caducados", "validos", "sin_fecha"] as const;
type SortKey = (typeof SORT_KEYS)[number];
type CaducidadFilter = (typeof CADUCIDAD_VALUES)[number];

function isValidSort(s: string | null): s is SortKey {
  return s != null && SORT_KEYS.includes(s as SortKey);
}

function isValidCaducidad(s: string | null): s is CaducidadFilter {
  return s != null && CADUCIDAD_VALUES.includes(s as CaducidadFilter);
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const sortBy = isValidSort(searchParams.get("sortBy")) ? searchParams.get("sortBy") : "nombre";
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";
  const caducidad = isValidCaducidad(searchParams.get("caducidad")) ? searchParams.get("caducidad") : "all";

  const [rows, totalCount] = await Promise.all([
    getMedicamentosFiltered({
      q: q || undefined,
      sortBy,
      order,
      caducidadFilter: caducidad,
    }),
    getMedicamentosCount({ q: q || undefined }),
  ]);

  const out = rows.map((r) => ({
    id: String(r.id),
    nombre: String(r.nombre),
    descripcion: r.descripcion != null ? String(r.descripcion) : null,
    fecha_caducidad: r.fecha_caducidad != null ? String(r.fecha_caducidad).slice(0, 10) : null,
    stock: Number(r.stock) || 0,
  }));

  return NextResponse.json({ items: out, totalCount });
}

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
