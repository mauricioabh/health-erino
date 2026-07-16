## 1. Dependencies and Serwist wiring

- [x] 1.1 Add Serwist packages to `web/` (`@serwist/next`, `serwist`, and any peer deps required by current Next 15)
- [x] 1.2 Configure Serwist in `web/next.config.ts` (preserve existing Sentry + bundle-analyzer wrappers)
- [x] 1.3 Add Serwist service worker source (e.g. `app/sw.ts` or project-conventional path) with runtime caching rules
- [x] 1.4 Register the service worker for production builds only via Serwist’s Next integration

## 2. Installability (manifest + icons)

- [x] 2.1 Add `web/app/manifest.ts` (or equivalent) with `name`/`short_name`, `start_url: "/"`, `scope: "/"`, `display: "standalone"`, teal `theme_color` / `background_color`
- [x] 2.2 Add 192×192 and 512×512 icon assets and reference them from the manifest
- [x] 2.3 Confirm existing `icon.tsx` / `apple-icon.tsx` still work alongside PWA icons

## 3. Offline fallback and cache policy

- [x] 3.1 Add offline fallback route/page (e.g. `/offline`) with clear “sin conexión / reintenta” messaging (no fake data)
- [x] 3.2 Configure CacheFirst (or equivalent) for `/_next/static/` and static icons
- [x] 3.3 Configure NetworkFirst for document navigations with fallback to the offline page
- [x] 3.4 Ensure `/api/*` (and auth-sensitive same-origin traffic as needed) use NetworkOnly / bypass — never cached API responses

## 4. Verification

- [x] 4.1 Production-like run: `next build` + `next start` (or Vercel preview) and confirm SW registers in DevTools Application
- [x] 4.2 Confirm Install / “Añadir a pantalla de inicio” criteria (manifest + icons + HTTPS)
- [x] 4.3 Confirm installed launch opens `/` and signed-in users still reach `/admin` via middleware
- [x] 4.4 Airplane mode: navigation shows offline fallback; online: chat/admin/APIs behave as before
- [x] 4.5 Note in PR or `docs/` briefly that SW is verified via production build, not only `next dev --turbo`
