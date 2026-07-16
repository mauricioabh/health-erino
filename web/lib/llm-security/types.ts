export type AllowedTopic =
  | "medicamentos_list"
  | "symptom_recommendation"
  | "app_help"
  | "expiration_check";

export type RejectionReason =
  | "EMERGENCY"
  | "OUT_OF_SCOPE"
  | "INJECTION_ATTEMPT"
  | "PRE_CHECK_HIT";

export type LlmCategory =
  | "IN_SCOPE"
  | "OUT_OF_SCOPE"
  | "EMERGENCY"
  | "INJECTION_ATTEMPT";

export type PreCheckResult =
  | { blocked: false }
  | { blocked: true; reason: RejectionReason; message: string };

export type ChatMessageInput = {
  role?: string;
  content?: string;
};

export type SanitizedMessage = {
  role: "user" | "assistant";
  content: string;
};
