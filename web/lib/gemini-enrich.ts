import { google } from "@ai-sdk/google";
import { generateText } from "ai";

/** Dado una lista de nombres de medicamentos, pide a Gemini que devuelva descripciones (principios activos/sustancias). */
export async function enrichDescriptions(
  nombres: string[]
): Promise<Map<string, string>> {
  if (nombres.length === 0) return new Map();
  const list = nombres.slice(0, 50).join("\n"); // límite para no exceder contexto
  const prompt = `Eres un experto en medicamentos. Te doy una lista de nombres de medicamentos.

Tabla de medicamentos (solo nombres):
${list}

Para cada medicamento, busca los principios activos, sustancias o composición y escribe una descripción breve. Responde ÚNICAMENTE un JSON válido sin markdown, con este formato exacto:
{"items":[{"nombre":"Paracetamol","descripcion":"Paracetamol 500mg, analgésico y antipirético"},{"nombre":"Ibuprofeno","descripcion":"Ibuprofeno 400mg, antiinflamatorio no esteroideo"}]}

Reglas:
- Usa exactamente el mismo nombre que en la lista (respetando mayúsculas).
- descripcion debe incluir el principio activo, dosis si la conoces, y para qué sirve.
- Si no conoces un medicamento, pon "descripcion": "Medicamento de uso común".
- Responde solo el JSON, sin \`\`\` ni texto adicional.`;

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt,
  });
  const map = new Map<string, string>();
  try {
    // Extraer JSON si viene envuelto en markdown ```json ... ```
    let jsonStr = text.trim();
    const codeBlock = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) jsonStr = codeBlock[1].trim();

    const parsed = JSON.parse(jsonStr) as { items?: Array<{ nombre?: string; descripcion?: string }> };
    const items = parsed?.items ?? [];
    const nombresLower = new Map(nombres.map((n) => [n.toLowerCase().trim(), n]));

    for (const item of items) {
      const nom = item.nombre?.trim();
      const desc = (item.descripcion ?? "").trim();
      if (!nom) continue;
      // Asociar al nombre original del CSV (búsqueda case-insensitive)
      const key = nombresLower.get(nom.toLowerCase()) ?? nom;
      if (desc) map.set(key, desc);
    }
  } catch {
    // si falla el parse, devolvemos mapa vacío
  }
  return map;
}
