## Why

En la PWA móvil los botones de acción del panel son solo iconos y cuestan de reconocer; el feedback de subir CSV (éxito o error) es un texto pequeño junto al botón, poco claro; y el chat con IA lee en voz alta cada respuesta por defecto, lo que molesta cuando el usuario solo quiere leer.

## What Changes

- En viewports &lt; `md`, los botones Descargar plantilla / Subir CSV / Nuevo muestran label corto en inglés junto al icono: **Template**, **Upload**, **New** (desktop conserva los textos largos actuales).
- El resultado del flujo upload+sync CSV se muestra en un **modal/popup** tanto para éxito como para error (mensaje amigable; en error, detalle técnico expandible). Se elimina el mensaje inline junto al botón.
- El TTS del chat deja de reproducirse automáticamente; el usuario puede activar la lectura con un control explícito (p. ej. botón de altavoz) en la respuesta del asistente.

## Capabilities

### New Capabilities

- `csv-upload-feedback`: Feedback de éxito/error del upload+sync CSV vía modal, con detalle técnico opcional en errores.
- `chat-tts-opt-in`: Lectura por voz (Web Speech Synthesis) solo bajo demanda, no automática.

### Modified Capabilities

- `admin-mobile-toolbar`: Los botones de acción en mobile dejan de ser solo icono; incluyen labels cortos Template / Upload / New.

## Impact

- UI: `web/app/admin/download-template-button.tsx`, `sync-button.tsx`, `nuevo-medicamento-modal.tsx`, `chat-sidebar.tsx`; posible componente modal compartido de feedback.
- Sin cambios de API/contrato de `/api/upload-initial-csv` ni `/api/sync` (salvo, si se desea, enriquecer el payload de error ya existente para el detalle técnico en UI).
- Spec `admin-mobile-toolbar` actualiza el requisito de “icon-only” en mobile.
