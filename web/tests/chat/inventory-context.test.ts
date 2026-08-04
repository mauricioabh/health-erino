import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/neon", () => ({
  sql: vi.fn(),
}));

import {
  buildChatSystemPrompt,
  formatInventoryForPrompt,
  type MedicamentoInventoryRow,
} from "@/lib/chat/inventory-context";
import { isCaducado, toDateString } from "@/lib/format-date";

const sample: MedicamentoInventoryRow[] = [
  {
    nombre: "Buscapina",
    descripcion: "Para cólicos y dolor abdominal",
    fecha_caducidad: "2027-01-15",
    stock: 2,
    caducado: false,
  },
  {
    nombre: "Espadiva",
    descripcion: "Caducada 2001",
    fecha_caducidad: "2001-08-26",
    stock: 1,
    caducado: true,
  },
];

describe("toDateString / isCaducado", () => {
  it("marks Neon Date objects from 2001 as caducado (not Date < string false)", () => {
    // Neon DATE often arrives as JS Date at UTC midnight.
    const neonDate = new Date(Date.UTC(2001, 7, 26));
    expect(toDateString(neonDate)).toBe("2001-08-26");
    expect(isCaducado(neonDate, "2026-08-03")).toBe(true);
    // The buggy comparison that previously marked everything vigente:
    expect(neonDate < ("2026-08-03" as unknown as Date)).toBe(false);
  });

  it("keeps future dates as not caducado", () => {
    expect(isCaducado("2027-01-15", "2026-08-03")).toBe(false);
  });
});

describe("inventory-context", () => {
  it("formats empty inventory with clear empty guidance", () => {
    const text = formatInventoryForPrompt([]);
    expect(text).toContain("vacío");
    expect(text.toLowerCase()).toContain("panel");
  });

  it("splits vigentes and caducados so Espadiva 2001 is never under VIGENTES", () => {
    const text = formatInventoryForPrompt(sample);
    expect(text).toContain("### VIGENTES");
    expect(text).toContain("### CADUCADOS");
    expect(text).toContain("Buscapina");
    expect(text).toContain("Espadiva");
    expect(text).toContain("CADUCADO_NO_CONSUMIR");
    expect(text).toContain("estado: VIGENTE");

    const vigentesSection = text.split("### CADUCADOS")[0] ?? "";
    const caducadosSection = text.split("### CADUCADOS")[1] ?? "";
    expect(vigentesSection).toContain("Buscapina");
    expect(vigentesSection).not.toContain("Espadiva");
    expect(caducadosSection).toContain("Espadiva");
    expect(caducadosSection).toContain("venció el 26 de agosto de 2001");
  });

  it("builds system prompt that forbids recommending caducados", () => {
    const prompt = buildChatSystemPrompt(sample);
    expect(prompt).toContain("NUNCA pongas un medicamento caducado");
    expect(prompt).toContain("Espadiva");
    expect(prompt).not.toContain("get_medicamentos");
  });
});
