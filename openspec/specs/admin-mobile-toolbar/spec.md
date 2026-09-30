# admin-mobile-toolbar Specification

## Purpose
TBD - created by archiving change pwa-mobile-compact-admin. Update Purpose after archive.
## Requirements
### Requirement: Compact mobile action buttons

On viewports below `md`, the admin page action buttons (download template, upload CSV, new medication) SHALL appear in a single horizontal row, each showing its icon plus a short English label: **Template**, **Upload**, and **New** respectively. Accessible names (aria-label / title) SHALL remain descriptive. On viewports at or above `md`, the existing full text labels SHALL remain.

#### Scenario: Mobile shows icon-only action row

- **WHEN** the user views `/admin` on a viewport below `md`
- **THEN** download template, upload CSV, and new medication appear in one row with icons and the short labels Template, Upload, and New (not icon-only)

#### Scenario: Desktop keeps text action buttons

- **WHEN** the user views `/admin` on a viewport at or above `md`
- **THEN** action buttons show their full text labels as today

### Requirement: Mobile search toolbar layout

On viewports below `md`, the medications toolbar SHALL show a search input, a Buscar submit button, and a filter/sort icon button aligned to the right of that row. Inline filter and sort chip rows SHALL NOT be visible on mobile.

#### Scenario: Mobile search row layout

- **WHEN** the user views `/admin` on a viewport below `md`
- **THEN** the toolbar displays search input, Buscar button, and a filter/sort icon on the same row with the icon on the right

#### Scenario: Desktop keeps inline filter and sort

- **WHEN** the user views `/admin` on a viewport at or above `md`
- **THEN** inline filter chips and sort buttons remain visible as today

### Requirement: Filter and sort bottom sheet on mobile

On viewports below `md`, tapping the filter/sort icon MUST open a bottom sheet containing all caducidad filter options and sort options. Selecting an option MUST update URL search params and close or refresh the view consistent with current toolbar behavior.

#### Scenario: Open filter sheet from icon

- **WHEN** the user taps the filter/sort icon on mobile
- **THEN** a bottom sheet opens with caducidad filters and sort options

#### Scenario: Apply filter from sheet

- **WHEN** the user selects a caducidad filter in the bottom sheet
- **THEN** the list updates according to that filter via the same query params as desktop

#### Scenario: Apply sort from sheet

- **WHEN** the user selects a sort option in the bottom sheet
- **THEN** the list updates according to that sort via the same query params as desktop

### Requirement: Active filter indicator on mobile

When caducidad filter is not `all` or sort differs from defaults, the filter/sort icon button SHALL show a visible active indicator (e.g. badge or highlight).

#### Scenario: Badge when filter active

- **WHEN** a non-default caducidad filter is applied on mobile
- **THEN** the filter/sort icon shows an active indicator

### Requirement: Medication count above list on mobile

On viewports below `md`, the total medication count (or "Mostrando X de Y" when filtered) SHALL appear directly above the medications list card, not mixed with filter controls.

#### Scenario: Count above list on mobile

- **WHEN** the user views `/admin` on a viewport below `md`
- **THEN** the count appears between the search toolbar and the medications list

