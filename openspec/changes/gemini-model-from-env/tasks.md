## 1. Resolve model from env

- [x] 1.1 Update `web/lib/llm-security/constants.ts` so `GEMINI_CHAT_MODEL` reads `process.env.GEMINI_CHAT_MODEL` (trim) with fallback `gemini-flash-lite-latest`
- [x] 1.2 Confirm chat route and `gemini-enrich.ts` still import the same export (no call-site changes required)

## 2. Document env

- [x] 2.1 Add `GEMINI_CHAT_MODEL=gemini-flash-lite-latest` under Google AI in `web/.env.example`

## 3. Verify

- [x] 3.1 Smoke-check that without the env var the default model string is used; with a custom value it resolves correctly
