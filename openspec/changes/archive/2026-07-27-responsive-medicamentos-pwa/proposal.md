---
linear_story_id: WAY-85
linear_story_identifier: WAY-85
linear_story_title: "[HLT] Lista de medicamentos responsiva en PWA móvil"
linear_story_url: https://linear.app/wayool/issue/WAY-85/hlt-lista-de-medicamentos-responsiva-en-pwa-movil
linear_story_state: Todo
linear_team: Wayool
linear_project: health-erino
---

## Why

En móvil/PWA la tabla de medicamentos fuerza `min-w-[900px]` y scroll horizontal, lo que dificulta revisar el inventario. Hace falta una vista compacta con detalle al tocar, sin cambiar el flujo de escritorio.

Business brief: [WAY-85](https://linear.app/wayool/issue/WAY-85/hlt-lista-de-medicamentos-responsiva-en-pwa-movil).

## What Changes

- En viewports `< md`: reemplazar la tabla por una lista compacta (nombre + caducidad `YY/MM`).
- Indicadores visuales de estado: caducado, sin fecha, válido.
- Al tocar una fila: bottom sheet con info completa + Editar / Eliminar (reutilizando modales existentes).
- En `≥ md`: mantener la tabla actual.

## Capabilities

### New Capabilities

- `medicamentos-mobile-list`: lista responsiva de medicamentos en admin/PWA (vista compacta, indicadores de caducidad, detalle en bottom sheet).

### Modified Capabilities

- (ninguno)

## Impact

- UI: `web/app/admin/medicamentos-list.tsx` y posible componente de detalle/bottom sheet.
- Reutiliza `EditarMedicamentoModal` y `EliminarMedicamentoDialog`.
- Sin cambios de API, schema Neon ni dependencias nuevas.
