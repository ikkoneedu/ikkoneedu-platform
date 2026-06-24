"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Bus, Phone, User, Send, AlertCircle, CheckCircle2, Navigation } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { createBusRoute, listBusRoutes, type BusRouteRecord } from "@/lib/services/bus-routes";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const STAFF_ROLES: string[] = [
  ROLES.COORDINATOR, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
  ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.SUPER_ADMIN,
];

/**
 * Servis takibi — GERÇEK Firestore. Yönetim rota/durak/saat bilgisi ekler;
 * tenant üyeleri görür (canlı GPS değil, statik bilgi). `readOnly` ile form gizli.
 */
export function BusRoutesBoard({ readOnly = false }: { readOnly?: boolean }) {
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canCreate = !readOnly && profile != null && STAFF_ROLES.includes(profile.role);

  const [items, setItems] = useState<BusRouteRecord[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    try {
      setItems(await listBusRoutes(tenantId));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId]);

  useEffect(() => {
    if (firebaseReady && tenantId) void refresh();
  }, [firebaseReady, tenantId, refresh]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenantId || !user || busy) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const routeName = String(data.get("routeName") ?? "").trim();
    const driver = String(data.get("driver") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const stopsRaw = String(data.get("stops") ?? "").trim();
    const stops = stopsRaw.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!routeName) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await createBusRoute({ tenantId, authorUid: user.uid, routeName, driver, phone, stops });
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
            <Bus size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">Servis Rotası Ekle</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <TextField label="Rota Adı" name="routeName" placeholder="1 Numaralı Hat" required />
              <TextField label="Şoför" name="driver" placeholder="Ad Soyad" />
              <TextField label="Telefon" name="phone" placeholder="05xx…" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bus-stops" className="text-sm font-medium text-muted">
                Duraklar (her satıra bir durak — örn. Merkez Meydan - 07:30)
              </label>
              <textarea
                id="bus-stops" name="stops" rows={4}
                placeholder={"Merkez Meydan - 07:30\nGül Sokak - 07:40\nOkul - 08:00"}
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
                <CheckCircle2 size={16} aria-hidden="true" />Rota eklendi.
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
          <Bus size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Servis Rotaları</h2>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted">Henüz rota tanımlı değil.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((r) => (
              <li key={r.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="font-semibold text-content">{r.routeName}</h3>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  {r.driver && (
                    <span className="flex items-center gap-1"><User size={12} aria-hidden="true" />{r.driver}</span>
                  )}
                  {r.phone && (
                    <a href={`tel:${r.phone}`} className="flex items-center gap-1 text-accent hover:text-content">
                      <Phone size={12} aria-hidden="true" />{r.phone}
                    </a>
                  )}
                </div>
                {r.stops.length > 0 && (
                  <ul className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
                    {r.stops.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted">
                        <Navigation size={12} className="shrink-0 text-accent" aria-hidden="true" />{s}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
