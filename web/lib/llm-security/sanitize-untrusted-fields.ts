import {
  MAX_DESCRIPCION_FIELD_CHARS,
  MAX_NOMBRE_FIELD_CHARS,
} from "./constants";
import { INJECTION_PATTERNS } from "./untrusted-data-detect";

function stripControlChars(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function neutralizeInjectionSequences(text: string): string {
  let result = text;
  for (const pattern of INJECTION_PATTERNS) {
    result = result.replace(pattern, "[redacted]");
  }
  return result;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) : text;
}

export function sanitizeNombre(nombre: string): string {
  const cleaned = truncate(
    neutralizeInjectionSequences(stripControlChars(nombre.trim())),
    MAX_NOMBRE_FIELD_CHARS,
  );
  return cleaned || "Sin nombre";
}

export function sanitizeDescripcion(
  descripcion: string | null | undefined,
): string | null {
  if (!descripcion?.trim()) return null;
  const cleaned = truncate(
    neutralizeInjectionSequences(stripControlChars(descripcion.trim())),
    MAX_DESCRIPCION_FIELD_CHARS,
  );
  return cleaned || null;
}

export function sanitizeMedicamentoFields<
  T extends {
    nombre: string;
    descripcion: string | null;
  },
>(row: T): T {
  return {
    ...row,
    nombre: sanitizeNombre(row.nombre),
    descripcion: sanitizeDescripcion(row.descripcion),
  };
}
