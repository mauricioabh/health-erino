-- Tabla para configuración de la app (p. ej. URL del CSV inicial en Vercel Blob)
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);
