## Why

The admin medications panel on small PWA viewports wastes vertical space with a redundant title, oversized action buttons that wrap to multiple rows, and inline filter/sort controls that push the medication list below the fold. Users need faster access to their data on phones.

## What Changes

- Hide "Panel de medicamentos" heading on viewports below `md` (header already shows app name).
- Compact action row on mobile: icon-only buttons for template download, CSV upload, and new medication in a single row.
- Mobile toolbar: search input + Buscar button + filter/sort icon button on the right.
- Filter and sort options move into a bottom sheet opened from the filter/sort icon on mobile; desktop keeps inline chips.
- Medication count displayed above the list/table on mobile (between toolbar and list card).
- Badge on filter/sort icon when a non-default filter or sort is active.

## Capabilities

### New Capabilities

- `admin-mobile-toolbar`: Compact mobile toolbar layout for search, filter/sort sheet, and count placement on `/admin`.

### Modified Capabilities

- `medicamentos-mobile-list`: Add requirement that mobile admin chrome (actions + toolbar) SHALL be compact and not duplicate the page title.

## Impact

- `web/app/admin/page.tsx` — responsive header and action row; count placement
- `web/app/admin/medicamentos-toolbar.tsx` — mobile vs desktop layouts
- `web/app/admin/medicamentos-filters-sheet.tsx` — new bottom sheet (follows detalle sheet pattern)
- `web/app/admin/download-template-button.tsx`, `sync-button.tsx`, `nuevo-medicamento-modal.tsx` — compact mobile triggers
- No API, database, or auth changes
