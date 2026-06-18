"use client";

import { useState, type FormEvent } from "react";
import { Sparkles, Send } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";

interface ChatMessage {
  id: number;
  role: "assistant" | "user";
  text: string;
}

interface TeacherAiAssistantProps {
  suggestions: string[];
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 0,
  role: "assistant",
  text: "Merhaba! Ders planı, etkinlik, çalışma kağıdı, sınav sorusu ve karne yorumu oluşturmanıza yardımcı olabilirim.",
};

/**
 * AI Öğretmen Asistanı — mock prompt/sohbet arayüzü.
 * Gerçek AI entegrasyonu yoktur; komuta örnek (demo) yanıt döner.
 */
export function TeacherAiAssistant({ suggestions }: TeacherAiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length, role: "user", text: trimmed },
      {
        id: prev.length + 1,
        role: "assistant",
        text: "Bu bir demo yanıtıdır. Yapay zeka asistanı yakında bu komut için gerçek içerik üretecek.",
      },
    ]);
    setInput("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <GlassCard className="ai-gradient flex flex-col border-accent/20">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent">
          <Sparkles size={22} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-content">AI Öğretmen Asistanı</h2>
          <p className="text-xs text-muted">
            Ders planı, etkinlik, çalışma kağıdı, sınav sorusu ve karne yorumu
            oluşturun.
          </p>
        </div>
      </div>

      <div className="mt-5 max-h-64 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-background/40 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <span
              className={[
                "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                message.role === "user"
                  ? "bg-accent text-navy"
                  : "border border-white/10 bg-white/[0.04] text-content",
              ].join(" ")}
            >
              {message.text}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => sendMessage(q)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-content transition-colors hover:border-accent/40 hover:text-accent"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-background/40 p-2 pl-4"
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Bir komut yazın..."
          className="flex-1 bg-transparent text-sm text-content placeholder:text-muted/60 focus:outline-none"
        />
        <PrimaryButton type="submit" size="sm" aria-label="Gönder" className="!px-3">
          <Send size={16} aria-hidden="true" />
        </PrimaryButton>
      </form>
    </GlassCard>
  );
}
