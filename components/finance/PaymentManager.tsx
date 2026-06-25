"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Wallet, Plus, Save, AlertCircle, RefreshCw, BellRing, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  createPayment,
  listPayments,
  recordPayment,
  summarizePayments,
  paymentStatusLabel,
  type PaymentRecord,
} from "@/lib/services/payments";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { notifyStudentParents } from "@/lib/services/notifications";

const MANAGER_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.SUPER_ADMIN,
];

const STATUS_STYLE: Record<string, string> = {
  PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  PARTIAL: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  PAID: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  OVERDUE: "border-brand/30 bg-brand/10 text-brand",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) + " ₺";

/**
 * Finans / Ödeme Yönetimi — GERÇEK Firestore (öğrenci bazlı ödeme durumu).
 * Personel ödeme/tahakkuk ekler, tahsilat girer; durum otomatik türetilir.
 * Yalnızca okul yönetimi yazar; tenant izole. (Muhasebe değil, basit takip.)
 */
export function PaymentManager() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canEdit = profile != null && MANAGER_ROLES.includes(profile.role);
  const usable = firebaseReady && Boolean(tenantId) && canEdit;

  const [rows, setRows] = useState<PaymentRecord[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [paid, setPaid] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [remindedId, setRemindedId] = useState<string | null>(null);

  const remind = useCallback(
    async (r: PaymentRecord) => {
      if (!tenantId || !r.studentUid || remindingId) return;
      setRemindingId(r.id);
      setError(null);
      try {
        const bal = r.amount - r.paidAmount;
        const count = await notifyStudentParents(tenantId, r.studentUid, {
          title: "Ödeme hatırlatması",
          body: `${r.studentName} için ${bal.toLocaleString("tr-TR")} ₺ ödeme bekleniyor${r.dueDate ? ` (son tarih: ${r.dueDate})` : ""}.`,
          type: "system",
          link: "/notifications",
        });
        if (count === 0) {
          setError("Bu öğrencinin bağlı veli hesabı bulunamadı.");
        } else {
          setRemindedId(r.id);
          setTimeout(() => setRemindedId(null), 2500);
        }
      } catch (err) {
        setError(getAuthErrorMessage(err));
      } finally {
        setRemindingId(null);
      }
    },
    [tenantId, remindingId],
  );

  const load = useCallback(async () => {
    if (!tenantId) return;
    setRefreshing(true);
    try {
      setRows(await listPayments(tenantId));
      setError(null);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  const summary = useMemo(() => summarizePayments(rows ?? []), [rows]);

  if (!usable) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <div className="text-sm text-muted">
          <p className="font-semibold text-content">Ödeme yönetimi kullanılamıyor</p>
          <p className="mt-1">
            Bu bölüm yalnızca giriş yapmış bir okul yöneticisi/kurucu hesabıyla ve
            Firebase aktifken çalışır.
          </p>
        </div>
      </GlassCard>
    );
  }

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenantId || busy) return;
    const f = new FormData(e.currentTarget);
    const studentName = String(f.get("studentName") ?? "").trim();
    const grade = String(f.get("grade") ?? "").trim();
    const amount = parseFloat(String(f.get("amount") ?? ""));
    const dueDate = String(f.get("dueDate") ?? "");
    if (!studentName || !Number.isFinite(amount) || amount <= 0) {
      setError("Öğrenci adı ve geçerli bir tutar girin.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createPayment(tenantId, { studentName, grade, amount, dueDate });
      e.currentTarget.reset();
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const collect = async (r: PaymentRecord) => {
    if (!tenantId || savingId) return;
    const val = parseFloat(paid[r.id] ?? String(r.paidAmount));
    if (!Number.isFinite(val) || val < 0) {
      setError("Geçerli bir ödenen tutar girin.");
      return;
    }
    setSavingId(r.id);
    setError(null);
    try {
      await recordPayment(tenantId, r.id, val, r.amount);
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Özet */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Toplam Tahakkuk" value={fmt(summary.total)} />
        <Stat label="Tahsil Edilen" value={fmt(summary.collected)} tone="emerald" />
        <Stat label="Bakiye" value={fmt(summary.outstanding)} tone="brand" />
        <Stat label="Gecikmiş" value={String(summary.byStatus.OVERDUE)} tone="brand" />
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
          <AlertCircle size={15} aria-hidden="true" /> {error}
        </p>
      )}

      {/* Tahakkuk ekle */}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Tahakkuk / Ödeme Ekle</h2>
        </div>
        <form onSubmit={add} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <TextField label="Öğrenci" name="studentName" placeholder="Ad Soyad" required />
          <TextField label="Sınıf" name="grade" placeholder="5-A" />
          <TextField label="Tutar (₺)" name="amount" type="number" placeholder="25000" required />
          <TextField label="Vade" name="dueDate" type="date" />
          <PrimaryButton type="submit" size="md" disabled={busy}>
            <Plus size={16} aria-hidden="true" />
            {busy ? "Ekleniyor…" : "Ekle"}
          </PrimaryButton>
        </form>
      </GlassCard>

      {/* Liste */}
      <GlassCard tone="navy">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Wallet size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Öğrenci Ödemeleri (canlı)</h2>
          <span className="text-xs text-muted">{rows?.length ?? 0} kayıt</span>
          <button
            type="button"
            onClick={() => void load()}
            disabled={refreshing}
            className="ml-auto text-muted transition hover:text-content disabled:opacity-50"
            aria-label="Yenile"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
          {(rows?.length ?? 0) > 0 && (
            <DataExportButtons
              filename="odemeler"
              title="Öğrenci Ödemeleri"
              columns={[
                { key: "studentName", label: "Öğrenci" },
                { key: "grade", label: "Sınıf" },
                { key: "amount", label: "Tutar" },
                { key: "paidAmount", label: "Ödenen" },
                { key: "dueDate", label: "Vade" },
                { key: "status", label: "Durum" },
              ]}
              rows={(rows ?? []) as unknown as Record<string, unknown>[]}
            />
          )}
        </div>

        {rows === null ? (
          <p className="text-sm text-muted">Yükleniyor…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted">Henüz ödeme kaydı yok. Yukarıdan ekleyin.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 pr-4 font-medium">Öğrenci</th>
                  <th className="pb-2 pr-4 font-medium">Tutar</th>
                  <th className="pb-2 pr-4 font-medium">Vade</th>
                  <th className="pb-2 pr-4 font-medium">Durum</th>
                  <th className="pb-2 font-medium">Ödenen / İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-overlay/5">
                {rows.map((r) => (
                  <tr key={r.id} className="text-content">
                    <td className="py-2.5 pr-4">
                      <span className="font-medium">{r.studentName}</span>
                      {r.grade && <span className="ml-2 text-xs text-muted">{r.grade}</span>}
                    </td>
                    <td className="py-2.5 pr-4">{fmt(r.amount)}</td>
                    <td className="py-2.5 pr-4 text-muted">{r.dueDate || "—"}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLE[r.status]}`}>
                        {paymentStatusLabel(r.status)}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={paid[r.id] ?? String(r.paidAmount)}
                          onChange={(e) => setPaid((p) => ({ ...p, [r.id]: e.target.value }))}
                          className="w-24 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2 py-1 text-xs text-content outline-none focus:border-accent"
                        />
                        <PrimaryButton
                          size="sm"
                          variant="secondary"
                          onClick={() => collect(r)}
                          disabled={savingId === r.id}
                        >
                          <Save size={13} aria-hidden="true" />
                          {savingId === r.id ? "…" : "Tahsil"}
                        </PrimaryButton>
                        {r.status !== "PAID" && r.studentUid && (
                          <button
                            type="button"
                            onClick={() => remind(r)}
                            disabled={remindingId === r.id}
                            title="Veliye ödeme hatırlatması gönder"
                            className="flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-400/20 disabled:opacity-50"
                          >
                            {remindedId === r.id ? (
                              <CheckCircle2 size={13} aria-hidden="true" />
                            ) : (
                              <BellRing size={13} aria-hidden="true" />
                            )}
                            {remindingId === r.id ? "…" : remindedId === r.id ? "Gönderildi" : "Hatırlat"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "emerald" | "brand" }) {
  const color = tone === "emerald" ? "text-emerald-300" : tone === "brand" ? "text-brand" : "text-content";
  return (
    <GlassCard tone="navy" className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
    </GlassCard>
  );
}
