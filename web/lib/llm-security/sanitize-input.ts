import { MAX_MESSAGE_CHARS, MAX_MESSAGES } from "./constants";
import type { ChatMessageInput, SanitizedMessage } from "./types";

function stripControlChars(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function wrapUntrusted(content: string): string {
  return `<untrusted_user_input>${content}</untrusted_user_input>`;
}

export function sanitizeChatMessages(
  messages: ChatMessageInput[],
): SanitizedMessage[] {
  const sanitized: SanitizedMessage[] = [];

  for (const message of messages) {
    if (!message.content?.trim()) continue;

    if (message.role === "system") continue;

    if (message.role === "assistant") {
      sanitized.push({
        role: "assistant",
        content: stripControlChars(message.content).slice(0, MAX_MESSAGE_CHARS),
      });
      continue;
    }

    if (message.role === "user") {
      const content = stripControlChars(message.content).slice(
        0,
        MAX_MESSAGE_CHARS,
      );
      sanitized.push({
        role: "user",
        content: wrapUntrusted(content),
      });
    }
  }

  return sanitized.slice(-MAX_MESSAGES);
}

export function getLastUserMessage(
  messages: SanitizedMessage[],
): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === "user") {
      return messages[i].content;
    }
  }
  return null;
}
