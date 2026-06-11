# Health Erino

Solución dual (Web + Mobile) para gestión de medicamentos con carga desde Google Sheets e interfaz de voz con IA.

## Stack

- **Base de datos**: Neon (PostgreSQL serverless)
- **Auth**: Clerk (email/password, Google, etc.)
- **Web**: Next.js (App Router), Tailwind CSS, Vercel AI SDK
- **Mobile**: Expo (React Native), expo-speech, expo-speech-recognition
- **IA**: Google Gemini 1.5 Flash (Google AI Studio)
- **Origen de datos**: Google Sheets publicado como CSV

## Estructura del proyecto

```
health-erino/
├── .cursor/rules/
├── web/               # Next.js (API + panel admin + asistente de voz)
├── mobile/            # Expo (consulta por voz)
├── neon/              # Migraciones SQL para Neon
│   ├── migrations/
│   └── SCHEMA.md
└── README.md
```

## Crear proyecto en Neon

1. [Neon Console](https://console.neon.tech) → New project.
2. Copiar la **connection string** (Connection string → URI) y usarla como `DATABASE_URL`.
3. En SQL Editor, ejecutar el contenido de `neon/migrations/001_medicamentos.sql`.

### Neon preview branches (GitHub)

Para aislar datos por PR o preview en Vercel:

1. En [Neon Console](https://console.neon.tech) → tu proyecto → **Integrations** → conectar el repo de GitHub (`health-erino`).
2. Activa **Create branch for every pull request** (o el equivalente en la integración). Neon crea una rama Postgres por PR y expone una `DATABASE_URL` distinta.
3. En Vercel, enlaza la integración Neon o copia la connection string de la rama de preview a las variables de **Preview** (`DATABASE_URL`). Producción sigue usando la rama `main` de Neon.
4. Tras merge del PR, Neon puede eliminar la rama automáticamente; las migraciones en `neon/migrations/` deben aplicarse en cada rama nueva (Vercel build hook o `npm run db:migrate` en el pipeline de preview).

Cada preview usa su propia base: no comparte medicamentos ni datos de prueba con producción.

## Configurar Clerk

1. [Clerk Dashboard](https://dashboard.clerk.com) → Create application.
2. Habilitar Email y Google (u otros) en User & Authentication → Email, Social connections.
3. Copiar **Publishable key** y **Secret key** a `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY`.
4. En Paths: Sign-in URL `/sign-in`, Sign-up URL `/sign-up`; después de login redirigir a `/admin`.

## Deploy en Vercel

1. Conectar el repo de GitHub; **Root Directory** = `web`.
2. Variables de entorno:
   - `DATABASE_URL` (Neon)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - `GOOGLE_SHEET_CSV_URL` (opcional)

La URL de Vercel se usa como `EXPO_PUBLIC_APP_URL` en la app móvil.

## Desarrollo local

### Web

```bash
cd web
cp .env.example .env.local
# Rellenar DATABASE_URL (Neon), Clerk keys, GOOGLE_GENERATIVE_AI_API_KEY
npm install
npm run dev
```

### Mobile

```bash
cd mobile
echo EXPO_PUBLIC_APP_URL=http://<TU_IP>:3000 >> .env
npm install
npx expo start
```

## Funcionalidades

- **Panel admin** (`/admin`): protegido con Clerk; sincronización desde Google Sheets, CRUD de medicamentos.
- **Asistente de voz** (`/chat`): SpeechRecognition + speechSynthesis, API `/api/chat` con Gemini y tools sobre Neon.
- **App móvil**: micrófono (expo-speech-recognition), misma `/api/chat`, TTS con expo-speech.

## Cursor rules

En `.cursor/rules/` hay reglas para GitHub, Vercel, Neon/Clerk y Filesystem MCP cuando aplique.

## Production practices

- **Pre-commit:** Husky at monorepo root runs lint-staged (`eslint --fix`, `prettier --write`) on staged `*.ts` / `*.tsx` in `web/` and `mobile/`.
- **Observability:** `@sentry/nextjs` on the web app; Langfuse cloud traces per voice chat session (`/api/chat` → Gemini → tools) with medication names redacted. Set `SENTRY_DSN` and `LANGFUSE_*` in `web/.env.local`. Dev probe: `GET /api/debug/sentry` (non-production only).
- **Async jobs:** Inngest cron (`sync-sheets-cron`, every 6h UTC) and optional `health/sync.sheets` event run shared `runSheetsToNeonSync()` (Google Sheets CSV or Blob URL → Neon). Without `INNGEST_*` or when `GOOGLE_SHEET_CSV_URL` is unset, cron logs a skip — manual sync still works via `POST /api/sync`. Pattern: [portfolio `docs/inngest-pattern.md`](https://github.com/mauricioabh/portfolio/blob/master/docs/inngest-pattern.md).
- **API authorization tests:** Vitest in `web/tests/auth/` (`cd web && npm run test:auth`) — medicamentos, sync, and upload routes return **401** without a Clerk session. CI: `.github/workflows/ci.yml`.
- **Neon preview branches:** GitHub integration creates an isolated Postgres branch per PR; wire `DATABASE_URL` to Vercel Preview (see [Neon preview branches](#neon-preview-branches-github) above).
- **Security scanning:** CodeQL (`.github/workflows/codeql.yml`); Dependabot for npm and Actions (`.github/dependabot.yml`).
