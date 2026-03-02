import { google } from "@ai-sdk/google";
import { streamText, generateText } from "ai";
import { SYSTEM_PROMPT, medicamentosTools } from "@/lib/gemini-tools";

export const maxDuration = 30;

export async function POST(request: Request) {
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

  if (stream) {
    const result = streamText({
      model: google("gemini-1.5-flash"),
      system: SYSTEM_PROMPT,
      messages: mapped,
      tools: medicamentosTools,
      maxSteps: 5,
    });
    return result.toDataStreamResponse();
  }

  const result = await generateText({
    model: google("gemini-1.5-flash"),
    system: SYSTEM_PROMPT,
    messages: mapped,
    tools: medicamentosTools,
    maxSteps: 5,
  });
  return Response.json({ content: result.text });
}
