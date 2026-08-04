import { sql } from "@/lib/db/neon";
import { tool } from "ai";
import { z } from "zod";
import { isCaducado, localTodayString, toDateString } from "@/lib/format-date";
import { MAX_SEARCH_NOMBRE_CHARS } from "@/lib/llm-security/constants";
import { sanitizeMedicamentoFields } from "@/lib/llm-security/sanitize-untrusted-fields";

export { MAX_TOOL_STEPS } from "@/lib/llm-security/constants";
export { SYSTEM_PROMPT } from "@/lib/llm-security/prompts";

type MedicamentoToolRow = {
  id: string;
  nombre: string;
  descripcion: string | null;
  fecha_caducidad: unknown;
  stock: number;
};

function normalizeRow(row: MedicamentoToolRow) {
  const fecha = toDateString(row.fecha_caducidad);
  const sanitized = sanitizeMedicamentoFields({
    ...row,
    fecha_caducidad: fecha,
  });
  return {
    ...sanitized,
    fecha_caducidad: fecha,
    caducado: isCaducado(fecha, localTodayString()),
  };
}

/**
 * Herramientas de medicamentos acotadas al usuario autenticado.
 * El `userId` viene del servidor (Clerk), nunca del modelo, para evitar
 * que el LLM acceda a inventarios de otros usuarios.
 */
export function createMedicamentosTools(userId: string) {
  return {
    get_medicamentos: tool({
      description:
        "Lista todos los medicamentos del usuario. Incluye nombre, descripcion, fecha_caducidad, stock y si ya caducó. Llama a esta tool siempre que pregunten qué pueden tomar para un síntoma.",
      // Gemini rejects tools with empty parameter objects (z.object({})).
      parameters: z.object({
        incluir_caducados: z
          .boolean()
          .optional()
          .describe(
            "Si es false, omite medicamentos caducados. Por defecto true (incluye todos).",
          ),
      }),
      execute: async ({
        incluir_caducados,
      }: {
        incluir_caducados?: boolean;
      }) => {
        const data = (await sql`
          select id, nombre, descripcion, fecha_caducidad, stock
          from public.medicamentos
          where user_id = ${userId}
          order by nombre
        `) as MedicamentoToolRow[];
        const rows = data.map(normalizeRow);
        if (incluir_caducados === false) {
          return rows.filter((row) => !row.caducado);
        }
        return rows;
      },
    }),
    search_medicamento_by_name: tool({
      description:
        "Busca medicamentos del usuario por nombre (parcial). Devuelve nombre, descripcion, fecha_caducidad, stock y si está caducado.",
      parameters: z.object({
        nombre: z
          .string()
          .max(MAX_SEARCH_NOMBRE_CHARS)
          .describe("Nombre o parte del nombre del medicamento"),
      }),
      execute: async ({ nombre }: { nombre: string }) => {
        const pattern = `%${nombre.slice(0, MAX_SEARCH_NOMBRE_CHARS)}%`;
        const data = (await sql`
          select id, nombre, descripcion, fecha_caducidad, stock
          from public.medicamentos
          where user_id = ${userId} and nombre ilike ${pattern}
        `) as MedicamentoToolRow[];
        return data.map(normalizeRow);
      },
    }),
  };
}
