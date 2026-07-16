import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 px-6 text-center">
      <span className="text-5xl mb-6" aria-hidden>
        📡
      </span>
      <h1 className="text-2xl font-bold text-white mb-3">Sin conexión</h1>
      <p className="text-slate-400 max-w-md mb-8">
        Health-erino necesita internet para iniciar sesión, consultar
        medicamentos y usar el asistente. Comprueba tu conexión e inténtalo de
        nuevo.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-medium text-white hover:bg-teal-500 transition-colors"
      >
        Reintentar
      </Link>
    </div>
  );
}
