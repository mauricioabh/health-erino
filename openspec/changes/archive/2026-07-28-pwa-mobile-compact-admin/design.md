## Context

The `/admin` page already has a responsive compact list (`md:hidden`) and detail bottom sheet from a prior change. The page header, action buttons, and toolbar still use a desktop-first layout that wraps on narrow PWA viewports (~320–390px).

Breakpoint convention: `md` (768px), consistent with `medicamentos-list.tsx`.

## Goals / Non-Goals

**Goals:**
- Maximize vertical space for the medication list on mobile
- Single-row action buttons (icon-only) and search toolbar: `[input][Buscar][filter icon]`
- Filter/sort in bottom sheet reusing `medicamento-detalle-sheet` portal pattern
- Count above list on mobile only

**Non-Goals:**
- Changing desktop toolbar layout
- New API routes or data fetching
- shadcn/Radix dependencies (keep custom Tailwind + Lucide)

## Decisions

1. **Icon-only actions on mobile** — Use `md:` responsive classes on existing button components with `aria-label` and `title`. Rationale: fits one row; icons already used (Download, Upload, Plus).

2. **Filter/sort sheet component** — New `medicamentos-filters-sheet.tsx` with `createPortal`, same structure as `medicamento-detalle-sheet.tsx`. Rationale: consistent UX; avoids new UI library.

3. **Toolbar split** — `medicamentos-toolbar.tsx` renders mobile layout (`md:hidden`) and desktop layout (`hidden md:flex`). Rationale: clearer than many conditional classes in one tree.

4. **Count placement** — Extract count into a small `MedicamentosCount` sub-component or block in `page.tsx` between toolbar and list, visible `md:hidden` on mobile and `hidden md:block` inline on desktop toolbar. Rationale: satisfies "above table" without duplicating count logic.

5. **Filter icon** — `SlidersHorizontal` from Lucide; badge dot when `caducidad !== 'all'`.

## Risks / Trade-offs

- [Icon-only actions less discoverable] → `title` + `aria-label` on each button
- [Sheet adds tap to change filter] → acceptable on mobile; desktop unchanged
- [Two toolbar layouts to maintain] → shared `updateParams` callback keeps logic DRY

## Migration Plan

Deploy with next web release. No migration or feature flags. Rollback: revert UI files only.
