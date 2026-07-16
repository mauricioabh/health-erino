import { sql } from "./neon";
import type { MedicamentoRow } from "./neon";

const SORT_KEYS = ["nombre", "descripcion", "fecha_caducidad"] as const;
export type MedicamentosSortBy = (typeof SORT_KEYS)[number];
export type MedicamentosOrder = "asc" | "desc";
export type CaducidadFilter = "all" | "caducados" | "validos" | "sin_fecha";

function isValidSort(s: string | null | undefined): s is MedicamentosSortBy {
  return s != null && (SORT_KEYS as readonly string[]).includes(s);
}

function isValidCaducidadFilter(
  s: string | null | undefined,
): s is CaducidadFilter {
  return (
    s === "caducados" || s === "validos" || s === "all" || s === "sin_fecha"
  );
}

export async function getMedicamentosFiltered(params: {
  userId: string;
  q?: string | null;
  sortBy?: string | null;
  order?: string | null;
  caducidadFilter?: string | null;
}): Promise<MedicamentoRow[]> {
  const q = (params.q ?? "").trim();
  const sortBy = isValidSort(params.sortBy) ? params.sortBy : "nombre";
  const order = params.order === "desc" ? "desc" : "asc";
  const caducidad = isValidCaducidadFilter(params.caducidadFilter)
    ? params.caducidadFilter
    : "all";
  const pattern = q ? `%${q}%` : null;
  const userId = params.userId;

  const orderBy =
    sortBy === "nombre"
      ? order === "desc"
        ? "nombre desc"
        : "nombre asc"
      : sortBy === "descripcion"
        ? order === "desc"
          ? "descripcion desc nulls last"
          : "descripcion asc nulls last"
        : order === "desc"
          ? "fecha_caducidad desc nulls last"
          : "fecha_caducidad asc nulls last";

  let rows: MedicamentoRow[];

  if (!pattern) {
    if (caducidad === "all") {
      rows = (await (
        sql as (q: string, params?: unknown[]) => Promise<unknown[]>
      )(
        `select id, nombre, descripcion, fecha_caducidad, stock, user_id, created_at from public.medicamentos where user_id = $1 order by ${orderBy}`,
        [userId],
      )) as MedicamentoRow[];
    } else if (caducidad === "caducados") {
      rows = (await (
        sql as (q: string, params?: unknown[]) => Promise<unknown[]>
      )(
        `select id, nombre, descripcion, fecha_caducidad, stock, user_id, created_at from public.medicamentos where user_id = $1 and fecha_caducidad is not null and fecha_caducidad < current_date order by ${orderBy}`,
        [userId],
      )) as MedicamentoRow[];
    } else if (caducidad === "sin_fecha") {
      rows = (await (
        sql as (q: string, params?: unknown[]) => Promise<unknown[]>
      )(
        `select id, nombre, descripcion, fecha_caducidad, stock, user_id, created_at from public.medicamentos where user_id = $1 and fecha_caducidad is null order by ${orderBy}`,
        [userId],
      )) as MedicamentoRow[];
    } else {
      rows = (await (
        sql as (q: string, params?: unknown[]) => Promise<unknown[]>
      )(
        `select id, nombre, descripcion, fecha_caducidad, stock, user_id, created_at from public.medicamentos where user_id = $1 and (fecha_caducidad is null or fecha_caducidad >= current_date) order by ${orderBy}`,
        [userId],
      )) as MedicamentoRow[];
    }
  } else {
    const searchCond =
      "(nombre ilike $2 or descripcion ilike $2 or fecha_caducidad::text ilike $2 or stock::text ilike $2)";
    if (caducidad === "all") {
      rows = (await (
        sql as (q: string, params?: unknown[]) => Promise<unknown[]>
      )(
        `select id, nombre, descripcion, fecha_caducidad, stock, user_id, created_at from public.medicamentos where user_id = $1 and ${searchCond} order by ${orderBy}`,
        [userId, pattern],
      )) as MedicamentoRow[];
    } else if (caducidad === "caducados") {
      rows = (await (
        sql as (q: string, params?: unknown[]) => Promise<unknown[]>
      )(
        `select id, nombre, descripcion, fecha_caducidad, stock, user_id, created_at from public.medicamentos where user_id = $1 and ${searchCond} and fecha_caducidad is not null and fecha_caducidad < current_date order by ${orderBy}`,
        [userId, pattern],
      )) as MedicamentoRow[];
    } else if (caducidad === "sin_fecha") {
      rows = (await (
        sql as (q: string, params?: unknown[]) => Promise<unknown[]>
      )(
        `select id, nombre, descripcion, fecha_caducidad, stock, user_id, created_at from public.medicamentos where user_id = $1 and ${searchCond} and fecha_caducidad is null order by ${orderBy}`,
        [userId, pattern],
      )) as MedicamentoRow[];
    } else {
      rows = (await (
        sql as (q: string, params?: unknown[]) => Promise<unknown[]>
      )(
        `select id, nombre, descripcion, fecha_caducidad, stock, user_id, created_at from public.medicamentos where user_id = $1 and ${searchCond} and (fecha_caducidad is null or fecha_caducidad >= current_date) order by ${orderBy}`,
        [userId, pattern],
      )) as MedicamentoRow[];
    }
  }

  return rows;
}

export async function getMedicamentosCount(params: {
  userId: string;
  q?: string | null;
}): Promise<number> {
  const pattern = (params.q ?? "").trim()
    ? `%${(params.q ?? "").trim()}%`
    : null;
  const userId = params.userId;
  if (!pattern) {
    const r = await sql`
      select count(*)::int as c from public.medicamentos where user_id = ${userId}
    `;
    return (r[0] as { c: number })?.c ?? 0;
  }
  const r = await sql`
    select count(*)::int as c from public.medicamentos
    where user_id = ${userId}
      and (nombre ilike ${pattern} or descripcion ilike ${pattern} or fecha_caducidad::text ilike ${pattern} or stock::text ilike ${pattern})
  `;
  return (r[0] as { c: number })?.c ?? 0;
}
