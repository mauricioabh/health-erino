import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { runSheetsToNeonSync } from "@/lib/sync/sheets-to-neon";

export async function POST(request: Request) {
  try {
    const { userId } = await auth({ acceptsToken: "session_token" });
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const blobUrl = body?.blobUrl as string | undefined;
    const result = await runSheetsToNeonSync({ blobUrl });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ ok: true, inserted: result.inserted });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
