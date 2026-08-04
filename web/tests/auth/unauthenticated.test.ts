import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@clerk/nextjs/server";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/medicamentos", () => ({
  getMedicamentosFiltered: vi.fn(),
  getMedicamentosCount: vi.fn(),
}));

vi.mock("@/lib/db/neon", () => ({
  sql: vi.fn(),
}));

vi.mock("ai", () => ({
  streamText: vi.fn(),
  generateText: vi.fn(),
  generateObject: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(() => "mock-model"),
}));

vi.mock("@/lib/gemini-tools", () => ({
  createMedicamentosTools: vi.fn(() => ({})),
  MAX_TOOL_STEPS: 5,
  SYSTEM_PROMPT: "test",
}));

vi.mock("@/lib/chat/inventory-context", () => ({
  loadUserMedicamentosInventory: vi.fn(async () => []),
  buildChatSystemPrompt: vi.fn(() => "test system"),
  formatInventoryForPrompt: vi.fn(() => ""),
}));

vi.mock("@/lib/langfuse", () => ({
  flushLangfuse: vi.fn(),
  getLangfuse: vi.fn(() => null),
  redactForTrace: vi.fn((t: string) => t),
  redactMessages: vi.fn((m: unknown) => m),
}));

import { GET, POST } from "@/app/api/medicamentos/route";
import { GET as GET_COUNT } from "@/app/api/medicamentos/count/route";
import { DELETE, PATCH } from "@/app/api/medicamentos/[id]/route";
import { POST as POST_SYNC } from "@/app/api/sync/route";
import { POST as POST_UPLOAD } from "@/app/api/upload-initial-csv/route";
import { POST as POST_CHAT } from "@/app/api/chat/route";

describe("API routes return 401 without Clerk session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ userId: null } as Awaited<
      ReturnType<typeof auth>
    >);
  });

  it("GET /api/medicamentos", async () => {
    const response = await GET(
      new Request("http://localhost/api/medicamentos"),
    );
    expect(response.status).toBe(401);
  });

  it("POST /api/medicamentos", async () => {
    const response = await POST(
      new Request("http://localhost/api/medicamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: "Test" }),
      }),
    );
    expect(response.status).toBe(401);
  });

  it("GET /api/medicamentos/count", async () => {
    const response = await GET_COUNT(
      new Request("http://localhost/api/medicamentos/count"),
    );
    expect(response.status).toBe(401);
  });

  it("DELETE /api/medicamentos/[id]", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/medicamentos/1"),
      {
        params: Promise.resolve({ id: "1" }),
      },
    );
    expect(response.status).toBe(401);
  });

  it("PATCH /api/medicamentos/[id]", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/medicamentos/1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: "Updated" }),
      }),
      { params: Promise.resolve({ id: "1" }) },
    );
    expect(response.status).toBe(401);
  });

  it("POST /api/sync", async () => {
    const response = await POST_SYNC(
      new Request("http://localhost/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );
    expect(response.status).toBe(401);
  });

  it("POST /api/upload-initial-csv", async () => {
    const response = await POST_UPLOAD(
      new Request("http://localhost/api/upload-initial-csv", {
        method: "POST",
      }),
    );
    expect(response.status).toBe(401);
  });

  it("POST /api/chat", async () => {
    const response = await POST_CHAT(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "hola" }],
        }),
      }),
    );
    expect(response.status).toBe(401);
  });
});
