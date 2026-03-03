"use client";

import { useChat } from "ai/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SparklesIcon } from "./sparkles-icon";
import { X } from "lucide-react";

export function ChatSidebarTrigger() {
  const [open, setOpen] = useState(false);
  const { messages, append, isLoading, input, setInput, handleSubmit, error } = useChat({
    api: "/api/chat",
  });
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<{ start(): void; stop(): void } | null>(null);
  const lastSpokenIdRef = useRef<string>("");

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }, []);

  const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
  useEffect(() => {
    if (lastAssistant?.content && !isLoading && lastAssistant.id !== lastSpokenIdRef.current) {
      lastSpokenIdRef.current = lastAssistant.id;
      speak(lastAssistant.content);
    }
  }, [lastAssistant?.id, lastAssistant?.content, isLoading, speak]);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const win = window as unknown as { SpeechRecognition?: new () => { start(): void; stop(): void }; webkitSpeechRecognition?: new () => { start(): void; stop(): void } };
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
      return;
    }
    const rec = new SpeechRecognitionAPI();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "es-ES";
    rec.onresult = (event: { results: ArrayLike<{ 0: { transcript: string }; length: number }> }) => {
      const transcript = Array.from(event.results)
        .map((r: { 0: { transcript: string } }) => r[0].transcript)
        .join("");
      if (transcript.trim()) append({ role: "user", content: transcript });
      setListening(false);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }, [append]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
      >
        <SparklesIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">Modo AI</span>
      </button>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute top-0 right-0 h-full w-full max-w-[50vw] min-w-[320px] bg-gradient-to-b from-slate-900 via-slate-800/98 to-slate-900 border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
          role="dialog"
          aria-label="Modo AI"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 shrink-0">
            <span className="flex items-center gap-1.5 text-base font-semibold text-white">
              <SparklesIcon className="h-4 w-4 shrink-0" />
              Modo AI
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {messages.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4 leading-relaxed">
                Usa el micrófono para preguntar en voz alta o escribe tu pregunta en el recuadro. El asistente solo te recomendará medicamentos que tengas en tu lista: por ejemplo, si preguntas qué puedes tomar para un dolor de cabeza o la fiebre, te dirá qué opciones tienes entre los que ya tienes guardados y te avisará si alguno está caducado.
              </p>
            )}
            <ul className="space-y-2 list-none pl-0">
              {messages.length > 0 && isLoading && messages[messages.length - 1]?.role === "user" && (
                <li className="rounded-lg p-2.5 text-sm mr-4 bg-slate-800/90 border border-white/10 text-slate-200">
                  <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Asistente</span>
                  <span className="text-slate-400 italic">Pensando...</span>
                </li>
              )}
              {messages.map((m) => {
                const isLastAssistant = m.id === messages.filter((x) => x.role === "assistant").pop()?.id;
                const showLoadingInBubble = m.role === "assistant" && isLastAssistant && isLoading && !m.content?.trim();
                return (
                  <li
                    key={m.id}
                    className={`rounded-lg p-2.5 text-sm ${
                      m.role === "user"
                        ? "ml-4 bg-indigo-600/80 text-slate-100 border border-white/10"
                        : "mr-4 bg-slate-800/90 border border-white/10 text-slate-200"
                    }`}
                  >
                    <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                      {m.role === "user" ? "Tú" : "Asistente"}
                    </span>
                    {m.role === "assistant"
                      ? (m.content?.trim() ? (
                          <span className="block whitespace-pre-wrap text-left">{m.content}</span>
                        ) : showLoadingInBubble ? (
                          <span className="text-slate-400 italic">Pensando...</span>
                        ) : !isLoading ? (
                          "No se recibió respuesta. Añade medicamentos en el panel o prueba de nuevo."
                        ) : null)
                      : m.content}
                  </li>
                );
              })}
            </ul>
            {error && (
              <p className="text-red-400 text-sm mt-2">
                {error.message || "Error al conectar. Comprueba la conexión o prueba más tarde."}
              </p>
            )}
          </div>

          <div className="border-t border-white/10 p-3 shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-base transition ${
                  listening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                }`}
                title={listening ? "Detener" : "Hablar"}
              >
                {listening ? "■" : "🎤"}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ej: ¿Qué puedo tomar si me duele la cabeza?"
                className="flex-1 min-w-0 rounded-md border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white font-medium hover:bg-emerald-500 disabled:opacity-50 transition-colors shrink-0"
              >
                Enviar
              </button>
            </form>
          </div>
        </aside>
      </div>
    </>
  );
}
