import { Inbox } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { InboxMessage } from "@/lib/messages-mock-data";

interface InboxListProps {
  messages: InboxMessage[];
}

/**
 * Gelen Kutusu.
 */
export function InboxList({ messages }: InboxListProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <Inbox size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Gelen Kutusu</h2>
      </div>

      <ul className="divide-y divide-white/5">
        {messages.map((message) => (
          <li key={message.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className={[
                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                message.unread ? "bg-brand" : "bg-transparent",
              ].join(" ")}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-content">{message.sender}</span>
                <span className="shrink-0 text-xs text-muted">{message.time}</span>
              </div>
              <p className="mt-0.5 truncate text-sm text-muted">{message.preview}</p>
              <span className="mt-1 inline-block rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-accent">
                {message.channel}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
