-- Tabla medicamentos
create table if not exists public.medicamentos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  fecha_caducidad date,
  stock int not null default 0,
  created_at timestamptz default now()
);

alter table public.medicamentos enable row level security;

-- Lectura para usuarios autenticados
create policy "Authenticated read"
  on public.medicamentos
  for select
  using (auth.role() = 'authenticated');

-- Inserción/actualización/borrado para autenticados (admin puede restringirse por app_metadata si se desea)
create policy "Authenticated insert"
  on public.medicamentos
  for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated update"
  on public.medicamentos
  for update
  using (auth.role() = 'authenticated');

create policy "Authenticated delete"
  on public.medicamentos
  for delete
  using (auth.role() = 'authenticated');

-- Service role tiene acceso total (usado por API con service_role key)
create policy "Service role full access"
  on public.medicamentos
  for all
  using (auth.jwt() ->> 'role' = 'service_role');
