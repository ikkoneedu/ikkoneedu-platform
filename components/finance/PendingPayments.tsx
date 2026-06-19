import { Hourglass } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { PendingPayment } from "@/lib/finance-mock-data";

interface PendingPaymentsProps {
  items: PendingPayment[];
}

/**
 * Bekleyen ödemeler listesi.
 * Geciken kayıtlar gecikme gün sayısıyla vurgulanır.
 */
export function PendingPayments({ items }: PendingPaymentsProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Hourglass size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Bekleyen Ödemeler</h2>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const isOverdue = item.overdueDays > 0;
          return (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-content">{item.parent}</p>
                <p className="truncate text-xs text-muted">
                  {item.student} · Vade: {item.dueDate}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-content">{item.amount}</p>
                <span
                  className={[
                    "mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    isOverdue
                      ? "border-brand/30 bg-brand/10 text-brand"
                      : "border-amber-400/20 bg-amber-400/10 text-amber-400",
                  ].join(" ")}
                >
                  {isOverdue ? `${item.overdueDays} gün gecikme` : "Vadesi yaklaşıyor"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
