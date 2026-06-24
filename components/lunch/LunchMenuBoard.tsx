"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { UtensilsCrossed, Send, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { createLunchMenu, deleteLunchMenu, listLunchMenu, type LunchMenuRecord } from "@/lib/services/lunch-menu";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const STAFF_ROLES: string[] = [
  ROLES.COORDINATOR, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
  ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.SUPER_ADMIN,
];

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", weekday: "long" }).format(d);
}

/**
 * Yemek listesi — GERÇEK Firestore. Yönetim günlük menü ekler; tenant üyeleri
 * görür. Tenant izole. `readOnly` ile ekleme formu gizlenir.
 */
export function LunchMenuBoard({ readOnly = false }: { readOnly?: boolean }) {
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canCreate = !readOnly && profile != null && STAFF_ROLES.includes(profile.role);

  const [items, setItems] = useState<LunchMenuRecord[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    try {
      setItems(await listLunchMenu(tenantId));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId]);

  useEffect(() => {
    if (firebaseReady && tenantId) void refresh();
  }, [firebaseReady, tenantId, refresh]);

  const handleDelete = async (id: string) => {
    if (!tenantId) return;
    try {
      await deleteLunchMenu(tenantId, id);
      setItems((prev) => prev?.filter((x) => x.id !== id) ?? prev);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenantId || !user || busy) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const date = String(data.get("date") ?? "").trim();
    const itemsRaw = String(data.get("items") ?? "").trim();
    const list = itemsRaw.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!date || list.length === 0) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await createLunchMenu({ tenantId, authorUid: user.uid, date, items: list });
      form.reset();
      setSaved(true);
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!firebaseReady || !profile || !tenantId || items === null) {
    return (
      <GlassCard tone="navy">
        <p className="py-8 text-center text-sm text-muted">Yükleniyor…</p>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {canCreate && (
        <GlassCard tone="navy">
          <div className="mb-4 flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">Günlük Menü Ekle</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <TextField label="Tarih" name="date" type="date" required />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lm-items" className="text-sm font-medium text-muted">
                Öğünler (her satıra bir öğün)
              </label>
              <textarea
                id="lm-items" name="items" rows={4} required
                placeholder={"Mercimek çorbası\nIzgara köfte\nPilav\nMevsim salata"}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            {error && (
              <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
                <AlertCircle size={16} aria-hidden="true" />{error}
              </p>
            )}
            {saved && (
              <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle2 size={16} aria-hidden="true" />Menü eklendi.
              </p>
            )}
            <PrimaryButton type="submit" size="md" disabled={busy}>
              <Send size={16} aria-hidden="true" />{busy ? "Ekleniyor…" : "Ekle"}
            </PrimaryButton>
          </form>
        </GlassCard>
      )}

      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <UtensilsCrossed size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Yemek Listesi</h2>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted">Henüz menü yok.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((m) => (
              <li key={m.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    {fmtDate(m.date)}
                  </span>
                  {canCreate && (
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      aria-label="Menüyü sil"
                      className="text-muted transition-colors hover:text-brand"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  )}
                </div>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {m.items.map((it, i) => (
                    <li key={i} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-content">
                      {it}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
