"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SignIn } from "@clerk/nextjs";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};
const stagger = { animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };

const steps = [
  {
    step: "01",
    icon: "🔐",
    title: "Regístrate o inicia sesión",
    text: "Crea una cuenta o usa Google. Solo usuarios autenticados acceden al panel.",
    accent: "cyan",
  },
  {
    step: "02",
    icon: "📋",
    title: "Administra medicamentos",
    text: "Añade, edita y revisa stock y fechas de caducidad desde el panel de admin.",
    accent: "rose",
  },
  {
    step: "03",
    icon: "🎤",
    title: "Consulta por voz o chat",
    text: "Pregunta por un medicamento con el asistente de voz o desde la web.",
    accent: "violet",
  },
];

const accentStyles: Record<
  string,
  {
    border: string;
    hover: string;
    glow: string;
    icon: string;
    num: string;
  }
> = {
  cyan: {
    border: "border-l-cyan-500",
    hover: "hover:border-l-cyan-400",
    glow: "0 0 32px rgba(6,182,212,0.35)",
    icon: "bg-cyan-500/20 text-cyan-300",
    num: "text-cyan-500/20",
  },
  rose: {
    border: "border-l-rose-500",
    hover: "hover:border-l-rose-400",
    glow: "0 0 32px rgba(244,63,94,0.35)",
    icon: "bg-rose-500/20 text-rose-300",
    num: "text-rose-500/20",
  },
  violet: {
    border: "border-l-violet-500",
    hover: "hover:border-l-violet-400",
    glow: "0 0 32px rgba(139,92,246,0.35)",
    icon: "bg-violet-500/20 text-violet-300",
    num: "text-violet-500/20",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-slate-800/95 to-slate-900">
      {/* Header: sin asistente de voz — para no logueados el CTA es login */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between px-6 py-4 border-b border-white/10"
      >
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="text-2xl" aria-hidden>💊</span>
          <span className="text-xl font-semibold text-white">Health-erino</span>
        </Link>
        <span className="text-slate-400 text-sm">Gestión de medicamentos</span>
      </motion.header>

      {/* Hero */}
      <main className="flex-1 flex flex-col lg:flex-row items-stretch max-w-6xl mx-auto w-full px-6 py-12 lg:py-16 gap-12">
        <motion.section
          initial="initial"
          animate="animate"
          variants={stagger}
          className="flex-1 flex flex-col justify-center"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-4xl lg:text-5xl font-bold text-white leading-tight"
          >
            Gestiona tus medicamentos con asistente de voz
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-6 text-lg text-slate-300 max-w-xl"
          >
            Inicia sesión y lleva el control de stock, caducidades y consultas por voz con IA.
            Resultados ajustados a tu inventario.
          </motion.p>
          <motion.ul variants={fadeInUp} className="mt-8 space-y-3 text-slate-300">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Panel de administración
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Asistente por voz (Gemini)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Sincronización desde hoja de cálculo
            </li>
          </motion.ul>
          <motion.p variants={fadeInUp} className="mt-6">
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              ¿Quieres probar antes? Prueba el asistente de voz →
            </Link>
          </motion.p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="flex-shrink-0 w-full lg:w-[400px]"
        >
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 px-8 py-8 shadow-xl hover:border-white/20 transition-colors overflow-hidden">
            <SignIn
              routing="hash"
              signUpUrl="/sign-up"
              forceRedirectUrl="/admin"
              fallbackRedirectUrl="/admin"
              localization={{
                signIn: {
                  forgotPassword: "¿Olvidaste tu contraseña?",
                  alternativeMethods: {
                    actionText: "O con email",
                    blockButton__socialLink: "Continuar con {{provider|titleize}}",
                  },
                  submitButton: "Entrar",
                },
                footerAction: {
                  text: "¿No tienes cuenta?",
                  actionText: "Registrarse",
                },
              }}
              appearance={{
                baseTheme: undefined,
                variables: {
                  colorBackground: "rgb(30 41 59 / 0.9)",
                  colorInputBackground: "rgb(30 41 59)",
                  colorInputText: "#f8fafc",
                  colorText: "#94a3b8",
                  colorTextSecondary: "#64748b",
                  colorPrimary: "#4f46e5",
                  colorDanger: "#ef4444",
                  borderRadius: "0.75rem",
                },
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none bg-transparent p-0",
                  cardBox: "shadow-none max-w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-slate-700 hover:bg-slate-600 border border-white/10 text-white py-3",
                  socialButtonsBlockButtonText: "font-medium",
                  dividerLine: "bg-white/10",
                  dividerText: "text-slate-500 text-sm",
                  formFieldLabel: "text-slate-300",
                  formFieldInput: "bg-slate-700/80 border-white/10 text-white py-3 px-4",
                  formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 py-3 mt-2",
                  formActions: "gap-3",
                  footerAction: "pt-4 mt-4 border-t border-white/10",
                  footerActionLink: "text-indigo-400 hover:text-indigo-300",
                  identityPreviewEditButton: "text-indigo-400",
                  formFieldAction: "text-indigo-400 hover:text-indigo-300",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                },
              }}
            />
          </div>
        </motion.section>
      </main>

      {/* Cómo funciona: diseño renovado */}
      <section className="max-w-6xl mx-auto w-full px-6 py-20 border-t border-white/10">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.35 }}
          className="text-2xl font-bold text-white mb-14 text-center"
        >
          Cómo funciona
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((item, i) => {
            const style = accentStyles[item.accent as keyof typeof accentStyles];
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{
                  y: -6,
                  boxShadow: style.glow,
                  transition: { duration: 0.2 },
                }}
                className={`group relative overflow-hidden rounded-xl border border-white/10 bg-slate-800/70 ${style.border} ${style.hover} pl-6 pr-6 pt-7 pb-7 transition-all duration-300 cursor-default backdrop-blur-sm`}
              >
                <span className={`absolute top-4 right-5 text-6xl font-bold tabular-nums ${style.num}`}>
                  {item.step}
                </span>
                <div className={`relative inline-flex w-12 h-12 rounded-xl items-center justify-center text-xl mb-5 ${style.icon}`}>
                  {item.icon}
                </div>
                <h3 className="relative font-semibold text-white text-lg mb-2.5 pr-12">{item.title}</h3>
                <p className="relative text-slate-400 text-[15px] leading-relaxed">{item.text}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto w-full px-6 py-12 border-t border-white/10"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Para quién es Health-erino
        </h2>
        <p className="text-slate-400 text-center max-w-2xl mx-auto">
          Pensado para hogares, cuidadores o pequeños dispensarios que quieren tener bajo control
          qué medicamentos tienen, cuánto stock y cuándo caducan, y poder preguntar en lenguaje
          natural con asistente de voz o chat.
        </p>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="mt-auto px-6 py-6 border-t border-white/10 flex justify-center"
      >
        <span className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Health-erino
        </span>
      </motion.footer>
    </div>
  );
}
