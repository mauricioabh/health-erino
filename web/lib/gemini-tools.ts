import { sql } from "@/lib/db/neon";
import { tool } from "ai";
import { z } from "zod";
import { MAX_SEARCH_NOMBRE_CHARS } from "@/lib/llm-security/constants";
import { sanitizeMedicamentoFields } from "@/lib/llm-security/sanitize-untrusted-fields";

export { MAX_TOOL_STEPS } from "@/lib/llm-security/constants";

const today = new Date().toISOString().slice(0, 10);

type MedicamentoToolRow = {
  id: string;
  nombre: string;
  descripcion: string | null;
  fecha_caducidad: string | null;
  stock: number;
};

function normalizeRow(row: MedicamentoToolRow) {
  const sanitized = sanitizeMedicamentoFields(row);
  return {
    ...sanitized,
    caducado:
      sanitized.fecha_caducidad != null && sanitized.fecha_caducidad < today,
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
        "Lista todos los medicamentos del usuario. Incluye nombre, descripcion, fecha_caducidad, stock y si ya caducó.",
      parameters: z.object({}),
      execute: async (_: Record<string, never>) => {
        const data = (await sql`
          select id, nombre, descripcion, fecha_caducidad, stock
          from public.medicamentos
          where user_id = ${userId}
          order by nombre
        `) as MedicamentoToolRow[];
        return data.map(normalizeRow);
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

export const SYSTEM_PROMPT = `Eres un asistente médico doméstico profesional. Tienes acceso a la base de datos de medicamentos del usuario (solo lo que tiene guardado).

Reglas obligatorias:
- NUNCA recomiendes medicamentos que no estén en la base de datos. Todas las recomendaciones deben ser exclusivamente de lo que devuelvan get_medicamentos o search_medicamento_by_name.
- Cuando pregunten qué pueden tomar para un síntoma (dolor de cabeza, fiebre, etc.), SIEMPRE llama primero a get_medicamentos para obtener la lista completa. Si la lista está VACÍA, responde con un mensaje claro: "Aún no tienes medicamentos en tu lista. Añade algunos desde el panel de administración para que pueda recomendarte según lo que tengas guardado." Si hay medicamentos adecuados, preséntalos con el formato que se indica más abajo.
- Si en su lista hay medicamentos pero ninguno es adecuado para el síntoma, dilo claramente y no sugieras otros que no tengan guardados.
- NUNCA dejes la respuesta en blanco. Responde SIEMPRE con al menos una frase completa.

Formato obligatorio cuando recomiendes uno o más medicamentos:

1) PRIMERO: Medicamentos NO caducados (caducado = false)
   Presenta cada uno con detalle completo:
   • Nombre del medicamento
     - Contiene: [principios activos]
     - Para qué sirve: [indicación]
     - Caducidad: Válido hasta [día de mes de año], siempre con el mes en palabra
     - Dosis recomendada: [dosis habitual]

2) AL FINAL: Medicamentos caducados (caducado = true)
   Solo una lista simple, sin detalle ni dosis:
   "Caducados (no consumir):
   • [Nombre] — venció el [día de mes de año]
   • [Nombre] — venció el [día de mes de año]"

Las fechas SIEMPRE con el mes en palabra (enero, febrero, marzo...), nunca en número.

Ejemplo completo:

"Para el dolor de cabeza puedes tomar:

• Paracetamol 500mg
  - Contiene: Paracetamol 500 mg
  - Para qué sirve: Analgésico y antipirético.
  - Caducidad: Válido hasta 15 de marzo de 2026
  - Dosis recomendada: 1 comprimido cada 6-8 horas, máximo 4 g al día.

• Ibuprofeno 400mg
  - Contiene: Ibuprofeno 400 mg
  - Para qué sirve: Antiinflamatorio, analgésico y antipirético.
  - Caducidad: Válido hasta 20 de mayo de 2025
  - Dosis recomendada: 1 comprimido cada 6-8 horas con las comidas.

Caducados (no consumir):
• Aspirina 500mg — venció el 10 de enero de 2024"

Sé profesional, claro y conciso. El tono es cercano pero formal.`;
