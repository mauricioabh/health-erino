import { auth } from "@clerk/nextjs/server";
import { google } from "@ai-sdk/google";
import {
  createDataStreamResponse,
  formatDataStreamPart,
  generateObject,
  streamText,
  generateText,
} from "ai";
import { randomUUID } from "node:crypto";
import * as Sentry from "@sentry/nextjs";
import {
  buildChatSystemPrompt,
  loadUserMedicamentosInventory,
} from "@/lib/chat/inventory-context";
import {
  flushLangfuse,
  getLangfuse,
  redactForTrace,
  redactMessages,
} from "@/lib/langfuse";
import {
  EMPTY_ASSISTANT_FALLBACK,
  FRIENDLY_CHAT_ERROR,
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
  unwrapUntrustedUserInput,
} from "@/lib/llm-security/sanitize-input";
import { NextResponse } from "next/server";

export const maxDuration = 30;

function assistantTextResponse(message: string) {
  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.write(formatDataStreamPart("text", message));
    },
  });
}

function rejectionResponse(message: string, reason: string) {
  console.info("[llm-security] pre_check_hit", { reason });
  return assistantTextResponse(message);
}

async function classifyUserMessage(userMessage: string) {
  try {
    const { object } = await generateObject({
      model: google(GEMINI_CHAT_MODEL),
      schema: llmResponseSchema,
      system: CLASSIFIER_SYSTEM_PROMPT,
      prompt: unwrapUntrustedUserInput(userMessage),
      maxTokens: MAX_OUTPUT_TOKENS_CLASSIFIER,
    });
    return object;
  } catch (err) {
    Sentry.captureException(err, {
      tags: { route: "chat", phase: "preflight" },
    });
    // Fail open: symptom recommendations must not die because the classifier failed.
    return null;
  }
}

export async function POST(request: Request) {
  const { userId } = await auth({ acceptsToken: "session_token" });
  if (!userId) {
    return NextResponse.json(
      { error: "No autorizado" },
      {
        status: 401,
        headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
      },
    );
  }

  let body: { messages?: Array<{ role?: string; content?: string }> } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
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

  let systemPrompt: string;
  let inventoryCount = 0;
  try {
    const inventory = await loadUserMedicamentosInventory(userId);
    inventoryCount = inventory.length;
    systemPrompt = buildChatSystemPrompt(inventory);
  } catch (err) {
    Sentry.captureException(err, {
      tags: { route: "chat", phase: "inventory" },
    });
    return assistantTextResponse(FRIENDLY_CHAT_ERROR);
  }

  const langfuse = getLangfuse();
  const trace = langfuse?.trace({
    name: "voice-chat-session",
    sessionId,
    userId,
    metadata: { stream, inventoryCount, tools: false },
  });

  try {
    if (stream) {
      const generation = trace?.generation({
        name: "gemini-stream",
        model: GEMINI_CHAT_MODEL,
        input: redactMessages(mapped),
      });

      return createDataStreamResponse({
        execute: async (dataStream) => {
          try {
            // No Gemini tools: avoids thought_signature multi-step failures.
            const result = streamText({
              model: google(GEMINI_CHAT_MODEL),
              system: systemPrompt,
              messages: mapped,
              maxTokens: MAX_OUTPUT_TOKENS_CHAT,
              onFinish: async ({ text, usage }) => {
                runPostCheckObservability({
                  message: text,
                  stream: true,
                });
                generation?.end({
                  output: redactForTrace(text),
                  metadata: {
                    usage,
                    emptyText: !text?.trim(),
                    inventoryCount,
                  },
                });
                await flushLangfuse();
              },
              onError: ({ error }) => {
                const err =
                  error instanceof Error ? error : new Error(String(error));
                generation?.end({
                  level: "ERROR",
                  statusMessage: err.message,
                });
                Sentry.captureException(err, {
                  tags: { route: "chat", stream: "true" },
                });
              },
            });

            result.mergeIntoDataStream(dataStream);

            const text = await result.text;
            if (!text?.trim()) {
              dataStream.write(
                formatDataStreamPart("text", EMPTY_ASSISTANT_FALLBACK),
              );
            }
          } catch (error) {
            const err =
              error instanceof Error ? error : new Error(String(error));
            generation?.end({ level: "ERROR", statusMessage: err.message });
            Sentry.captureException(err, {
              tags: { route: "chat", stream: "true", phase: "execute" },
            });
            dataStream.write(formatDataStreamPart("text", FRIENDLY_CHAT_ERROR));
            await flushLangfuse();
          }
        },
        onError: (error) => {
          const err = error instanceof Error ? error : new Error(String(error));
          Sentry.captureException(err, {
            tags: { route: "chat", stream: "true", phase: "data_stream" },
          });
          // Never surface raw provider errors (e.g. thought_signature) to the UI.
          return FRIENDLY_CHAT_ERROR;
        },
      });
    }

    const generation = trace?.generation({
      name: "gemini-generate",
      model: GEMINI_CHAT_MODEL,
      input: redactMessages(mapped),
    });

    const result = await generateText({
      model: google(GEMINI_CHAT_MODEL),
      system: systemPrompt,
      messages: mapped,
      maxTokens: MAX_OUTPUT_TOKENS_CHAT,
    });

    const content = result.text?.trim() || EMPTY_ASSISTANT_FALLBACK;

    runPostCheckObservability({
      message: content,
      stream: false,
    });

    generation?.end({
      output: redactForTrace(content),
      metadata: {
        usage: result.usage,
        emptyText: !result.text?.trim(),
        inventoryCount,
      },
    });
    await flushLangfuse();

    return Response.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    trace?.update({ metadata: { error: message } });
    Sentry.captureException(err, { tags: { route: "chat" } });
    await flushLangfuse();
    // Stream-compatible friendly reply so useChat does not show a red raw error.
    return assistantTextResponse(FRIENDLY_CHAT_ERROR);
  }
}
