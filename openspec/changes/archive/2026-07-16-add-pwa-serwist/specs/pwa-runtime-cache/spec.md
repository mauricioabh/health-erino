## ADDED Requirements

### Requirement: Service worker via Serwist
The web app SHALL register a Serwist-based service worker in production builds so that eligible assets can be cached and navigations can fall back when offline.

#### Scenario: Service worker registers in production
- **WHEN** a user loads the site from a production (or production-like) build over HTTPS
- **THEN** a service worker SHALL register successfully for the app origin

#### Scenario: Development expectation
- **WHEN** the app runs only under `next dev` without a production SW build path
- **THEN** full service worker behavior is NOT required to match production (verification MUST use build/start or preview)

### Requirement: Static asset caching
The service worker SHALL use a CacheFirst (or equivalent) strategy for versioned static assets under `/_next/static/` so repeat visits load shell resources from cache when available.

#### Scenario: Cached static assets on repeat visit
- **WHEN** a user revisits the app after a successful first load that cached static assets
- **THEN** subsequent requests for those `/_next/static/` assets MAY be satisfied from the service worker cache

### Requirement: Navigation NetworkFirst with offline fallback
Document navigations SHALL prefer the network (NetworkFirst or equivalent). When a navigation fails due to lack of network, the service worker SHALL serve a dedicated offline fallback experience.

#### Scenario: Online navigation
- **WHEN** the user navigates to an app page while online
- **THEN** the response SHALL come from the network when available

#### Scenario: Offline navigation fallback
- **WHEN** the user navigates while offline (or the network request for the document fails)
- **THEN** the service worker SHALL show the offline fallback page instead of a blank/error-only browser page

### Requirement: APIs and auth traffic never cached
The service worker SHALL NOT cache responses for `/api/*` or use a caching strategy other than NetworkOnly (or bypass) for application API and authentication-sensitive same-origin requests that would otherwise risk stale or sensitive data.

#### Scenario: API requests bypass cache
- **WHEN** the client calls a same-origin `/api/*` endpoint
- **THEN** the service worker SHALL not return a cached API response in place of a network fetch (NetworkOnly / bypass)

#### Scenario: Chat and medicamentos remain online-only
- **WHEN** the device is offline
- **THEN** chat and medicamentos API operations SHALL fail as network failures (no offline queue or synthetic success required by this capability)

### Requirement: Offline page sets expectations
The offline fallback experience SHALL communicate that the app requires a network connection and MUST NOT present fabricated medicamentos or chat data.

#### Scenario: Offline messaging
- **WHEN** the offline fallback is shown
- **THEN** the user SHALL see a clear message that there is no connection and that they can retry when online
