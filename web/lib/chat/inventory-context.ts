import { sql } from "@/lib/db/neon";
import {
  formatDateWithMonth,
  isCaducado,
  localTodayString,
  toDateString,
} from "@/lib/format-date";
import { sanitizeMedicamentoFields } from "@/lib/llm-security/sanitize-untrusted-fields";
import {
  CHAT_SYSTEM_PROMPT_BASE,
  wrapMedicamentoForLlm,
} from "@/lib/llm-security/prompts";

export type MedicamentoInventoryRow = {
  nombre: string;
  descripcion: string | null;
  fecha_caducidad: string | null;
  stock: number;
  caducado: boolean;
};

type MedicamentoDbRow = {
  nombre: string;
  descripcion: string | null;
  fecha_caducidad: unknown;
  stock: number;
};

/**
 * Carga el inventario del usuario autenticado en el servidor.
 * Evita tool-calling multi-step con Gemini (thought_signature / respuestas vacías).
 */
export async function loadUserMedicamentosInventory(
  userId: string,
  today = localTodayString(),
): Promise<MedicamentoInventoryRow[]> {
  const data = (await sql`
    select nombre, descripcion, fecha_caducidad, stock
    from public.medicamentos
    where user_id = ${userId}
    order by nombre
  `) as MedicamentoDbRow[];

  return data.map((row) => {
    const fecha = toDateString(row.fecha_caducidad);
    const sanitized = sanitizeMedicamentoFields({
      ...row,
      fecha_caducidad: fecha,
    });
    return {
      nombre: sanitized.nombre,
      descripcion: sanitized.descripcion,
      fecha_caducidad: fecha,
      stock: sanitized.stock,
      // Neon returns Date objects; never compare Date < "YYYY-MM-DD" (always false).
      caducado: isCaducado(fecha, today),
    };
  });
}

export function formatInventoryForPrompt(
  rows: MedicamentoInventoryRow[],
): string {
  if (rows.length === 0) {
    return [
      "INVENTARIO DEL USUARIO: (vacío — no hay medicamentos guardados).",
      "Si pregunta qué puede tomar, dile que añada medicamentos desde el panel de administración.",
    ].join("\n");
  }

  const vigentes = rows.filter((r) => !r.caducado);
  const caducados = rows.filter((r) => r.caducado);

  const sections: string[] = [
    `INVENTARIO DEL USUARIO (${rows.length} medicamento(s); única fuente permitida).`,
    "IMPORTANTE: Solo los de la sección VIGENTES pueden recomendarse para tomar. Los CADUCADOS solo se mencionan al final como no consumir.",
  ];

  sections.push("");
  sections.push(
    `### VIGENTES (caducado=false) — ${vigentes.length} — únicos recomendables para consumo`,
  );
  if (vigentes.length === 0) {
    sections.push("(ninguno vigente)");
  } else {
    for (const row of vigentes) {
      sections.push("");
      sections.push(wrapMedicamentoForLlm(row));
      const legible = formatDateWithMonth(row.fecha_caducidad);
      if (legible) {
        sections.push(`fecha_legible: ${legible}`);
      }
    }
  }

  sections.push("");
  sections.push(
    `### CADUCADOS (caducado=true) — ${caducados.length} — NO recomendar para tomar`,
  );
  if (caducados.length === 0) {
    sections.push("(ninguno caducado)");
  } else {
    for (const row of caducados) {
      sections.push("");
      sections.push(wrapMedicamentoForLlm(row));
      const legible = formatDateWithMonth(row.fecha_caducidad);
      if (legible) {
        sections.push(`fecha_legible: venció el ${legible}`);
      }
    }
  }

  return sections.join("\n");
}

export function buildChatSystemPrompt(rows: MedicamentoInventoryRow[]): string {
  return `${CHAT_SYSTEM_PROMPT_BASE}\n\n${formatInventoryForPrompt(rows)}`;
}
