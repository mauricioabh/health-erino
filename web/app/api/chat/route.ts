import { auth } from "@clerk/nextjs/server";
import { google } from "@ai-sdk/google";
import { generateObject, streamText, generateText } from "ai";
import { randomUUID } from "node:crypto";
import * as Sentry from "@sentry/nextjs";
import {
  createMedicamentosTools,
  MAX_TOOL_STEPS,
  SYSTEM_PROMPT,
} from "@/lib/gemini-tools";
import {
  flushLangfuse,
  getLangfuse,
  redactForTrace,
  redactMessages,
} from "@/lib/langfuse";
import {
  GEMINI_CHAT_MODEL,
  MAX_OUTPUT_TOKENS_CHAT,
  MAX_OUTPUT_TOKENS_CLASSIFIER,
  REJECTION_MESSAGES,
} from "@/lib/llm-security/constants";
import {
  llmResponseSchema,
  runPostCheckObservability,
} from "@/lib/llm-security/post-check";
import { runPreCheck } from "@/lib/llm-security/pre-check";
import { CLASSIFIER_SYSTEM_PROMPT } from "@/lib/llm-security/prompts";
import {
  getLastUserMessage,
  sanitizeChatMessages,
} from "@/lib/llm-security/sanitize-input";
import { NextResponse } from "next/server";

export const maxDuration = 30;

function rejectionResponse(message: string, reason: string) {
  console.info("[llm-security] pre_check_hit", { reason });
  return Response.json({
    category: reason,
    content: message,
    pre_check_hit: true,
  });
}

async function classifyUserMessage(userMessage: string) {
  try {
    const { object } = await generateObject({
      model: google(GEMINI_CHAT_MODEL),
      schema: llmResponseSchema,
      system: CLASSIFIER_SYSTEM_PROMPT,
      prompt: userMessage,
      maxTokens: MAX_OUTPUT_TOKENS_CLASSIFIER,
    });
    return object;
  } catch (err) {
    Sentry.captureException(err, {
      tags: { route: "chat", phase: "preflight" },
    });
    return null;
  }
}

export async function POST(request: Request) {
  const { userId } = await auth({ acceptsToken: "session_token" });
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { messages?: Array<{ role?: string; content?: string }> } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const mapped = sanitizeChatMessages(body.messages ?? []);
  if (mapped.length === 0) {
    return NextResponse.json(
      { error: "Se requiere al menos un mensaje de usuario" },
      { status: 400 },
    );
  }

  const lastUser = getLastUserMessage(mapped);
  if (lastUser) {
    const preCheck = runPreCheck(lastUser);
    if (preCheck.blocked) {
      return rejectionResponse(preCheck.message, preCheck.reason);
    }

    const classification = await classifyUserMessage(lastUser);
    if (classification && classification.category !== "IN_SCOPE") {
      const message =
        classification.message ||
        REJECTION_MESSAGES[
          classification.category as keyof typeof REJECTION_MESSAGES
        ] ||
        REJECTION_MESSAGES.OUT_OF_SCOPE;
      return rejectionResponse(message, classification.category);
    }
  }

  const url = new URL(request.url);
  const stream = url.searchParams.get("stream") !== "false";
  const sessionId = request.headers.get("x-session-id")?.trim() || randomUUID();
  const tools = createMedicamentosTools(userId);

  const langfuse = getLangfuse();
  const trace = langfuse?.trace({
    name: "voice-chat-session",
    sessionId,
    userId,
    metadata: { stream },
  });

  try {
    if (stream) {
      const generation = trace?.generation({
        name: "gemini-stream",
        model: GEMINI_CHAT_MODEL,
        input: redactMessages(mapped),
      });

      const result = streamText({
        model: google(GEMINI_CHAT_MODEL),
        system: SYSTEM_PROMPT,
        messages: mapped,
        tools,
        maxSteps: MAX_TOOL_STEPS,
        maxTokens: MAX_OUTPUT_TOKENS_CHAT,
        onFinish: async ({ text, toolCalls, usage }) => {
          runPostCheckObservability({
            message: text,
            stream: true,
          });
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
      model: GEMINI_CHAT_MODEL,
      input: redactMessages(mapped),
    });

    const result = await generateText({
      model: google(GEMINI_CHAT_MODEL),
      system: SYSTEM_PROMPT,
      messages: mapped,
      tools,
      maxSteps: MAX_TOOL_STEPS,
      maxTokens: MAX_OUTPUT_TOKENS_CHAT,
    });

    runPostCheckObservability({
      message: result.text,
      stream: false,
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
