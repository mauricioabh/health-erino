import { sql } from "@/lib/db/neon";
import {
  MAX_SEARCH_NOMBRE_CHARS,
  MAX_TOOL_STEPS,
} from "@/lib/llm-security/constants";
import { wrapMedicamentoForLlm } from "@/lib/llm-security/prompts";
import { tool } from "ai";
import { z } from "zod";

const today = new Date().toISOString().slice(0, 10);

type MedicamentoRow = {
  id: string;
  nombre: string;
  descripcion: string | null;
  fecha_caducidad: string | null;
  stock: number;
};

function addCaducado(row: MedicamentoRow) {
  return {
    ...row,
    caducado: row.fecha_caducidad != null && row.fecha_caducidad < today,
  };
}

function formatMedicamentosForLlm(
  rows: Array<MedicamentoRow & { caducado: boolean }>,
): string[] {
  return rows.map((row) => wrapMedicamentoForLlm(row));
}

function validateSearchNombre(nombre: string): string | null {
  const trimmed = nombre.trim().slice(0, MAX_SEARCH_NOMBRE_CHARS);
  if (!trimmed || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function createMedicamentosTools(userId: string) {
  return {
    get_medicamentos: tool({
      description:
        "Lista todos los medicamentos del usuario en la base de datos. Incluye nombre, descripcion, fecha_caducidad, stock y si ya caducó.",
      parameters: z.object({}),
      execute: async (_: Record<string, never>) => {
        const data = await sql`
          select id, nombre, descripcion, fecha_caducidad, stock
          from public.medicamentos
          where user_id = ${userId}
          order by nombre
        `;
        const rows = (data as MedicamentoRow[]).map(addCaducado);
        return formatMedicamentosForLlm(rows);
      },
    }),
    search_medicamento_by_name: tool({
      description:
        "Busca medicamentos por nombre (parcial). Devuelve nombre, descripcion, fecha_caducidad, stock y si está caducado.",
      parameters: z.object({
        nombre: z
          .string()
          .describe("Nombre o parte del nombre del medicamento"),
      }),
      execute: async ({ nombre }: { nombre: string }) => {
        const safeNombre = validateSearchNombre(nombre);
        if (!safeNombre) return [];
        const pattern = `%${safeNombre}%`;
        const data = await sql`
          select id, nombre, descripcion, fecha_caducidad, stock
          from public.medicamentos
          where user_id = ${userId} and nombre ilike ${pattern}
        `;
        const rows = (data as MedicamentoRow[]).map(addCaducado);
        return formatMedicamentosForLlm(rows);
      },
    }),
  };
}

export { MAX_TOOL_STEPS } from "@/lib/llm-security/constants";
export { SYSTEM_PROMPT } from "@/lib/llm-security/prompts";
