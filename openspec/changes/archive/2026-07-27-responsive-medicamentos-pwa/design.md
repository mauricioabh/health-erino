## Context

`MedicamentosList` renderiza una tabla con `min-w-[900px]` y scroll horizontal. En PWA/móvil eso es poco usable. Ya existen `EditarMedicamentoModal` y `EliminarMedicamentoDialog` vía portal. Los filtros de caducidad en BD definen: caducado (`fecha < today`), sin fecha (`null`), válido (resto).

## Goals / Non-Goals

**Goals:**

- Vista móvil (`< md`) compacta: nombre + `YY/MM` + indicador de estado.
- Bottom sheet de detalle con datos completos y acciones Editar/Eliminar.
- Desktop (`≥ md`) sin cambios de comportamiento.

**Non-Goals:**

- Cambios de API o schema.
- Indicadores de caducado en la tabla desktop.
- Virtualización de listas largas.

## Decisions

1. **Lista vs tabla recortada** → Lista de filas button/clickable con Tailwind `md:hidden` / `hidden md:block` (o equivalente). Razón: mejor UX táctil y a11y (`button` o `role="button"`).

2. **Formato caducidad fila** → `YY/MM` desde `YYYY-MM-DD` (helper nuevo junto a `format-date.ts`). En sheet: `formatDateWithMonth` existente.

3. **Estado visual** → Helper cliente `getCaducidadStatus(fecha)`: `valido | caducado | sin_fecha`, alineado con SQL de filtros. Estilos: caducado rojo suave + borde/punto; sin fecha ámbar/rojo suave + `—`; válido neutro.

4. **Detalle** → Bottom sheet (portal + slide-up), no modal centrado. Desde el sheet: abrir editar/eliminar existentes; al cerrar editar/eliminar, cerrar o refrescar sheet según resultado.

5. **Breakpoint** → `md` (768px), consistente con toolbar/admin.

## Risks / Trade-offs

- [Doble UI tabla+lista] → Mitigación: un solo componente, mismos datos; CSS/condicional de layout.
- [Fecha “hoy” en cliente vs servidor] → Mitigación: comparar solo fecha local YYYY-MM-DD; aceptable para indicador UI (filtros ya usan `current_date` en servidor).
- [Stack de modales sheet → editar] → Mitigación: z-index sheet < editar/eliminar (z-50); cerrar sheet al iniciar editar o apilar de forma clara.

## Migration Plan

Deploy solo frontend Next.js. Rollback = revert del PR. Sin migraciones BD.

## Open Questions

Ninguna — decisiones cerradas en explore.
