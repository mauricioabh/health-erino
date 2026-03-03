"use client";

import { useState, useRef, useEffect } from "react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { LogOut, ChevronDown } from "lucide-react";

export function UserMenu() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const initial = user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || "?";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-white/10 bg-slate-800/80 px-2 py-1.5 text-slate-200 hover:bg-slate-700/80 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600/80 text-white text-xs font-medium">
          {initial.toUpperCase()}
        </span>
        <span className="hidden sm:inline text-xs font-medium max-w-[100px] truncate">
          {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Usuario"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-white/10 bg-slate-800 shadow-xl py-1 z-50">
          <div className="px-2 py-1.5 border-b border-white/5">
            <p className="text-xs text-slate-400 truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <SignOutButton>
            <button
              type="button"
              className="flex w-full items-center gap-1.5 px-2 py-1.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              onClick={() => setOpen(false)}
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
              Cerrar sesión
            </button>
          </SignOutButton>
        </div>
      )}
    </div>
  );
}
