# Supabase schema (legacy; el proyecto migró a Neon)

## Tabla `public.medicamentos`

Campos:

- `id` uuid, PK, default `gen_random_uuid()`
- `nombre` text, **NOT NULL**
- `descripcion` text, nullable
- `fecha_caducidad` date, nullable
- `stock` int, **NOT NULL**, default `0`
- `created_at` timestamptz, default `now()`

DDL (migración local):

```sql
create table if not exists public.medicamentos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  fecha_caducidad date,
  stock int not null default 0,
  created_at timestamptz default now()
);
```

## RLS (Row Level Security)

RLS habilitado:

```sql
alter table public.medicamentos enable row level security;
```

Políticas actuales (ver `supabase/migrations/20250227000000_create_medicamentos.sql`):

- **Authenticated read**: `SELECT` permitido a usuarios autenticados.
- **Authenticated insert/update/delete**: escritura permitida a usuarios autenticados (puede endurecerse a “solo admin” si se añade lógica por `app_metadata`).
- **Service role full access**: acceso total cuando el JWT tenga `role = 'service_role'` (usado por `SUPABASE_SERVICE_ROLE_KEY` en servidor).

