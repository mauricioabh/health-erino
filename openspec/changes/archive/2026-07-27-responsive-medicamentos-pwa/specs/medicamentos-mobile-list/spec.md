## ADDED Requirements

### Requirement: Compact medication list on small viewports

On viewports below the `md` breakpoint, the admin medications list SHALL show a compact list instead of the wide multi-column table. Each row MUST display the medication name and expiry as `YY/MM` (or an em dash when expiry is missing). On viewports at or above `md`, the existing table layout SHALL remain available.

#### Scenario: Mobile shows compact rows

- **WHEN** the user views `/admin` on a viewport below `md`
- **THEN** each medication appears as a compact row with name and `YY/MM` (or `—`) and the wide horizontal-scrolling table is not used

#### Scenario: Desktop keeps the table

- **WHEN** the user views `/admin` on a viewport at or above `md`
- **THEN** the medications table with name, description, full expiry, stock, and inline actions remains available

### Requirement: Expiry status indicators on compact rows

Each compact row MUST visually distinguish expiry status: `caducado` when `fecha_caducidad` is before today, `sin_fecha` when expiry is null, and `valido` otherwise.

#### Scenario: Expired medication indicator

- **WHEN** a medication has `fecha_caducidad` before the current local date
- **THEN** the compact row shows a clear expired visual treatment (e.g. red accent) distinct from valid rows

#### Scenario: Missing expiry indicator

- **WHEN** a medication has no `fecha_caducidad`
- **THEN** the compact row shows `—` for expiry and a clear missing-date visual treatment

### Requirement: Detail bottom sheet with edit and delete

Tapping a compact row MUST open a bottom sheet showing the medication name, description, full formatted expiry, stock, and expiry status label when not valid. The sheet MUST provide actions to edit and delete that reuse the existing edit modal and delete confirmation dialog.

#### Scenario: Open detail from compact row

- **WHEN** the user taps a compact medication row
- **THEN** a bottom sheet opens with full medication details and Edit and Delete actions

#### Scenario: Edit from detail sheet

- **WHEN** the user chooses Edit in the detail sheet
- **THEN** the existing edit medication modal opens for that medication

#### Scenario: Delete from detail sheet

- **WHEN** the user chooses Delete in the detail sheet
- **THEN** the existing delete confirmation dialog opens for that medication
