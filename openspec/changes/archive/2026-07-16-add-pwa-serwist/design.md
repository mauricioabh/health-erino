## Context

Health Erino web (`web/`) is Next.js App Router on Vercel with Clerk auth, Neon-backed APIs, and Gemini chat. There is no Web App Manifest, no service worker, and no PWA dependency today. Favicon/`apple-icon` exist via `app/icon.tsx` and `app/apple-icon.tsx` but are insufficient for Chromium installability (needs 192 and 512 icons + manifest).

Middleware already maps `/` → landing (redirect to `/admin` if signed in) and protects `/admin` and `/chat`. Expo covers native mobile; this design adds a complementary **online installable PWA** with a cached shell.

Constraints:
- Production HTTPS (Vercel) is already available.
- SW behavior must be validated with `next build` + `next start` (or preview), not only `next dev --turbo`.
- Must not break Clerk session cookies or cache authenticated API responses.

## Goals / Non-Goals

**Goals:**
- Installable PWA from Chromium/Edge (and Safari “Add to Home Screen” where supported).
- `start_url: "/"` so launch matches the public landing; Clerk/middleware still route logged-in users to `/admin`.
- Serwist-powered runtime caching: fast repeat loads of static assets; navigations prefer network with offline fallback.
- Clear exclusion of `/api/*` and auth-sensitive traffic from caches.

**Non-Goals:**
- Offline chat, medicamentos CRUD, or Clerk login without network.
- Background Sync / Outbox patterns.
- Replacing or changing Expo mobile.
- Web Push notifications.

## Decisions

### 1. Serwist over `@ducanh2912/next-pwa`

- **Choice**: `@serwist/next` + `serwist` (current Workbox-aligned stack for Next App Router).
- **Why**: Actively maintained successor path; explicit route rules; fits Next 15.
- **Alternatives**: next-pwa (simpler, less maintained); hand-rolled Workbox (more glue).

### 2. `start_url: "/"`

- **Choice**: Manifest `start_url` and typical `scope: "/"` point at the landing.
- **Why**: Matches product model — `/` is entry/login; `/admin` only after auth (middleware redirect when session exists).
- **Alternatives**: `/admin` as start (more “open the work app”; worse for signed-out first open).

### 3. Caching strategy matrix

| Route / asset | Strategy | Notes |
|---|---|---|
| `/_next/static/*`, static icons | CacheFirst | Hashed / versioned |
| Document navigations (HTML) | NetworkFirst | Fresh UI when online; fallback offline page |
| `/api/*`, Clerk domains, third-party | NetworkOnly | No stale health/auth data |
| Precache | App shell + offline page | Generated at build via Serwist |

### 4. Icons

- Add static PNG (or generated) **192** and **512** referenced from the manifest.
- Keep existing dynamic `icon.tsx` / `apple-icon.tsx` for browser tab / Apple touch unless we later consolidate.

### 5. Offline UX

- Dedicated offline fallback page (e.g. `/offline`) shown when a navigation fails while offline.
- Message: no connection; retry when online — no fake data.

### 6. Registration scope

- Register SW from a client entry Serwist provides for Next (typically only when `NODE_ENV === "production"` or config equivalent).
- Exclude Sentry ingest / Inngest endpoints from caching via runtime rules if they appear as same-origin requests.

## Risks / Trade-offs

- **[Risk] SW not exercised in Turbopack dev** → Mitigation: document verify steps with production build / Vercel preview; optional smoke checklist in tasks.
- **[Risk] Caching HTML of authenticated pages shows stale chrome** → Mitigation: NetworkFirst with short/network preference; APIs remain NetworkOnly so data stays fresh when online.
- **[Risk] SW intercepts Clerk or API accidentally** → Mitigation: explicit NetworkOnly denylist for `/api/` and known auth paths; review Serwist default config.
- **[Risk] Install criteria fail (missing icons / HTTPS / SW)** → Mitigation: ship 192/512 + manifest + SW together; test on HTTPS preview.
- **[Trade-off] Medium PWA ≠ offline product** → Users may expect offline; offline page must set expectations clearly.

## Migration Plan

1. Land deps + manifest + icons + offline page + Serwist config on `web/`.
2. Deploy to Vercel preview; verify Install prompt, standalone window, SW in Application tab, airplane-mode fallback.
3. Promote to production.
4. Rollback: revert deploy / remove SW registration + manifest; users may need to unregister SW once (rare).

## Open Questions

- Exact Serwist package versions compatible with current Next 15 in `web/package.json` (resolve at implement time via docs).
- Whether offline page lives at `/offline` as a dedicated route or as Serwist `fallback` only (prefer a real route for simplicity).
