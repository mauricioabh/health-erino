"use client";

import { useChat } from "ai/react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function ChatPage() {
  const { messages, append, isLoading } = useChat({
    api: "/api/chat",
  });
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
      return;
    }
    const rec = new SpeechRecognitionAPI();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "es-ES";
    rec.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      if (transcript.trim()) {
        append({ role: "user", content: transcript });
      }
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
    <main className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-slate-700 hover:text-emerald-600">
          Health Erino
        </Link>
        <Link href="/admin" className="text-sm text-slate-600 hover:text-slate-800">
          Admin
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        {messages.length === 0 && (
          <p className="text-slate-500 text-center py-8">
            Pulsa el micrófono y pregunta por tus medicamentos: stock, para qué sirven o si han caducado.
          </p>
        )}
        <ul className="space-y-4">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-xl p-4 ${
                m.role === "user"
                  ? "ml-8 bg-emerald-100 text-slate-800"
                  : "mr-8 bg-white border border-slate-200 text-slate-700"
              }`}
            >
              <span className="text-xs font-medium text-slate-500 block mb-1">
                {m.role === "user" ? "Tú" : "Asistente"}
              </span>
              {m.content}
            </li>
          ))}
        </ul>
        {isLoading && (
          <p className="text-slate-500 text-sm mt-2">Pensando...</p>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-white flex justify-center gap-4">
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition ${
            listening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          }`}
          title={listening ? "Detener" : "Hablar"}
        >
          {listening ? "■" : "🎤"}
        </button>
      </div>
    </main>
  );
}
