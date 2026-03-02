import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db/neon";
import { NextResponse } from "next/server";

const SETTINGS_KEY = "initial_csv_blob_url";

export async function POST(request: Request) {
  try {
    const { userId } = await auth({ acceptsToken: "session_token" });
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "Falta el archivo. Sube un CSV." },
        { status: 400 }
      );
    }

    const name = file.name.toLowerCase();
    if (!name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Solo se permiten archivos CSV." },
        { status: 400 }
      );
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN no configurado (Vercel Blob)." },
        { status: 500 }
      );
    }

    const pathname = `initial-csv/medicamentos-${Date.now()}.csv`;
    const blob = await put(pathname, file, {
      access: "private",
      contentType: file.type || "text/csv",
      addRandomSuffix: false,
      token,
    });

    await sql`
      insert into public.app_settings (key, value, updated_at)
      values (${SETTINGS_KEY}, ${blob.url}, now())
      on conflict (key) do update set value = ${blob.url}, updated_at = now()
    `;

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    );
  }
}
