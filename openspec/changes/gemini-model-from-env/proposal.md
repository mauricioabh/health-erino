## Why

El modelo de Gemini (`GEMINI_CHAT_MODEL`) está hardcodeado en código. Para cambiar de variante (p. ej. flash-lite → flash) hace falta un deploy de código, aunque la clave API ya vive en env. Conviene configurar el id del modelo por variable de entorno, con un default seguro, sin cambiar de proveedor.

## What Changes

- Leer el id del modelo Gemini desde una variable de entorno (p. ej. `GEMINI_CHAT_MODEL`), con fallback al valor actual `gemini-flash-lite-latest`.
- Documentar la variable en `web/.env.example` (y referencias mínimas de ops si aplica).
- Mantener `@ai-sdk/google` y `GOOGLE_GENERATIVE_AI_API_KEY`; no hay cambio de proveedor ni de API pública del chat.

## Capabilities

### New Capabilities

- `gemini-model-config`: configuración del id de modelo Gemini usado por chat, clasificador y enrich, resolvable desde env con default documentado.

### Modified Capabilities

- (ninguna)

## Impact

- `web/lib/llm-security/constants.ts` — origen de `GEMINI_CHAT_MODEL`.
- Consumidores existentes sin cambio de contrato: `web/app/api/chat/route.ts`, `web/lib/gemini-enrich.ts`.
- `web/.env.example`; opcionalmente Vercel env en deploy.
- Sin cambios de schema Neon, Clerk, mobile ni dependencias npm nuevas.
