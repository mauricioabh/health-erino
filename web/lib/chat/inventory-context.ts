import { sql } from "@/lib/db/neon";
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
  fecha_caducidad: string | null;
  stock: number;
};

/**
 * Carga el inventario del usuario autenticado en el servidor.
 * Evita tool-calling multi-step con Gemini (thought_signature / respuestas vacías).
 */
export async function loadUserMedicamentosInventory(
  userId: string,
  today = new Date().toISOString().slice(0, 10),
): Promise<MedicamentoInventoryRow[]> {
  const data = (await sql`
    select nombre, descripcion, fecha_caducidad, stock
    from public.medicamentos
    where user_id = ${userId}
    order by nombre
  `) as MedicamentoDbRow[];

  return data.map((row) => {
    const sanitized = sanitizeMedicamentoFields(row);
    return {
      ...sanitized,
      caducado:
        sanitized.fecha_caducidad != null && sanitized.fecha_caducidad < today,
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

  return [
    `INVENTARIO DEL USUARIO (${rows.length} medicamento(s); única fuente permitida para recomendaciones):`,
    ...rows.map((row) => wrapMedicamentoForLlm(row)),
  ].join("\n\n");
}

export function buildChatSystemPrompt(rows: MedicamentoInventoryRow[]): string {
  return `${CHAT_SYSTEM_PROMPT_BASE}\n\n${formatInventoryForPrompt(rows)}`;
}
