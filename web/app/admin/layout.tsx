import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/admin");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <nav className="flex gap-4">
          <Link href="/admin" className="text-slate-700 hover:text-emerald-600">
            Medicamentos
          </Link>
          <Link href="/chat" className="text-slate-700 hover:text-emerald-600">
            Asistente voz
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <SignOutButton>
            <button
              type="button"
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Salir
            </button>
          </SignOutButton>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
