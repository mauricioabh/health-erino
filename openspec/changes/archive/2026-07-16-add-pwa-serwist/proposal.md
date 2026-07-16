## Why

Health Erino web is a standard Next.js app: usable in the browser but not installable and without a cached app shell. Users on desktop (and mobile without Expo) would benefit from an installable PWA that feels like an app while staying online. Expo already covers native mobile; this change adds a browser-based install path without claiming full offline of chat, auth, or APIs.

## What Changes

- Add a Web App Manifest (`start_url: "/"`, `display: standalone`, theme aligned with brand) so browsers can offer “Install app”.
- Add PWA icons at install sizes (192×192 and 512×512); keep existing `icon.tsx` / `apple-icon.tsx` for favicon/Apple touch.
- Integrate **Serwist** service worker with caching for static assets and NetworkFirst for navigations, plus a simple offline fallback page.
- Explicitly **not** cache `/api/*`, Clerk auth flows, or Gemini/chat responses (NetworkOnly).
- Document how to verify install + SW in production build (`next build` / `next start` or Vercel preview).

Non-goals: offline-usable chat/CRUD, background sync queues, replacing Expo, push notifications.

## Capabilities

### New Capabilities

- `pwa-installable`: Manifest, icons, and standalone install experience with `start_url` at `/`.
- `pwa-runtime-cache`: Serwist service worker strategies (static CacheFirst, navigations NetworkFirst + offline fallback, APIs NetworkOnly).

### Modified Capabilities

- (none — no existing specs under `openspec/specs/`)

## Impact

- **Code**: `web/app/manifest.ts` (or equivalent), icon assets, offline page, Serwist SW registration, `web/next.config.ts`.
- **Dependencies**: Serwist packages for Next.js (e.g. `@serwist/next` / `serwist`).
- **Runtime**: Service worker only meaningful in production builds; dev (`next dev --turbo`) may not exercise SW the same way.
- **Auth**: Unchanged behavior — `/` landing/login; logged-in users still redirect to `/admin` via existing middleware.
- **Mobile Expo**: Unaffected; PWA is complementary for web install.
- **APIs / Neon / Gemini**: No API contract changes; responses must not be cached by the SW.
