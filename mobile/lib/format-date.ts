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

/** Formatea una fecha YYYY-MM-DD a "15 de marzo de 2025" */
export function formatDateWithMonth(
  dateStr: string | null | undefined
): string | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const [y, m, d] = dateStr.trim().split("-");
  if (!y || !m || !d) return dateStr;
  const monthIdx = parseInt(m, 10) - 1;
  if (monthIdx < 0 || monthIdx > 11) return dateStr;
  return `${parseInt(d, 10)} de ${MESES[monthIdx]} de ${y}`;
}
