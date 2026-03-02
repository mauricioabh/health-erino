import { sql } from "@/lib/db/neon";
import { tool } from "ai";
import { z } from "zod";

const today = new Date().toISOString().slice(0, 10);

function addCaducado<T extends { fecha_caducidad: string | null }>(row: T) {
  return {
    ...row,
    caducado:
      row.fecha_caducidad != null && row.fecha_caducidad < today,
  };
}

export const medicamentosTools = {
  get_medicamentos: tool({
    description:
      "Lista todos los medicamentos en la base de datos. Incluye nombre, descripcion, fecha_caducidad, stock y si ya caducó.",
    inputSchema: z.object({}),
    execute: async (_: Record<string, never>) => {
      const data = await sql`
        select id, nombre, descripcion, fecha_caducidad, stock
        from public.medicamentos
        order by nombre
      `;
      return (data as Array<{ id: string; nombre: string; descripcion: string | null; fecha_caducidad: string | null; stock: number }>).map(addCaducado);
    },
  }),
  search_medicamento_by_name: tool({
    description:
      "Busca medicamentos por nombre (parcial). Devuelve nombre, descripcion, fecha_caducidad, stock y si está caducado.",
    inputSchema: z.object({
      nombre: z.string().describe("Nombre o parte del nombre del medicamento"),
    }),
    execute: async ({ nombre }: { nombre: string }) => {
      const pattern = `%${nombre}%`;
      const data = await sql`
        select id, nombre, descripcion, fecha_caducidad, stock
        from public.medicamentos
        where nombre ilike ${pattern}
      `;
      return (data as Array<{ id: string; nombre: string; descripcion: string | null; fecha_caducidad: string | null; stock: number }>).map(addCaducado);
    },
  }),
};

export const SYSTEM_PROMPT = `Eres un asistente médico doméstico. Tienes acceso a la base de datos de medicamentos. Tu prioridad es: 1. Confirmar existencia, 2. Explicar para qué sirve, 3. Alertar si el medicamento ya caducó (compara fecha_caducidad con la fecha actual). Responde de forma concisa y natural para ser leída por voz.`;
