"use client";

import { useState, type FormEvent } from "react";
import { Bot, Send, User } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { getMockAiReply, type AiMessage } from "@/lib/ai-mock-data";

interface AiChatPanelProps {
  initialMessages: AiMessage[];
}

/**
 * AI Brain sohbet paneli.
 *
 * ANTHROPIC_API_KEY tanımlıysa /api/ai/generate ile GERÇEK Claude yanıtı üretir;
 * yoksa getMockAiReply ile demo yanıta düşer (sıfır maliyet). UI sözleşmesi aynı.
 */
export function AiChatPanel({ initialMessages }: AiChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AiMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(false);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    setBusy(true);
    const base = messages.length;
    setMessages((prev) => [...prev, { id: base, role: "user", text: trimmed }]);

    let reply = "";
    let isDemo = false;
    try {
      const idToken = user ? await user.getIdToken() : "";
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, kind: "chat", prompt: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok && data.text) {
        reply = data.text;
      } else {
        isDemo = true;
        reply = getMockAiReply(trimmed);
      }
    } catch {
      isDemo = true;
      reply = getMockAiReply(trimmed);
    }
    setDemo(isDemo);
    setMessages((prev) => [...prev, { id: base + 1, role: "assistant", text: reply }]);
    setBusy(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <GlassCard tone="navy" className="flex h-full min-h-[28rem] flex-col">
      {/* Başlık */}
      <div className="flex items-center gap-3 border-b border-overlay/10 pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent">
          <Bot size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-content">AI Brain Sohbet</h2>
          <p className="text-xs text-muted">Rol bazlı kurumsal asistan</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted">
          <span className={`h-2 w-2 rounded-full ${demo ? "bg-amber-400" : "bg-emerald-400"}`} />
          {demo ? "Demo" : "Canlı"}
        </span>
      </div>

      {/* Mesajlar */}
      <div className="flex-1 space-y-4 overflow-y-auto py-5">
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={isUser ? "flex justify-end gap-3" : "flex justify-start gap-3"}
            >
              {!isUser && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 text-accent">
                  <Bot size={16} aria-hidden="true" />
                </span>
              )}
              <span
                className={[
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  isUser
                    ? "bg-accent text-navy"
                    : "border border-overlay/10 bg-overlay/[0.04] text-content",
                ].join(" ")}
              >
                {message.text}
              </span>
              {isUser && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-overlay/10 bg-navy/50 text-muted">
                  <User size={16} aria-hidden="true" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Giriş */}
      <form
        onSubmit={handleSubmit}
        className="mt-2 flex items-center gap-2 rounded-xl border border-overlay/10 bg-background/40 p-2 pl-4"
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="AI Brain'e sorunuzu yazın..."
          className="flex-1 bg-transparent text-sm text-content placeholder:text-muted/60 focus:outline-none"
        />
        <PrimaryButton type="submit" size="sm" disabled={busy}>
          <Send size={16} aria-hidden="true" />
          {busy ? "..." : "Gönder"}
        </PrimaryButton>
      </form>
    </GlassCard>
  );
}
