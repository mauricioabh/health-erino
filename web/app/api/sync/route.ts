import { auth } from "@clerk/nextjs/server";
import { get } from "@vercel/blob";
import { sql } from "@/lib/db/neon";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import { enrichDescriptions } from "@/lib/gemini-enrich";

const SETTINGS_KEY = "initial_csv_blob_url";

function normalizeRow(row: Record<string, string>) {
  const get = (key: string) => {
    const k = Object.keys(row).find(
      (c) => c?.toLowerCase().trim() === key.toLowerCase()
    );
    return (k && row[k]?.trim()) || "";
  };
  const rawNombre = get("nombre") || get("name");
  const rawDesc = get("descripcion") || get("description");
  const rawFecha =
    get("fecha_caducidad") || get("caducidad") || get("expiration");
  const rawStock = get("stock");
  let fecha: string | null = null;
  if (rawFecha) {
    const d = new Date(rawFecha);
    if (!Number.isNaN(d.getTime())) {
      fecha = d.toISOString().slice(0, 10);
    }
  }
  const stock = rawStock ? parseInt(rawStock, 10) : 1;
  return {
    nombre: rawNombre || "Sin nombre",
    descripcion: rawDesc || null,
    fecha_caducidad: fecha,
    stock: Number.isNaN(stock) || stock < 0 ? 1 : stock,
  };
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth({ acceptsToken: "session_token" });
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    let csvUrl = body?.blobUrl as string | undefined;
    if (!csvUrl) {
      const row = await sql`
        select value from public.app_settings where key = ${SETTINGS_KEY} limit 1
      `;
      csvUrl = (row?.[0] as { value?: string } | undefined)?.value ?? undefined;
    }
    if (!csvUrl) {
      return NextResponse.json(
        { error: "Sube primero un archivo CSV desde el panel (archivo inicial)." },
        { status: 400 }
      );
    }

    let csv: string;
    if (csvUrl.includes("blob.vercel-storage.com")) {
      const blobResult = await get(csvUrl, { access: "private" });
      if (!blobResult || blobResult.statusCode !== 200 || !blobResult.stream) {
        return NextResponse.json(
          { error: "Error al obtener el CSV desde el almacenamiento" },
          { status: 502 }
        );
      }
      csv = await new Response(blobResult.stream).text();
    } else {
      const res = await fetch(csvUrl);
      if (!res.ok) {
        return NextResponse.json(
          { error: "Error al obtener el CSV" },
          { status: 502 }
        );
      }
      csv = await res.text();
    }
    const parsed = Papa.parse<Record<string, string>>(csv, {
      header: true,
      skipEmptyLines: true,
    });
    if (parsed.errors.length) {
      return NextResponse.json(
        { error: "Error parseando CSV", details: parsed.errors },
        { status: 400 }
      );
    }

    let rows = parsed.data
      .map(normalizeRow)
      .filter((r) => r.nombre && r.nombre !== "Sin nombre");

    const needEnrich = rows.filter((r) => r.nombre && !r.descripcion?.trim());
    if (needEnrich.length > 0) {
      try {
        const nombres = [...new Set(needEnrich.map((r) => r.nombre.trim()).filter(Boolean))];
        const descMap = await enrichDescriptions(nombres);
        rows = rows.map((r) => {
          if (r.nombre && !r.descripcion?.trim()) {
            const desc = descMap.get(r.nombre) ?? descMap.get(r.nombre.trim()) ?? descMap.get(r.nombre.toLowerCase());
            if (desc) return { ...r, descripcion: desc };
          }
          return r;
        });
      } catch (err) {
        console.error("Enrich descriptions:", err);
      }
    }

    await sql`delete from public.medicamentos`;

    if (rows.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0 });
    }

    for (const r of rows) {
      await sql`
        insert into public.medicamentos (nombre, descripcion, fecha_caducidad, stock)
        values (${r.nombre}, ${r.descripcion}, ${r.fecha_caducidad}, ${r.stock})
      `;
    }

    return NextResponse.json({ ok: true, inserted: rows.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
