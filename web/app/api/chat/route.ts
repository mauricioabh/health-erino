import { google } from "@ai-sdk/google";
import { streamText, generateText } from "ai";
import { randomUUID } from "node:crypto";
import * as Sentry from "@sentry/nextjs";
import { SYSTEM_PROMPT, medicamentosTools } from "@/lib/gemini-tools";
import {
  flushLangfuse,
  getLangfuse,
  redactForTrace,
  redactMessages,
} from "@/lib/langfuse";

export const maxDuration = 30;

export async function POST(request: Request) {
  let body: { messages?: Array<{ role?: string; content?: string }> } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
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
  const sessionId = request.headers.get("x-session-id")?.trim() || randomUUID();

  const langfuse = getLangfuse();
  const trace = langfuse?.trace({
    name: "voice-chat-session",
    sessionId,
    metadata: { stream },
  });

  try {
    if (stream) {
      const generation = trace?.generation({
        name: "gemini-stream",
        model: "gemini-2.5-flash",
        input: redactMessages(messages),
      });

      const result = streamText({
        model: google("gemini-2.5-flash"),
        system: SYSTEM_PROMPT,
        messages: mapped,
        tools: medicamentosTools,
        maxSteps: 5,
        onFinish: async ({ text, toolCalls, usage }) => {
          generation?.end({
            output: redactForTrace(text),
            metadata: {
              toolCallCount: toolCalls?.length ?? 0,
              usage,
            },
          });
          await flushLangfuse();
        },
        onError: ({ error }) => {
          const err = error instanceof Error ? error : new Error(String(error));
          generation?.end({ level: "ERROR", statusMessage: err.message });
          Sentry.captureException(err, {
            tags: { route: "chat", stream: "true" },
          });
        },
      });
      return result.toDataStreamResponse();
    }

    const generation = trace?.generation({
      name: "gemini-generate",
      model: "gemini-2.5-flash",
      input: redactMessages(messages),
    });

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      messages: mapped,
      tools: medicamentosTools,
      maxSteps: 5,
    });

    generation?.end({
      output: redactForTrace(result.text),
      metadata: {
        toolCallCount: result.toolCalls?.length ?? 0,
        usage: result.usage,
      },
    });
    await flushLangfuse();

    return Response.json({ content: result.text });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    trace?.update({ metadata: { error: message } });
    Sentry.captureException(err, { tags: { route: "chat" } });
    await flushLangfuse();
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
