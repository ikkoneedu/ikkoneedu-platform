import { MessageSquare } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { TeacherMessage } from "@/lib/mock-data";

interface ParentMessagesProps {
  messages: TeacherMessage[];
}

/**
 * Veli mesajları.
 * Gönderen, kısa önizleme, zaman ve okunmamış etiketini listeler.
 */
export function ParentMessages({ messages }: ParentMessagesProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Veli Mesajları</h2>
      </div>
      <ul className="divide-y divide-white/5">
        {messages.map((message) => (
          <li key={message.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/50 text-accent">
              <MessageSquare size={16} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-content">
                  {message.sender}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  {message.unread && (
                    <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold text-brand">
                      Okunmamış
                    </span>
                  )}
                  <span className="text-xs text-muted">{message.time}</span>
                </div>
              </div>
              <p className="mt-0.5 truncate text-sm text-muted">{message.preview}</p>
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
