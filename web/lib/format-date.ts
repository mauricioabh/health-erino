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

/** Formatea una fecha YYYY-MM-DD a "15 de marzo de 2025" */
export function formatDateWithMonth(
  dateStr: string | null | undefined,
): string | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const [y, m, d] = dateStr.trim().split("-");
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
  const dateOnly = dateStr.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return "sin_fecha";
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (dateOnly < today) return "caducado";
  return "valido";
}
