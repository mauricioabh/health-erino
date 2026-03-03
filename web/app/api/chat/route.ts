import { google } from "@ai-sdk/google";
import { streamText, generateText } from "ai";
import { SYSTEM_PROMPT, medicamentosTools } from "@/lib/gemini-tools";

export const maxDuration = 30;

export async function POST(request: Request) {
  console.log("[chat] POST recibido");
  let body: { messages?: Array<{ role?: string; content?: string }> } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const messages = body.messages ?? [];
  const mapped = messages
    .filter((m) => m.role && m.content)
    .map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: String(m.content),
    }));

  const url = new URL(request.url);
  const stream = url.searchParams.get("stream") !== "false";

  try {
    if (stream) {
      const result = streamText({
        model: google("gemini-2.5-flash"),
        system: SYSTEM_PROMPT,
        messages: mapped,
        tools: medicamentosTools,
        maxSteps: 5,
        onError: ({ error }) => {
          console.error("[chat] Error en stream:", error);
        },
      });
      return result.toDataStreamResponse();
    }

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      messages: mapped,
      tools: medicamentosTools,
      maxSteps: 5,
    });
    return Response.json({ content: result.text });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[chat] Error:", err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
