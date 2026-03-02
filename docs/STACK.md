# Stack y plan (Health Erino)

Documentación del stack y estructura acordada para Health Erino (Web + Mobile).

## Stack

- **BD**: Neon (PostgreSQL serverless). Cliente `@neondatabase/serverless` en `web/lib/db/neon.ts`.
- **Auth**: Clerk (web y mobile). Middleware protege `/admin`; rutas API protegidas usan `auth({ acceptsToken: "session_token" })` (cookie en web, Bearer en mobile). Mobile: `@clerk/clerk-expo`, ver `docs/CLERK_EXPO.md`.
- **Web**: Next.js App Router, Tailwind, Vercel AI SDK, Gemini (tools: get_medicamentos, search_medicamento_by_name). Dev con Turbopack (`next dev --turbo`).
- **Mobile**: Expo, Clerk Expo, expo-document-picker, expo-speech-recognition, expo-speech; consume `/api/chat`, `/api/upload-initial-csv` y `/api/sync` del backend Next.js.

## Estructura relevante

- `web/lib/db/neon.ts`: cliente SQL (Neon).
- `web/app/page.tsx`: landing con login/signup, header, footer y secciones.
- `web/app/sign-in/[[...sign-in]]/page.tsx`, `web/app/sign-up/[[...sign-up]]/page.tsx`: Clerk SignIn/SignUp.
- `web/app/admin/*`: panel CRUD + sync; requiere sesión Clerk.
- `web/app/api/sync`, `web/app/api/medicamentos/*`: requieren `auth()`; usan `sql` de Neon.
- `web/app/api/chat`: público; usa Gemini + tools que leen Neon.
- `neon/migrations/001_medicamentos.sql`: tabla `public.medicamentos` (sin RLS).

## Variables de entorno (web)

- `DATABASE_URL`: connection string de Neon.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
- `GOOGLE_GENERATIVE_AI_API_KEY`.
- `BLOB_READ_WRITE_TOKEN` (Vercel Blob; para almacenar el CSV inicial subido por el usuario desde web o mobile). Ver `docs/VERCEL_BLOB.md` para configuración local y en Vercel.

## Seguridad

- APIs de medicamentos y sync exigen `auth()`; devuelven 401 si no hay sesión.
- Si el usuario pierde la sesión y accede a `/admin`, Clerk redirige al login.
- Usuario ya logueado que visita `/` es redirigido a `/admin` por middleware.

## Deploy

- Deploy web en Vercel con root `web/`. Usar GitHub, Vercel MCP y Cursor rules según corresponda.
