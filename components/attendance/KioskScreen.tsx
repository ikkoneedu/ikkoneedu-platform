"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  MonitorSmartphone,
  Volume2,
  VolumeX,
  RotateCcw,
  ScanLine,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { ScannerKeyboardInput } from "@/components/attendance/ScannerKeyboardInput";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import { isDuplicateScan, type ScanCompletion } from "@/lib/attendance/scanner-buffer";
import { playSuccessBeep, playErrorBeep } from "@/lib/attendance/beep";
import { ROLES } from "@/lib/auth/role-constants";
import { productName } from "@/lib/constants";

const STORAGE_KEY = "ikk_kiosk_device";
const isDev = process.env.NODE_ENV !== "production";
const MANAGEMENT_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR, ROLES.SUPER_ADMIN,
];

interface DeviceConfig {
  tenantId: string;
  deviceId: string;
  deviceSecret: string;
  name: string;
}

interface ScanFeedback {
  ok: boolean;
  message: string;
  staffName?: string;
  action?: "checkIn" | "checkOut";
  time?: string;
}

interface ScanLogEntry extends ScanFeedback {
  id: string;
  at: number;
}

function loadDeviceConfig(): DeviceConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DeviceConfig>;
    if (parsed?.tenantId && parsed?.deviceId && parsed?.deviceSecret) {
      return {
        tenantId: parsed.tenantId,
        deviceId: parsed.deviceId,
        deviceSecret: parsed.deviceSecret,
        name: parsed.name ?? "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

function saveDeviceConfig(cfg: DeviceConfig): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    /* localStorage kullanılamıyorsa (gizli mod vb.) yok say — cihaz her seferinde yeniden sorulur */
  }
}

function clearDeviceConfig(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* yok say */
  }
}

/**
 * Kiosk Ekranı — USB QR Okuyucu (Keyboard Wedge / HID) ile personel
 * giriş-çıkış terminali. KAMERA KULLANILMAZ. Cihaz `localStorage`ta
 * saklanan kimlik + sırla kimliklenir; backend her taramada bu sırrı ve
 * QR'ın kendi imzasını (mevcut `/lib/attendance/sign.ts`) ayrıca doğrular
 * (bkz. `/api/staff-attendance/scan`).
 */
export function KioskScreen() {
  const t = useT();
  const { user, profile, firebaseReady } = useAuth();
  const [device, setDevice] = useState<DeviceConfig | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [log, setLog] = useState<ScanLogEntry[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [debugText, setDebugText] = useState("");

  const lastScanRef = useRef<{ value: string; atMs: number } | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDevice(loadDeviceConfig());
    setHydrated(true);
  }, []);

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    },
    [],
  );

  const submitScan = useCallback(
    async (scannedValue: string, cfg: DeviceConfig) => {
      const nowMs = Date.now();
      if (
        isDuplicateScan(
          lastScanRef.current?.value ?? null,
          lastScanRef.current?.atMs ?? null,
          scannedValue,
          nowMs,
        )
      ) {
        return; // frontend debounce — aynı QR kısa sürede tekrar okutuldu, sunucuya gitme
      }
      lastScanRef.current = { value: scannedValue, atMs: nowMs };

      setSubmitting(true);
      let entry: ScanLogEntry;
      try {
        const res = await fetch("/api/staff-attendance/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scannedValue,
            tenantId: cfg.tenantId,
            deviceId: cfg.deviceId,
            deviceSecret: cfg.deviceSecret,
            scanMode: "auto",
          }),
        });
        const data = await res.json().catch(() => ({ ok: false, message: t("att.kiosk.networkError") }));
        entry = {
          id: `${nowMs}`,
          at: nowMs,
          ok: Boolean(data.ok),
          message: String(data.message ?? ""),
          staffName: data.staffName,
          action: data.action,
          time: data.time,
        };
      } catch {
        entry = { id: `${nowMs}`, at: nowMs, ok: false, message: t("att.kiosk.networkError") };
      }

      setFeedback(entry);
      setLog((prev) => [entry, ...prev].slice(0, 5));
      if (soundOn) {
        if (entry.ok) playSuccessBeep();
        else playErrorBeep();
      }
      setSubmitting(false);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => setFeedback(null), 2600);
    },
    [soundOn, t],
  );

  const handleScan = useCallback(
    (completion: ScanCompletion) => {
      if (!device) return;
      void submitScan(completion.value, device);
    },
    [device, submitScan],
  );

  const handleDebugSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!device || !debugText.trim()) return;
    void submitScan(debugText.trim(), device);
    setDebugText("");
  };

  const handleActivated = (cfg: DeviceConfig) => {
    saveDeviceConfig(cfg);
    setDevice(cfg);
  };

  const handleResetDevice = () => {
    if (typeof window !== "undefined" && !window.confirm(t("att.kiosk.resetConfirm"))) return;
    clearDeviceConfig();
    setDevice(null);
    setFeedback(null);
    setLog([]);
  };

  if (!hydrated) {
    return <div className="min-h-screen w-full bg-navy" />;
  }

  if (!device) {
    return (
      <KioskSetup
        firebaseReady={firebaseReady}
        userTenantId={profile?.tenantId}
        canQuickActivate={Boolean(user && profile && MANAGEMENT_ROLES.includes(profile.role))}
        getIdToken={() => user?.getIdToken() ?? Promise.resolve("")}
        onActivated={handleActivated}
      />
    );
  }

  return (
    <div className="mesh-bg flex min-h-screen w-full flex-col items-center px-4 py-8 sm:px-8">
      {/* Üst durum çubuğu */}
      <div className="flex w-full max-w-5xl items-center justify-between gap-3 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <MonitorSmartphone size={14} aria-hidden="true" />
          {t("att.kiosk.deviceLabel")}: <span className="font-medium text-content">{device.name || device.deviceId}</span>
          <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {t("att.kiosk.deviceConnected")}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundOn((s) => !s)}
            aria-label={soundOn ? t("att.kiosk.soundOn") : t("att.kiosk.soundOff")}
            className="rounded-lg border border-overlay/10 p-1.5 text-muted transition hover:text-content"
          >
            {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button
            type="button"
            onClick={handleResetDevice}
            className="inline-flex items-center gap-1 rounded-lg border border-overlay/10 px-2 py-1.5 text-muted opacity-60 transition hover:text-content hover:opacity-100"
          >
            <RotateCcw size={12} aria-hidden="true" /> {t("att.kiosk.resetDevice")}
          </button>
        </span>
      </div>

      {/* Ana kart */}
      <div className="flex flex-1 flex-col items-center justify-center py-10">
        <h1 className="text-3xl font-bold tracking-tight text-content sm:text-4xl">{t("att.kiosk.title")}</h1>
        <p className="mt-2 text-base text-muted">{t("att.kiosk.subtitle")}</p>

        <div className="mt-10 w-full max-w-xl">
          {feedback ? (
            <div
              className={`flex flex-col items-center gap-3 rounded-3xl border-4 px-8 py-12 text-center shadow-2xl transition ${
                feedback.ok
                  ? "border-emerald-400 bg-emerald-400/10"
                  : "border-brand bg-brand/10"
              }`}
            >
              {feedback.ok ? (
                feedback.action === "checkOut" ? (
                  <LogOut size={64} className="text-emerald-400" aria-hidden="true" />
                ) : (
                  <LogIn size={64} className="text-emerald-400" aria-hidden="true" />
                )
              ) : (
                <XCircle size={64} className="text-brand" aria-hidden="true" />
              )}
              <p className={`text-2xl font-bold ${feedback.ok ? "text-emerald-300" : "text-brand"}`}>
                {feedback.ok
                  ? feedback.action === "checkOut"
                    ? t("att.kiosk.result.checkOut")
                    : t("att.kiosk.result.checkIn")
                  : feedback.message}
              </p>
              {feedback.ok && feedback.staffName && (
                <p className="text-xl font-semibold text-content">{feedback.staffName}</p>
              )}
              {feedback.ok && feedback.time && (
                <p className="text-lg text-muted">{feedback.time}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-3xl border-4 border-dashed border-overlay/15 px-8 py-16 text-center">
              <ScanLine
                size={56}
                className={`text-accent ${submitting ? "animate-pulse" : ""}`}
                aria-hidden="true"
              />
              <p className="text-xl font-semibold text-content">
                {submitting ? t("att.kiosk.processing") : t("att.kiosk.ready")}
              </p>
            </div>
          )}
        </div>

        {/* Son işlemler */}
        <div className="mt-10 w-full max-w-xl">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("att.kiosk.lastScans")}
          </h2>
          {log.length === 0 ? (
            <p className="text-sm text-muted">{t("att.kiosk.noScansYet")}</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {log.map((entry) => (
                <li
                  key={entry.id}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    entry.ok
                      ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-200"
                      : "border-brand/20 bg-brand/5 text-brand"
                  }`}
                >
                  {entry.ok ? <CheckCircle2 size={14} aria-hidden="true" /> : <XCircle size={14} aria-hidden="true" />}
                  <span className="min-w-0 flex-1 truncate">
                    {entry.ok ? `${entry.staffName ?? "—"} · ${entry.action === "checkOut" ? t("att.kiosk.result.checkOut") : t("att.kiosk.result.checkIn")}` : entry.message}
                  </span>
                  <span className="shrink-0 text-xs opacity-70">{entry.time ?? ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Geliştirme modu — fiziksel okuyucu olmadan test */}
      {isDev && (
        <div className="mb-4 w-full max-w-xl rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] p-4">
          <p className="text-xs font-semibold text-amber-300">{t("att.kiosk.debug.title")}</p>
          <p className="mt-1 text-xs text-muted">{t("att.kiosk.debug.desc")}</p>
          <form onSubmit={handleDebugSubmit} className="mt-2 flex gap-2">
            <input
              value={debugText}
              onChange={(e) => setDebugText(e.target.value)}
              placeholder={t("att.kiosk.debug.placeholder")}
              className="flex-1 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-3 py-2 font-mono text-xs text-content outline-none focus:border-accent"
            />
            <PrimaryButton type="submit" size="sm" variant="secondary" disabled={!debugText.trim()}>
              {t("att.kiosk.debug.submit")}
            </PrimaryButton>
          </form>
        </div>
      )}

      {/* Görünmez klavye yakalayıcı — her zaman focus'ta, kamera YOK. */}
      <ScannerKeyboardInput onScan={handleScan} disabled={submitting} debug={isDev} />
    </div>
  );
}

interface KioskSetupProps {
  firebaseReady: boolean;
  userTenantId: string | undefined;
  canQuickActivate: boolean;
  getIdToken: () => Promise<string>;
  onActivated: (cfg: DeviceConfig) => void;
}

function KioskSetup({
  firebaseReady,
  userTenantId,
  canQuickActivate,
  getIdToken,
  onActivated,
}: KioskSetupProps) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickActivate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userTenantId || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const location = String(data.get("location") ?? "").trim();
    if (!name) {
      setError(t("att.kiosk.setup.error"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const idToken = await getIdToken();
      const res = await fetch("/api/admin/attendance-devices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, tenantId: userTenantId, name, location }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) throw new Error(result.error ?? `HTTP ${res.status}`);
      onActivated({ tenantId: userTenantId, deviceId: result.deviceId, deviceSecret: result.secret, name });
    } catch (err) {
      setError(String((err as Error)?.message ?? err));
    } finally {
      setBusy(false);
    }
  };

  const manualActivate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const tenantId = String(data.get("tenantId") ?? "").trim();
    const deviceId = String(data.get("deviceId") ?? "").trim();
    const deviceSecret = String(data.get("deviceSecret") ?? "").trim();
    if (!tenantId || !deviceId || !deviceSecret) {
      setError(t("att.kiosk.setup.error"));
      return;
    }
    setError(null);
    onActivated({ tenantId, deviceId, deviceSecret, name: "" });
  };

  return (
    <div className="mesh-bg flex min-h-screen w-full flex-col items-center justify-center px-6 py-10 text-center">
      <MonitorSmartphone size={40} className="text-accent" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-content sm:text-3xl">
        {t("att.kiosk.setup.title")}
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted">{t("att.kiosk.setup.desc")}</p>

      {error && (
        <p className="mt-4 max-w-md rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
          {error}
        </p>
      )}

      {firebaseReady && canQuickActivate && (
        <GlassCard tone="navy" className="mt-8 w-full max-w-md text-left">
          <h2 className="text-sm font-semibold text-content">{t("att.kiosk.setup.quickTitle")}</h2>
          <p className="mt-1 text-xs text-muted">{t("att.kiosk.setup.quickDesc")}</p>
          <form onSubmit={quickActivate} className="mt-4 flex flex-col gap-3">
            <TextField label={t("att.kiosk.setup.nameLabel")} name="name" placeholder={t("att.kiosk.setup.namePlaceholder")} required />
            <TextField label={t("att.kiosk.setup.locationLabel")} name="location" placeholder={t("att.kiosk.setup.locationPlaceholder")} />
            <PrimaryButton type="submit" size="md" disabled={busy}>
              {t("att.kiosk.setup.activateBtn")}
            </PrimaryButton>
          </form>
        </GlassCard>
      )}

      <GlassCard tone="navy" className="mt-6 w-full max-w-md text-left">
        <h2 className="text-sm font-semibold text-content">{t("att.kiosk.setup.manualTitle")}</h2>
        <p className="mt-1 text-xs text-muted">{t("att.kiosk.setup.manualDesc")}</p>
        <form onSubmit={manualActivate} className="mt-4 flex flex-col gap-3">
          <TextField label={t("att.kiosk.setup.tenantIdLabel")} name="tenantId" required />
          <TextField label={t("att.kiosk.setup.deviceIdLabel")} name="deviceId" required />
          <TextField label={t("att.kiosk.setup.deviceSecretLabel")} name="deviceSecret" type="password" required />
          <PrimaryButton type="submit" variant="secondary" size="md">
            {t("att.kiosk.setup.saveBtn")}
          </PrimaryButton>
        </form>
      </GlassCard>

      <p className="mt-8 text-xs text-muted/70">{productName}</p>
    </div>
  );
}
