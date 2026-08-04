const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export type CaducidadStatus = "valido" | "caducado" | "sin_fecha";

/**
 * Normalize Neon `date` / string values to `YYYY-MM-DD`.
 * Neon often returns JS `Date` at UTC midnight for DATE columns.
 */
export function toDateString(v: unknown): string | null {
  if (v == null) return null;
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, "0");
    const d = String(v.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  }
  return null;
}

/** Local calendar today as YYYY-MM-DD (aligned with admin UI / SQL current_date intent). */
export function localTodayString(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** True when fecha is a valid YYYY-MM-DD strictly before today. */
export function isCaducado(
  fecha: unknown,
  today = localTodayString(),
): boolean {
  const dateOnly = toDateString(fecha);
  return dateOnly != null && dateOnly < today;
}

/** Formatea una fecha YYYY-MM-DD a "15 de marzo de 2025" */
export function formatDateWithMonth(
  dateStr: string | null | undefined,
): string | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const normalized = toDateString(dateStr) ?? dateStr.trim();
  const [y, m, d] = normalized.split("-");
  if (!y || !m || !d) return dateStr;
  const monthIdx = parseInt(m, 10) - 1;
  if (monthIdx < 0 || monthIdx > 11) return dateStr;
  return `${parseInt(d, 10)} de ${MESES[monthIdx]} de ${y}`;
}

/** Formatea YYYY-MM-DD a YY/MM para filas compactas en móvil */
export function formatDateYYMM(
  dateStr: string | null | undefined,
): string | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const [y, m] = dateStr.trim().split("-");
  if (!y || !m || y.length < 2) return null;
  return `${y.slice(-2)}/${m}`;
}

/** Estado de caducidad alineado con filtros SQL (fecha local del cliente) */
export function getCaducidadStatus(
  dateStr: string | null | undefined,
): CaducidadStatus {
  if (!dateStr || typeof dateStr !== "string") return "sin_fecha";
  const dateOnly = toDateString(dateStr);
  if (!dateOnly) return "sin_fecha";
  if (isCaducado(dateOnly)) return "caducado";
  return "valido";
}
