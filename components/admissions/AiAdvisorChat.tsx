"use client";

import { useState, type FormEvent } from "react";
import { Bot, User, Send, CalendarPlus, BookOpen, Phone } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { AdmissionsMessage } from "@/lib/admissions-ai-mock-data";

interface AiAdvisorChatProps {
  initialMessages: AdmissionsMessage[];
  actions: string[];
}

const ACTION_ICONS = [CalendarPlus, BookOpen, Phone];

/**
 * AI Danışman Önizleme — aday veli sohbet paneli (mock).
 * Gerçek AI yoktur; gönderilen mesaja demo yanıt eklenir.
 */
export function AiAdvisorChat({ initialMessages, actions }: AiAdvisorChatProps) {
  const [messages, setMessages] = useState<AdmissionsMessage[]>(initialMessages);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length, role: "candidate", text: trimmed },
      {
        id: prev.length + 1,
        role: "advisor",
        text: "Bu bir demo yanıtıdır. AI Kayıt Danışmanı yakında gerçek verilerle yanıt verecek.",
      },
    ]);
    setInput("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(input);
  };

  return (
    <GlassCard tone="navy" className="flex flex-col">
      <div className="flex items-center gap-3 border-b border-overlay/10 pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent">
          <Bot size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-content">AI Kayıt Danışmanı</h2>
          <p className="text-xs text-muted">Aday veli görüşmesi</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Çevrimiçi
        </span>
      </div>

      <div className="flex-1 space-y-4 py-5">
        {messages.map((message) => {
          const isCandidate = message.role === "candidate";
          return (
            <div key={message.id} className={isCandidate ? "flex justify-end gap-3" : "flex justify-start gap-3"}>
              {!isCandidate && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 text-accent">
                  <Bot size={16} aria-hidden="true" />
                </span>
              )}
              <span
                className={[
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  isCandidate ? "bg-accent text-navy" : "border border-overlay/10 bg-overlay/[0.04] text-content",
                ].join(" ")}
              >
                {message.text}
              </span>
              {isCandidate && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-overlay/10 bg-navy/50 text-muted">
                  <User size={16} aria-hidden="true" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Eylem butonları */}
      <div className="flex flex-wrap gap-2 border-t border-overlay/10 pt-4">
        {actions.map((action, index) => {
          const Icon = ACTION_ICONS[index] ?? CalendarPlus;
          return (
            <button
              key={action}
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
            >
              <Icon size={13} aria-hidden="true" />
              {action}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 rounded-xl border border-overlay/10 bg-background/40 p-2 pl-4">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Aday veli olarak yazın..."
          className="flex-1 bg-transparent text-sm text-content placeholder:text-muted/60 focus:outline-none"
        />
        <PrimaryButton type="submit" size="sm" aria-label="Gönder" className="!px-3">
          <Send size={16} aria-hidden="true" />
        </PrimaryButton>
      </form>
    </GlassCard>
  );
}
