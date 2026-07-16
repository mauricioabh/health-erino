import { describe, expect, it } from "vitest";
import { runPreCheck } from "@/lib/llm-security/pre-check";

describe("pre-check allow", () => {
  it("allows medicamento inventory questions", () => {
    const result = runPreCheck("¿qué medicamentos tengo en mi botiquín?");
    expect(result.blocked).toBe(false);
  });

  it("allows common symptom questions", () => {
    const result = runPreCheck("tengo dolor de cabeza, ¿qué puedo tomar?");
    expect(result.blocked).toBe(false);
  });
});
