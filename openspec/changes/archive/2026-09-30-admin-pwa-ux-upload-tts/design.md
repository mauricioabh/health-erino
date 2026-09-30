## Context

See proposal.md for motivation. Admin toolbar already uses responsive icon/text via `hidden md:inline` in three button components. CSV upload feedback lives as inline state in `AdminSyncButton` (`sync-button.tsx`) after `POST /api/upload-initial-csv` then `POST /api/sync`. Chat TTS auto-speaks in `chat-sidebar.tsx` via `speechSynthesis` when a new assistant message finishes.

## Goals / Non-Goals

**Goals:**

- Short English labels on mobile action buttons without breaking the compact row.
- Unified modal for upload/sync success and error; error includes expandable technical detail.
- TTS only when the user requests it.

**Non-Goals:**

- Accepting Excel/xlsx uploads or changing CSV parse logic.
- Investigating or fixing intermittent mobile 401/"No autorizado" (auth/session) in this change.
- Changing chat mic (STT), API contracts, or adding i18n framework.
- Redesigning the full admin toolbar / filter sheet.

## Decisions

1. **Mobile labels via dual spans**  
   Keep icon + `md:hidden` short label (`Template` / `Upload` / `New`) and existing `hidden md:inline` long Spanish labels. Prefer this over swapping all copy to English.  
   *Alternative:* English everywhere — rejected; desktop copy stays as today.

2. **Feedback modal owned by sync-button (or thin shared dialog)**  
   Reuse the same centered dialog pattern as `NuevoMedicamentoModal` (overlay + panel). State: `null | { type: 'ok' | 'error'; title; message; technical? }`. On success, show count from sync response; reload list after the user dismisses the modal (or on primary action) so the message is readable.  
   *Alternative:* toast library — rejected to avoid new dependency and match existing modal style.

3. **Friendly vs technical error**  
   Map known API strings (`No autorizado`, `Error parseando CSV`, network, etc.) to short Spanish copy. Always store raw `error` (and optional status) for a disclosure (“Ver detalle técnico”).  
   *Alternative:* only show technical text — rejected; user asked for friendly + optional detail.

4. **TTS opt-in per assistant message**  
   Remove auto-`useEffect` speak. Add a speak/stop control on assistant bubbles (at least the latest). Keep `speak()` helper and cancel previous utterance on new speak/stop.  
   *Alternative:* global “auto-read” toggle — deferred; default off is enough for this change.

## Risks / Trade-offs

- [Short labels + three buttons] → Possible wrap on very narrow widths → Mitigation: keep `gap-1`, compact padding, `text-xs` / `shrink-0` if needed; verify ~320px.
- [Reload after success] → If reload is immediate, modal never shows → Mitigation: reload only after dismiss (or delay until close).
- [TTS browser support] → Some browsers lack `speechSynthesis` → Mitigation: hide speak control when unavailable.
- [401 on mobile still opaque] → Friendly modal helps but does not fix session → Out of scope; message can say “sesión no válida / vuelve a iniciar sesión” when error is `No autorizado`.

## Migration Plan

Ship as pure frontend UX in `web/`; no DB/migration. Rollback = revert UI commits. No feature flag required.

## Open Questions

None blocking; mobile 401 diagnosis can be a follow-up change if it recurs with valid CSV + signed-in PWA.
