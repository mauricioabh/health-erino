# Neon schema

Base de datos PostgreSQL en Neon. La autorización se hace en la app con Clerk (no RLS).

## Tabla `public.app_settings`

- `key` text, PK
- `value` text, NOT NULL
- `updated_at` timestamptz, default now()

Se usa para guardar la URL del CSV inicial en Vercel Blob (key: `initial_csv_blob_url`). Migración: `neon/migrations/002_app_settings.sql`.

## Tabla `public.medicamentos`

- `id` uuid, PK, default `gen_random_uuid()`
- `nombre` text, NOT NULL
- `descripcion` text, nullable
- `fecha_caducidad` date, nullable
- `stock` int, NOT NULL, default 0
- `created_at` timestamptz, default now()

## Aplicar migración

En Neon Console → SQL Editor, ejecutar el contenido de `neon/migrations/001_medicamentos.sql`.

O con Neon CLI (si está enlazado):

```bash
neon migrations run
```
