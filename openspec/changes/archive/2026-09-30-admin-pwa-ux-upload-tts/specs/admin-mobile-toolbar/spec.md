## MODIFIED Requirements

### Requirement: Compact mobile action buttons

On viewports below `md`, the admin page action buttons (download template, upload CSV, new medication) SHALL appear in a single horizontal row, each showing its icon plus a short English label: **Template**, **Upload**, and **New** respectively. Accessible names (aria-label / title) SHALL remain descriptive. On viewports at or above `md`, the existing full text labels SHALL remain.

#### Scenario: Mobile shows icon-only action row

- **WHEN** the user views `/admin` on a viewport below `md`
- **THEN** download template, upload CSV, and new medication appear in one row with icons and the short labels Template, Upload, and New (not icon-only)

#### Scenario: Desktop keeps text action buttons

- **WHEN** the user views `/admin` on a viewport at or above `md`
- **THEN** action buttons show their full text labels as today
