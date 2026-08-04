import { REJECTION_MESSAGES } from "./constants";
import { unwrapUntrustedUserInput } from "./sanitize-input";
import { hasInjectionPattern } from "./untrusted-data-detect";
import type { PreCheckResult } from "./types";

const EMERGENCY_PATTERNS: RegExp[] = [
  /dolor\s+de\s+pecho/i,
  /no\s+puedo\s+respirar/i,
  /suicid/i,
  /infarto/i,
  /emergencia\s+m[eé]dica/i,
  /ataque\s+card[ií]aco/i,
];

const OFF_TOPIC_PATTERNS: RegExp[] = [
  /\bpython\b/i,
  /\breact\b/i,
  /\bbitcoin\b/i,
  /escribe\s+c[oó]digo/i,
  /\bjavascript\b/i,
  /\btypescript\b/i,
];

const DIAGNOSIS_PATTERNS: RegExp[] = [
  /¿tengo\s+(c[aá]ncer|diabetes|hipertensi[oó]n|covid)/i,
  /diagn[oó]stic[aá]me/i,
  /tengo\s+(c[aá]ncer|diabetes)\??/i,
];

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+previous/i,
  /\bsystem\s*:/i,
  /you\s+are\s+now/i,
  /reveal\s+(your\s+)?(prompt|instructions)/i,
];

function matchBucket(text: string, patterns: RegExp[]): RegExp | undefined {
  return patterns.find((p) => p.test(text));
}

export function runPreCheck(userContent: string): PreCheckResult {
  const text = unwrapUntrustedUserInput(userContent).trim();
  if (!text) {
    return { blocked: false };
  }

  if (matchBucket(text, EMERGENCY_PATTERNS)) {
    return {
      blocked: true,
      reason: "EMERGENCY",
      message: REJECTION_MESSAGES.EMERGENCY,
    };
  }

  if (matchBucket(text, INJECTION_PATTERNS) || hasInjectionPattern(text)) {
    return {
      blocked: true,
      reason: "INJECTION_ATTEMPT",
      message: REJECTION_MESSAGES.INJECTION_ATTEMPT,
    };
  }

  if (matchBucket(text, DIAGNOSIS_PATTERNS)) {
    return {
      blocked: true,
      reason: "OUT_OF_SCOPE",
      message: REJECTION_MESSAGES.NO_DIAGNOSIS,
    };
  }

  if (matchBucket(text, OFF_TOPIC_PATTERNS)) {
    return {
      blocked: true,
      reason: "OUT_OF_SCOPE",
      message: REJECTION_MESSAGES.OUT_OF_SCOPE,
    };
  }

  return { blocked: false };
}
