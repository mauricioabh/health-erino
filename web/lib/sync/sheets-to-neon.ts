import { get } from "@vercel/blob";
import Papa from "papaparse";
import * as Sentry from "@sentry/nextjs";
import { sql } from "@/lib/db/neon";
import { enrichDescriptions } from "@/lib/gemini-enrich";
import { sanitizeMedicamentoFields } from "@/lib/llm-security/sanitize-untrusted-fields";
import { detectUntrustedInjection } from "@/lib/llm-security/untrusted-data-detect";

export const SETTINGS_KEY = "initial_csv_blob_url";
export const SYNC_USER_KEY = "sync_user_id";

export type SheetsSyncRow = {
  nombre: string;
  descripcion: string | null;
  fecha_caducidad: string | null;
  stock: number;
};

export type SheetsSyncResult =
  | { ok: true; inserted: number; source: string }
  | { ok: false; error: string; status: number };

function normalizeRow(row: Record<string, string>): SheetsSyncRow {
  const get = (key: string) => {
    const k = Object.keys(row).find(
      (c) => c?.toLowerCase().trim() === key.toLowerCase(),
    );
    return (k && row[k]?.trim()) || "";
  };
  const rawNombre = get("nombre") || get("name");
  const rawDesc = get("descripcion") || get("description");
  const rawFecha =
    get("fecha_caducidad") || get("caducidad") || get("expiration");
  const rawStock = get("stock");
  let fecha: string | null = null;
  if (rawFecha) {
    const d = new Date(rawFecha);
    if (!Number.isNaN(d.getTime())) {
      fecha = d.toISOString().slice(0, 10);
    }
  }
  const stock = rawStock ? parseInt(rawStock, 10) : 1;
  return sanitizeMedicamentoFields({
    nombre: rawNombre || "Sin nombre",
    descripcion: rawDesc || null,
    fecha_caducidad: fecha,
    stock: Number.isNaN(stock) || stock < 0 ? 1 : stock,
  });
}

function logUntrustedInjection(
  row: SheetsSyncRow,
  detection: ReturnType<typeof detectUntrustedInjection>,
) {
  if (!detection.suspected) return;
  console.warn("[llm-security] untrusted_data_injection_suspected", {
    field: detection.field,
    pattern: detection.pattern,
  });
  Sentry.addBreadcrumb({
    category: "llm-security",
    message: "untrusted_data_injection_suspected",
    level: "warning",
    data: { field: detection.field, pattern: detection.pattern },
  });
}

async function resolveCsvUrl(explicitUrl?: string): Promise<string | null> {
  if (explicitUrl?.trim()) {
    return explicitUrl.trim();
  }
  const envUrl = process.env.GOOGLE_SHEET_CSV_URL?.trim();
  if (envUrl) {
    return envUrl;
  }
  const row = await sql`
    select value from public.app_settings where key = ${SETTINGS_KEY} limit 1
  `;
  return (row?.[0] as { value?: string } | undefined)?.value ?? null;
}

async function fetchCsvText(csvUrl: string): Promise<string | null> {
  if (csvUrl.includes("blob.vercel-storage.com")) {
    const blobResult = await get(csvUrl, { access: "private" });
    if (!blobResult || blobResult.statusCode !== 200 || !blobResult.stream) {
      return null;
    }
    return new Response(blobResult.stream).text();
  }
  const res = await fetch(csvUrl);
  if (!res.ok) {
    return null;
  }
  return res.text();
}

async function persistSyncUserId(userId: string): Promise<void> {
  await sql`
    insert into public.app_settings (key, value, updated_at)
    values (${SYNC_USER_KEY}, ${userId}, now())
    on conflict (key) do update set value = ${userId}, updated_at = now()
  `;
}

export async function resolveSyncUserId(
  explicitUserId?: string,
): Promise<string | null> {
  if (explicitUserId?.trim()) return explicitUserId.trim();
  const row = await sql`
    select value from public.app_settings where key = ${SYNC_USER_KEY} limit 1
  `;
  return (row?.[0] as { value?: string } | undefined)?.value?.trim() ?? null;
}

/** Shared Sheets/Blob CSV → Neon sync (manual POST and Inngest cron). */
export async function runSheetsToNeonSync(options?: {
  blobUrl?: string;
  userId?: string;
}): Promise<SheetsSyncResult> {
  try {
    const userId = await resolveSyncUserId(options?.userId);
    if (!userId) {
      return {
        ok: false,
        error:
          "No hay user_id para sync: inicia sesión y sube un CSV, o configura sync_user_id en app_settings.",
        status: 400,
      };
    }

    const csvUrl = await resolveCsvUrl(options?.blobUrl);
    if (!csvUrl) {
      return {
        ok: false,
        error:
          "No hay URL de CSV: define GOOGLE_SHEET_CSV_URL, sube un CSV al panel, o pasa blobUrl.",
        status: 400,
      };
    }

    const csv = await fetchCsvText(csvUrl);
    if (csv === null) {
      return {
        ok: false,
        error: "Error al obtener el CSV desde la fuente configurada",
        status: 502,
      };
    }

    const parsed = Papa.parse<Record<string, string>>(csv, {
      header: true,
      skipEmptyLines: true,
    });
    if (parsed.errors.length) {
      return {
        ok: false,
        error: "Error parseando CSV",
        status: 400,
      };
    }

    let rows = parsed.data
      .map(normalizeRow)
      .filter((r) => r.nombre && r.nombre !== "Sin nombre");

    for (const row of rows) {
      const detection = detectUntrustedInjection(row);
      logUntrustedInjection(row, detection);
    }

    const needEnrich = rows.filter((r) => r.nombre && !r.descripcion?.trim());
    if (needEnrich.length > 0) {
      try {
        const nombres = [
          ...new Set(needEnrich.map((r) => r.nombre.trim()).filter(Boolean)),
        ];
        const descMap = await enrichDescriptions(nombres);
        rows = rows.map((r) => {
          if (r.nombre && !r.descripcion?.trim()) {
            const desc =
              descMap.get(r.nombre) ??
              descMap.get(r.nombre.trim()) ??
              descMap.get(r.nombre.toLowerCase());
            if (desc) {
              return sanitizeMedicamentoFields({
                ...r,
                descripcion: desc,
              });
            }
          }
          return r;
        });
      } catch (err) {
        console.error("Enrich descriptions:", err);
      }
    }

    await persistSyncUserId(userId);
    await sql`delete from public.medicamentos where user_id = ${userId}`;

    if (rows.length === 0) {
      return { ok: true, inserted: 0, source: csvUrl };
    }

    for (const r of rows) {
      await sql`
        insert into public.medicamentos (nombre, descripcion, fecha_caducidad, stock, user_id)
        values (${r.nombre}, ${r.descripcion}, ${r.fecha_caducidad}, ${r.stock}, ${userId})
      `;
    }

    return { ok: true, inserted: rows.length, source: csvUrl };
  } catch (e) {
    console.error("[sync/sheets-to-neon]", e);
    return { ok: false, error: "Error interno", status: 500 };
  }
}
