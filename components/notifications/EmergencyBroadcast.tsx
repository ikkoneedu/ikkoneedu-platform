"use client";

import { useState, type FormEvent } from "react";
import { Siren, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { notifyAllTenantMembers } from "@/lib/services/notifications";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const MANAGER_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL, ROLES.SUPER_ADMIN,
];

/**
 * Acil duyuru — okul yönetimi tek tıkla TÜM okula anında bildirim gönderir
 * (kar tatili, erken çıkış vb.). Yanlışlıkla göndermeyi önlemek için onay adımı.
 * Yalnızca yönetim rollerinde render edilir.
 */
export function EmergencyBroadcast() {
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canSend = profile != null && MANAGER_ROLES.includes(profile.role);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  if (!firebaseReady || !tenantId || !canSend) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || busy) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const body = String(data.get("body") ?? "").trim();
    if (!title || !body) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    setError(null);
    setSent(null);
    try {
      const count = await notifyAllTenantMembers(tenantId, {
        title,
        body,
        createdBy: user.uid,
        createdByName: profile?.displayName ?? "Yönetim",
      });
      setSent(count);
      setConfirming(false);
      form.reset();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard tone="navy" className="border-brand/20">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand/30 bg-brand/10 text-brand">
          <Siren size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-content">Acil Duyuru</h2>
          <p className="text-xs text-muted">Tüm okula (veli, öğrenci, personel) anında bildirim gönderir.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <TextField label="Başlık" name="title" placeholder="Kar Tatili / Erken Çıkış" required />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="eb-body" className="text-sm font-medium text-muted">Mesaj</label>
          <textarea
            id="eb-body" name="body" rows={3} required
            placeholder="Yarın okul tatil edilmiştir…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
            <AlertCircle size={16} aria-hidden="true" />{error}
          </p>
        )}
        {sent !== null && (
          <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-400">
            <CheckCircle2 size={16} aria-hidden="true" />Acil duyuru {sent} kişiye gönderildi.
          </p>
        )}

        {confirming ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3">
            <span className="text-sm text-brand">Tüm okula gönderilecek. Emin misiniz?</span>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-content"
              >
                Vazgeç
              </button>
              <PrimaryButton type="submit" size="sm" disabled={busy} className="bg-brand text-white hover:bg-brand/90">
                <Send size={14} aria-hidden="true" />
                {busy ? "Gönderiliyor…" : "Evet, Gönder"}
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <PrimaryButton type="submit" size="md" className="bg-brand text-white hover:bg-brand/90">
            <Siren size={16} aria-hidden="true" />Acil Duyuru Gönder
          </PrimaryButton>
        )}
      </form>
    </GlassCard>
  );
}
