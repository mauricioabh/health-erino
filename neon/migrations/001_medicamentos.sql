-- Tabla medicamentos (Neon / PostgreSQL, sin RLS; la autorización se hace en la app con Clerk)
create table if not exists public.medicamentos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  fecha_caducidad date,
  stock int not null default 0,
  created_at timestamptz default now()
);
