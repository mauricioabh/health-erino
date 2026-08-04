import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/neon", () => ({
  sql: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/chat/inventory-context", () => ({
  loadUserMedicamentosInventory: vi.fn(),
  buildChatSystemPrompt: vi.fn(
    (rows: Array<{ nombre: string }>) =>
      `NO inventes medicamentos\n${rows.map((r) => r.nombre).join(",")}`,
  ),
  formatInventoryForPrompt: vi.fn(() => ""),
}));

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return {
    ...actual,
    streamText: vi.fn(),
    generateText: vi.fn(),
    generateObject: vi.fn(),
  };
});

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(() => "mock-model"),
}));

vi.mock("@/lib/langfuse", () => ({
  flushLangfuse: vi.fn(),
  getLangfuse: vi.fn(() => null),
  redactForTrace: vi.fn((t: string) => t),
  redactMessages: vi.fn((m: unknown) => m),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import {
  createDataStreamResponse,
  formatDataStreamPart,
  generateObject,
  generateText,
  streamText,
} from "ai";
import { FRIENDLY_CHAT_ERROR } from "@/lib/llm-security/constants";
import {
  buildChatSystemPrompt,
  loadUserMedicamentosInventory,
} from "@/lib/chat/inventory-context";
import { POST } from "@/app/api/chat/route";

function mockAuth(userId: string | null) {
  vi.mocked(auth).mockResolvedValue({ userId } as Awaited<
    ReturnType<typeof auth>
  >);
}

function chatRequest(content: string, stream = true) {
  const url = stream
    ? "http://localhost/api/chat"
    : "http://localhost/api/chat?stream=false";
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content }],
    }),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth("user_123");
    vi.mocked(generateObject).mockResolvedValue({
      object: { category: "IN_SCOPE", message: "ok" },
    } as never);
    vi.mocked(loadUserMedicamentosInventory).mockResolvedValue([
      {
        nombre: "Buscapina",
        descripcion: "Antiespasmódico para dolor abdominal",
        fecha_caducidad: "2027-06-01",
        stock: 3,
        caducado: false,
      },
    ]);
    vi.mocked(buildChatSystemPrompt).mockImplementation(
      (rows) =>
        `NO inventes medicamentos\n${rows.map((r) => r.nombre).join(",")}`,
    );
  });

  it("streams a symptom answer without Gemini tools", async () => {
    const answer = "Para el dolor de panza puedes tomar Buscapina de tu lista.";
    vi.mocked(streamText).mockImplementation(() => {
      return {
        mergeIntoDataStream: (dataStream: {
          write: (chunk: string) => void;
        }) => {
          dataStream.write(formatDataStreamPart("text", answer));
        },
        text: Promise.resolve(answer),
      } as never;
    });

    const response = await POST(
      chatRequest("me duele la panza, que me puedo tomar?"),
    );
    expect(response.status).toBe(200);

    const args = vi.mocked(streamText).mock.calls[0]?.[0] as {
      tools?: unknown;
      maxSteps?: number;
      system?: string;
    };
    expect(args.tools).toBeUndefined();
    expect(args.maxSteps).toBeUndefined();
    expect(args.system).toContain("Buscapina");
    expect(args.system).toContain("NO inventes medicamentos");

    const body = await response.text();
    expect(body).toContain("Buscapina");
  });

  it("never returns thought_signature raw errors to the client", async () => {
    vi.mocked(streamText).mockImplementation(() => {
      throw new Error(
        "Function call is missing a thought_signature in functionCall parts. This is required for tools to work correctly",
      );
    });

    const response = await POST(
      chatRequest("me duele la panza, que me puedo tomar?"),
    );
    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).not.toMatch(/thought_signature/i);
    expect(body).toContain(FRIENDLY_CHAT_ERROR);
  });

  it("returns JSON content without tools when stream=false", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: "Puedes tomar Buscapina.",
      usage: {},
    } as never);

    const response = await POST(chatRequest("me duele la panza?", false));
    expect(response.status).toBe(200);
    const json = (await response.json()) as { content: string };
    expect(json.content).toContain("Buscapina");

    const args = vi.mocked(generateText).mock.calls[0]?.[0] as {
      tools?: unknown;
    };
    expect(args.tools).toBeUndefined();
  });

  it("maps provider failures on non-stream to a friendly data stream", async () => {
    vi.mocked(generateText).mockRejectedValue(
      new Error("Function call is missing a thought_signature"),
    );

    const response = await POST(chatRequest("tengo fiebre", false));
    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).not.toMatch(/thought_signature/i);
    expect(body).toContain(FRIENDLY_CHAT_ERROR);
  });

  it("still answers when inventory load succeeds with empty list", async () => {
    vi.mocked(loadUserMedicamentosInventory).mockResolvedValue([]);
    vi.mocked(buildChatSystemPrompt).mockReturnValue(
      "NO inventes medicamentos\nvacío — no hay medicamentos",
    );
    vi.mocked(streamText).mockImplementation(() => {
      const answer =
        "Aún no tienes medicamentos en tu lista. Añade algunos desde el panel.";
      return {
        mergeIntoDataStream: (dataStream: {
          write: (chunk: string) => void;
        }) => {
          dataStream.write(formatDataStreamPart("text", answer));
        },
        text: Promise.resolve(answer),
      } as never;
    });

    const response = await POST(chatRequest("qué puedo tomar para la panza?"));
    expect(response.status).toBe(200);
    const args = vi.mocked(streamText).mock.calls[0]?.[0] as {
      system?: string;
    };
    expect(args.system).toContain("vacío");
  });
});

describe("chat data stream helpers stay available", () => {
  it("can encode assistant text parts", () => {
    const part = formatDataStreamPart("text", "hola");
    expect(part).toContain("hola");
    const res = createDataStreamResponse({
      execute: (ds) => {
        ds.write(formatDataStreamPart("text", "ok"));
      },
    });
    expect(res.status).toBe(200);
  });
});
