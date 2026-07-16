#!/usr/bin/env node
/**
 * Ejecuta migración 003 (user_id en medicamentos) en Neon.
 * Uso: cd web && node scripts/migrate-user-id.mjs
 * Requiere web/.env.local con DATABASE_URL y LEGACY_ADMIN_CLERK_USER_ID.
 */
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptRoot = join(__dirname, "..");
const cwdRoot = process.cwd();
const candidates = [
  join(scriptRoot, ".env.local"),
  join(cwdRoot, ".env.local"),
  join(cwdRoot, "web", ".env.local"),
];

let envPath = null;
for (const p of candidates) {
  if (existsSync(p)) {
    envPath = p;
    break;
  }
}

if (envPath) {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const connectionString = process.env.DATABASE_URL;
const legacyUserId = process.env.LEGACY_ADMIN_CLERK_USER_ID?.trim();

if (!connectionString) {
  console.error("Falta DATABASE_URL en web/.env.local");
  process.exit(1);
}
if (!legacyUserId) {
  console.error(
    "Falta LEGACY_ADMIN_CLERK_USER_ID en web/.env.local (tu Clerk userId para backfill).",
  );
  process.exit(1);
}

const sql = neon(connectionString);

const steps = [
  `alter table public.medicamentos add column if not exists user_id text`,
  `update public.medicamentos set user_id = '${legacyUserId.replace(/'/g, "''")}' where user_id is null`,
  `alter table public.medicamentos alter column user_id set not null`,
  `create index if not exists medicamentos_user_id_idx on public.medicamentos (user_id)`,
  `insert into public.app_settings (key, value, updated_at)
   values ('sync_user_id', '${legacyUserId.replace(/'/g, "''")}', now())
   on conflict (key) do update set value = excluded.value, updated_at = now()`,
];

try {
  for (const statement of steps) {
    await sql(statement, []);
  }
  console.log("Migración 003 aplicada: user_id en medicamentos + sync_user_id.");
} catch (err) {
  console.error("Error ejecutando migración 003:", err.message);
  process.exit(1);
}
