import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/neon", () => ({
  sql: vi.fn(),
}));

import {
  buildChatSystemPrompt,
  formatInventoryForPrompt,
  type MedicamentoInventoryRow,
} from "@/lib/chat/inventory-context";

const sample: MedicamentoInventoryRow[] = [
  {
    nombre: "Buscapina",
    descripcion: "Para cólicos y dolor abdominal",
    fecha_caducidad: "2027-01-15",
    stock: 2,
    caducado: false,
  },
  {
    nombre: "Aspirina vieja",
    descripcion: "Caducada",
    fecha_caducidad: "2020-01-01",
    stock: 1,
    caducado: true,
  },
];

describe("inventory-context", () => {
  it("formats empty inventory with clear empty guidance", () => {
    const text = formatInventoryForPrompt([]);
    expect(text).toContain("vacío");
    expect(text.toLowerCase()).toContain("panel");
  });

  it("includes wrapped medicamento blocks for each row", () => {
    const text = formatInventoryForPrompt(sample);
    expect(text).toContain("Buscapina");
    expect(text).toContain("<untrusted_medicamento_data>");
    expect(text).toContain("caducado: true");
    expect(text).toContain("caducado: false");
  });

  it("builds system prompt that forbids inventing meds and embeds inventory", () => {
    const prompt = buildChatSystemPrompt(sample);
    expect(prompt).toContain("NO inventes medicamentos");
    expect(prompt).toContain("Buscapina");
    expect(prompt).not.toContain("get_medicamentos");
  });
});
