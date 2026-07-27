## 1. Helpers

- [x] 1.1 Add `formatDateYYMM` and `getCaducidadStatus` in `web/lib/format-date.ts` (or sibling util)
- [x] 1.2 Cover helpers with a small unit test if the web package already has a pattern for lib tests; otherwise skip

## 2. Detail bottom sheet

- [x] 2.1 Create `medicamento-detalle-sheet.tsx` (portal, slide-up, full fields + status label + Editar/Eliminar)
- [x] 2.2 Wire sheet actions to open existing edit modal / delete dialog

## 3. Responsive list

- [x] 3.1 Update `medicamentos-list.tsx`: compact list `< md` (name, YY/MM, status indicators, tap → sheet)
- [x] 3.2 Keep existing table visible only at `≥ md`
- [x] 3.3 Empty state works in both layouts

## 4. Verify

- [x] 4.1 Run `openspec validate responsive-medicamentos-pwa --strict`
- [x] 4.2 Smoke-check TypeScript/lints on touched files
