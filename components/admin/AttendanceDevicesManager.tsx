"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { MonitorSmartphone, Plus, Copy, CheckCircle2, AlertCircle, Power } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { useHasRole } from "@/components/auth/RoleGate";
import { ROLES } from "@/lib/auth/role-constants";
import {
  listAttendanceDevices,
  setAttendanceDeviceStatus,
  type AttendanceDevice,
} from "@/lib/services/attendance-devices";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

/**
 * Kiosk Cihazları — okul girişindeki USB QR okuyucu terminallerini yönetir.
 * Cihaz oluşturma sunucu API'sinden geçer (sır yalnızca burada bir kez
 * gösterilir); durum değiştirme doğrudan Firestore'a yazılır (kurallar
 * yalnızca status/name/location alanlarına izin verir).
 */
export function AttendanceDevicesManager() {
  const { user, profile, firebaseReady, loading } = useAuth();
  const canManage = useHasRole([
    ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL,
    ROLES.VICE_PRINCIPAL, ROLES.COORDINATOR, ROLES.SUPER_ADMIN,
  ]);
  const tenantId = profile?.tenantId;
  const ready = firebaseReady && Boolean(tenantId) && Boolean(user) && canManage;

  const [devices, setDevices] = useState<AttendanceDevice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<{ deviceId: string; secret: string } | null>(null);
  const [copied, setCopied] = useState<"id" | "secret" | null>(null);

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    try {
      setDevices(await listAttendanceDevices(tenantId));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId]);

  useEffect(() => {
    if (ready) void refresh();
  }, [ready, refresh]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !user || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const location = String(data.get("location") ?? "").trim();
    if (!name) {
      setError("Lütfen cihaz adı girin (ör. Ana Giriş).");
      return;
    }
    setBusy(true);
    setError(null);
    setCreated(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/attendance-devices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, tenantId, name, location }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) throw new Error(result.error ?? `HTTP ${res.status}`);
      setCreated({ deviceId: result.deviceId, secret: result.secret });
      form.reset();
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (device: AttendanceDevice) => {
    if (!tenantId || busy) return;
    setBusy(true);
    try {
      await setAttendanceDeviceStatus(tenantId, device.id, device.status === "active" ? "passive" : "active");
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string, which: "id" | "secret") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  if (loading) return <GlassCard tone="navy" className="text-sm text-muted">Yükleniyor…</GlassCard>;

  if (!ready) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="text-sm text-muted">
          Kiosk cihaz yönetimi yalnızca yönetim hesabıyla, giriş yapılmış ve Firebase aktifken kullanılabilir.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}

      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <MonitorSmartphone size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Yeni Kiosk Cihazı Etkinleştir</h2>
        </div>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
          <TextField label="Cihaz Adı" name="name" placeholder="Ana Giriş" required />
          <TextField label="Lokasyon" name="location" placeholder="main_gate" />
          <PrimaryButton type="submit" size="md" disabled={busy} className="lg:col-span-1">
            <Plus size={16} aria-hidden="true" />
            Etkinleştir
          </PrimaryButton>
        </form>

        {created && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4">
            <p className="text-sm font-semibold text-content">
              Cihaz etkinleştirildi — bu sır bir daha gösterilmeyecek, kiosk bilgisayarına şimdi kaydedin.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">Cihaz ID:</span>
              <span className="font-mono text-accent">{created.deviceId}</span>
              <button
                type="button"
                onClick={() => void copy(created.deviceId, "id")}
                className="inline-flex items-center gap-1 rounded-lg border border-overlay/10 px-2 py-1 text-xs text-muted transition hover:text-content"
              >
                {copied === "id" ? <CheckCircle2 size={13} /> : <Copy size={13} />} Kopyala
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">Cihaz Sırrı:</span>
              <span className="font-mono text-accent">{created.secret}</span>
              <button
                type="button"
                onClick={() => void copy(created.secret, "secret")}
                className="inline-flex items-center gap-1 rounded-lg border border-overlay/10 px-2 py-1 text-xs text-muted transition hover:text-content"
              >
                {copied === "secret" ? <CheckCircle2 size={13} /> : <Copy size={13} />} Kopyala
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard tone="navy">
        <h2 className="mb-4 text-lg font-semibold text-content">Kayıtlı Cihazlar</h2>
        {devices.length === 0 ? (
          <p className="text-sm text-muted">Henüz kiosk cihazı tanımlanmamış.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {devices.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-overlay/10 bg-overlay/[0.03] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-content">{d.name}</p>
                  <p className="text-xs text-muted">
                    {d.location || "—"} · <span className="font-mono">{d.id}</span>
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs ${
                    d.status === "active"
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border-overlay/15 bg-overlay/[0.05] text-muted"
                  }`}
                >
                  {d.status === "active" ? "Aktif" : "Pasif"}
                </span>
                <PrimaryButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={busy}
                  onClick={() => void toggleStatus(d)}
                >
                  <Power size={14} aria-hidden="true" />
                  {d.status === "active" ? "Pasifleştir" : "Aktifleştir"}
                </PrimaryButton>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
