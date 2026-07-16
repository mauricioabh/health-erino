# pwa-installable Specification

## Purpose
TBD - created by archiving change add-pwa-serwist. Update Purpose after archive.
## Requirements
### Requirement: Web App Manifest for installability
The web app SHALL expose a Web App Manifest that identifies Health Erino as an installable application with `display` set to `standalone` (or equivalent app-like display mode), `start_url` set to `/`, and `scope` covering the site origin path `/`.

#### Scenario: Manifest is reachable
- **WHEN** a client requests the site manifest (e.g. `/manifest.webmanifest` or the URL linked by Next metadata)
- **THEN** the response SHALL include `name` (or `short_name`), `start_url` of `/`, `display` of `standalone`, and icon entries for at least 192×192 and 512×512

#### Scenario: Installed app launches at landing
- **WHEN** the user launches the installed PWA from the OS/home screen icon
- **THEN** the app SHALL open at `/` as the default start URL
- **AND** existing auth middleware behavior SHALL still apply (signed-in users may be redirected to `/admin`)

### Requirement: Install icons
The web app SHALL provide PWA icon assets at 192×192 and 512×512 referenced by the manifest so browsers can satisfy installability icon criteria.

#### Scenario: Manifest references install icons
- **WHEN** a browser evaluates installability using the manifest
- **THEN** it SHALL find valid icon URLs for 192 and 512 pixel sizes of a supported image type (e.g. PNG)

### Requirement: Theme and branding metadata
The manifest SHALL include `theme_color` and `background_color` consistent with Health Erino’s teal branding so the installed chrome matches the product.

#### Scenario: Theme colors present
- **WHEN** the manifest is parsed
- **THEN** `theme_color` and `background_color` SHALL be present and non-empty

