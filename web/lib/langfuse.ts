import { Langfuse } from "langfuse";

const publicKey = process.env.LANGFUSE_PUBLIC_KEY?.trim();
const secretKey = process.env.LANGFUSE_SECRET_KEY?.trim();

let client: Langfuse | null = null;

export function getLangfuse(): Langfuse | null {
  if (!publicKey || !secretKey) return null;
  if (!client) {
    client = new Langfuse({
      publicKey,
      secretKey,
      baseUrl:
        process.env.LANGFUSE_BASE_URL?.trim() || "https://cloud.langfuse.com",
    });
  }
  return client;
}

/** Redact medication names and other PHI from trace payloads. */
export function redactForTrace(text: string): string {
  return text
    .replace(
      /\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ0-9]+){0,5}\b/g,
      "[medication]",
    )
    .replace(/\b\d{1,4}\s?(mg|ml|mcg|g|ui)\b/gi, "[dose]");
}

export function redactMessages(
  messages: Array<{ role?: string; content?: string }>,
): Array<{ role: string; content: string }> {
  return messages
    .filter((m) => m.role && m.content)
    .map((m) => ({
      role: String(m.role),
      content: redactForTrace(String(m.content)),
    }));
}

export async function flushLangfuse(): Promise<void> {
  await client?.flushAsync();
}
