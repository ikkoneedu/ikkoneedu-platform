"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, Inbox } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  listPayments,
  summarizePayments,
  paymentStatusLabel,
  type PaymentRecord,
} from "@/lib/services/payments";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  PARTIAL: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  PAID: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  OVERDUE: "border-brand/30 bg-brand/10 text-brand",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) + " ₺";

/**
 * Veli Finans Kartı — bağlı öğrencinin ödeme durumunu (salt okunur) gösterir.
 * Ödemeler öğrenci uid'i VEYA adı ile eşlenir. Gerçek Firestore; tenant izole.
 */
export function ParentFinanceCard() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const isParent = profile?.role === ROLES.PARENT;
  const usable = firebaseReady && Boolean(tenantId) && isParent;

  const [all, setAll] = useState<PaymentRecord[] | null>(null);

  useEffect(() => {
    if (!usable || !tenantId) return;
    let active = true;
    void (async () => {
      const list = await listPayments(tenantId);
      if (active) setAll(list);
    })();
    return () => {
      active = false;
    };
  }, [usable, tenantId]);

  const mine = useMemo(() => {
    if (!all) return [];
    const ids = new Set(profile?.linkedStudentIds ?? []);
    const names = new Set(
      (profile?.linkedStudents ?? []).map((s) => s.displayName.toLowerCase()),
    );
    return all.filter(
      (p) =>
        (p.studentUid && ids.has(p.studentUid)) ||
        (p.studentName && names.has(p.studentName.toLowerCase())),
    );
  }, [all, profile]);

  if (!usable || all === null) return null;

  const summary = summarizePayments(mine);

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <Wallet size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Ödeme Durumu</h2>
        <span className="ml-auto text-xs text-muted">{mine.length} kayıt</span>
      </div>

      {mine.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" /> Görüntülenecek ödeme kaydı yok.
        </p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-muted">Toplam</p>
              <p className="text-base font-bold text-content">{fmt(summary.total)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-muted">Ödenen</p>
              <p className="text-base font-bold text-emerald-300">{fmt(summary.collected)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-muted">Bakiye</p>
              <p className="text-base font-bold text-brand">{fmt(summary.outstanding)}</p>
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {mine.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm"
              >
                <div>
                  <span className="font-medium text-content">{fmt(p.amount)}</span>
                  {p.dueDate && <span className="ml-2 text-xs text-muted">Vade: {p.dueDate}</span>}
                  {p.note && <p className="mt-0.5 text-xs text-muted/70">{p.note}</p>}
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLE[p.status]}`}>
                  {paymentStatusLabel(p.status)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </GlassCard>
  );
}
