export const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?previous/i,
  /\bsystem\s*:/i,
  /you\s+are\s+now/i,
  /reveal\s+(your\s+)?(prompt|instructions)/i,
  /disregard\s+(the\s+)?(above|prior)/i,
  /forget\s+(all\s+)?(your\s+)?(instructions|rules)/i,
  /act\s+as\s+(a\s+)?(?:new\s+)?(?:system|assistant)/i,
];

export function hasInjectionPattern(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

export function detectUntrustedInjection(fields: {
  nombre?: string | null;
  descripcion?: string | null;
}): { suspected: boolean; field?: "nombre" | "descripcion"; pattern?: string } {
  for (const field of ["nombre", "descripcion"] as const) {
    const value = fields[field];
    if (!value?.trim()) continue;
    const match = INJECTION_PATTERNS.find((p) => p.test(value));
    if (match) {
      return { suspected: true, field, pattern: match.source };
    }
  }
  return { suspected: false };
}
