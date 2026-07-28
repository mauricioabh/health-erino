## ADDED Requirements

### Requirement: No duplicate page title on mobile

On viewports below `md`, the admin medications page SHALL NOT display the "Panel de medicamentos" heading because the app header already identifies the context.

#### Scenario: Title hidden on mobile

- **WHEN** the user views `/admin` on a viewport below `md`
- **THEN** the "Panel de medicamentos" heading is not visible

#### Scenario: Title visible on desktop

- **WHEN** the user views `/admin` on a viewport at or above `md`
- **THEN** the "Panel de medicamentos" heading remains visible
