import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getMedicamentosCount } from "@/lib/db/medicamentos";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const count = await getMedicamentosCount({ q: q || undefined });
  return NextResponse.json({ count });
}
