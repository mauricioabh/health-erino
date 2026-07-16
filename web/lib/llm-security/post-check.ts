import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import type { LlmCategory } from "./types";

export const llmResponseSchema = z.object({
  category: z.enum([
    "IN_SCOPE",
    "OUT_OF_SCOPE",
    "EMERGENCY",
    "INJECTION_ATTEMPT",
  ]),
  message: z.string().min(1).max(4000),
});

export type LlmResponse = z.infer<typeof llmResponseSchema>;

const PROHIBITED_CLINICAL_PATTERNS: RegExp[] = [
  /tienes\s+(c[aá]ncer|diabetes|hipertensi[oó]n)/i,
  /te\s+diagnostico/i,
  /debes\s+tomar\s+\d+/i,
];

export function parseLlmResponse(raw: unknown): LlmResponse | null {
  const parsed = llmResponseSchema.safeParse(raw);
  if (!parsed.success) {
    Sentry.captureMessage("post_check_parse_failed", {
      level: "warning",
      extra: { issues: parsed.error.issues },
    });
    return null;
  }
  return parsed.data;
}

export function runPostCheckObservability(params: {
  category?: LlmCategory;
  message: string;
  stream: boolean;
}): void {
  const { category, message, stream } = params;

  if (category && category !== "IN_SCOPE") {
    console.info("[llm-security] post_check_category", {
      category,
      stream,
    });
  }

  for (const pattern of PROHIBITED_CLINICAL_PATTERNS) {
    if (pattern.test(message)) {
      Sentry.captureMessage("post_check_clinical_pattern", {
        level: "warning",
        tags: { stream: String(stream) },
      });
      break;
    }
  }
}
