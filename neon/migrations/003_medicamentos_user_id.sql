-- Add user_id to medicamentos for per-user data isolation (Clerk userId)
alter table public.medicamentos add column if not exists user_id text;

-- Backfill: set LEGACY_ADMIN_CLERK_USER_ID env when running migration script,
-- or replace the placeholder below with your Clerk user id before applying in SQL Editor.
update public.medicamentos
set user_id = coalesce(user_id, 'REPLACE_WITH_CLERK_USER_ID')
where user_id is null;

alter table public.medicamentos alter column user_id set not null;

create index if not exists medicamentos_user_id_idx on public.medicamentos (user_id);

-- Per-user sync owner for Inngest cron (set on CSV upload / manual sync)
insert into public.app_settings (key, value, updated_at)
values ('sync_user_id', 'REPLACE_WITH_CLERK_USER_ID', now())
on conflict (key) do nothing;
