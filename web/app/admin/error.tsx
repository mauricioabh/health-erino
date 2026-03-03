"use client";

import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto p-6 rounded-xl border border-red-500/30 bg-slate-800/90">
      <h2 className="text-lg font-semibold text-red-400 mb-2">Algo salió mal</h2>
      <p className="text-sm text-slate-300 mb-4">
        Hubo un error al cargar el panel. Puede ser un problema temporal o con la conexión a los servicios.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-500"
        >
          Reintentar
        </button>
        <Link
          href="/admin"
          className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5"
        >
          Volver al panel
        </Link>
      </div>
    </div>
  );
}
