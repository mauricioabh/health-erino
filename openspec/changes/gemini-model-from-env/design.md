## Context

Health Erino usa Vercel AI SDK con `@ai-sdk/google`. El id del modelo está en `web/lib/llm-security/constants.ts` como `GEMINI_CHAT_MODEL = "gemini-flash-lite-latest"` y lo consumen el chat (`/api/chat`), el clasificador de seguridad y el enrich de descripciones. La API key ya está en `GOOGLE_GENERATIVE_AI_API_KEY`; el id del modelo no.

## Goals / Non-Goals

**Goals:**

- Resolver el id del modelo desde env en un solo lugar (`constants.ts`).
- Default = `gemini-flash-lite-latest` si la env falta o está vacía (comportamiento actual sin config extra).
- Documentar la variable en `.env.example`.

**Non-Goals:**

- Cambiar de proveedor (OpenAI, Anthropic, etc.).
- Validar en runtime que el id exista en Google (fallará en la llamada al API como hoy).
- Modelos distintos por flujo (chat vs enrich vs classifier) en este change.
- UI o admin para elegir modelo.

## Decisions

1. **Nombre de env: `GEMINI_CHAT_MODEL`**
   - Coincide con el export TypeScript y deja claro que es Gemini.
   - Alternativa descartada: `AI_MODEL` / `LLM_MODEL` (más genérico, prematuro sin multi-provider).

2. **Resolución en `constants.ts`**
   - `process.env.GEMINI_CHAT_MODEL?.trim() || "gemini-flash-lite-latest"`.
   - Un solo punto de verdad; no tocar cada call site de `google(...)`.
   - Alternativa descartada: leer env en cada route (duplicación).

3. **Sin validación de allowlist**
   - Cualquier string no vacío se pasa a `google(model)`.
   - Simplicidad; un typo se detecta en logs/errores de API.
   - Si más adelante hace falta, se puede añadir allowlist en otro change.

4. **Server-only**
   - Variable sin prefijo `NEXT_PUBLIC_`; solo código de servidor (API routes / lib server).

## Risks / Trade-offs

- [Modelo inválido en Vercel] → Mitigación: default documentado; documentar valor en `.env.example`; fallos visibles en Sentry/Langfuse.
- [Trim de espacios al pegar en dashboard] → Mitigación: `.trim()` en la resolución.
- [Confusión nombre export vs env] → Mitigación: mismo nombre; comentario breve en constants.

## Migration Plan

1. Merge del change (código + `.env.example`).
2. Opcional en Vercel: añadir `GEMINI_CHAT_MODEL` (production/preview/development). Sin ella, sigue el default.
3. Rollback: quitar o corregir la env, o revertir el commit; default restaura el comportamiento previo.

## Open Questions

- Ninguna bloqueante. Valor inicial recomendado en Vercel: omitir (usar default) o fijar explícitamente `gemini-flash-lite-latest`.
