#!/usr/bin/env node
/**
 * Ejecuta la migración 001 (tabla medicamentos) en Neon usando DATABASE_URL.
 * Uso (desde la raíz del repo): cd web && node scripts/migrate-neon.mjs
 * Asegúrate de tener web/.env.local con DATABASE_URL.
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
if (!connectionString) {
  console.error("Falta DATABASE_URL en web/.env.local");
  process.exit(1);
}

const sql = neon(connectionString);

const migration = `
create table if not exists public.medicamentos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  fecha_caducidad date,
  stock int not null default 0,
  created_at timestamptz default now()
);
`.trim();

try {
  await sql(migration, []);
  console.log("Tabla public.medicamentos creada correctamente en Neon.");
} catch (err) {
  console.error("Error ejecutando la migración:", err.message);
  process.exit(1);
}
