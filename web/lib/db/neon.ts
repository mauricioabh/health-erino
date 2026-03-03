import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing DATABASE_URL (Neon connection string)");
}
if (!connectionString.startsWith("postgresql://") && !connectionString.startsWith("postgres://")) {
  throw new Error(
    `DATABASE_URL debe ser una URL de PostgreSQL (empieza con postgresql://). Valor actual parece incorrecto (¿CLERK_SECRET_KEY?). Revisa las variables de entorno en Vercel.`
  );
}

export const sql = neon(connectionString);

export type MedicamentoRow = {
  id: string;
  nombre: string;
  descripcion: string | null;
  fecha_caducidad: string | null;
  stock: number;
  created_at: string | null;
};
