import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserMenu } from "./user-menu";
import { ChatSidebarTrigger } from "./chat-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/admin");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800/95 to-slate-900">
      <header className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <Link href="/" className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
          <span className="text-lg" aria-hidden>💊</span>
          <span className="text-base font-semibold text-white">Health-erino</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <ChatSidebarTrigger />
          <UserMenu />
        </nav>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}
