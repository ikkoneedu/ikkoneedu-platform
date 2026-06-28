"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  ScanLine,
  CheckCircle2,
  XCircle,
  Info,
  LogIn,
  LogOut,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";

// BarcodeDetector minimal tipleri (TS lib'inde yok).
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorInstance {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorInstance;

function getDetectorCtor(): BarcodeDetectorCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { BarcodeDetector?: BarcodeDetectorCtor };
  return w.BarcodeDetector ?? null;
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("no-geo"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

type ScanResult =
  | { kind: "in" | "out"; name: string; time: string }
  | { kind: "error"; message: string };

/**
 * Giriş-Çıkış Okuyucu — okul girişindeki tarama noktası.
 * Kamera ile personel QR'ını okur, konumu (geofence) ile birlikte sunucuya
 * gönderir; sunucu giriş/çıkış kaydeder. Kamera yoksa elle kod girişi.
 */
export function AttendanceScanner() {
  const { user, firebaseReady } = useAuth();
  const t = useT();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null);
  const cooldownRef = useRef<number>(0);
  const busyRef = useRef(false);

  const [active, setActive] = useState(false);
  const [supported] = useState(() => getDetectorCtor() !== null);
  const [status, setStatus] = useState<"idle" | "scanning" | "locating">("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manual, setManual] = useState("");

  const submitScan = useCallback(
    async (token: string) => {
      if (busyRef.current || !user) return;
      const now = Date.now();
      if (now < cooldownRef.current) return;
      busyRef.current = true;
      setStatus("locating");
      try {
        let lat: number | null = null;
        let lng: number | null = null;
        try {
          const pos = await getPosition();
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          setResult({ kind: "error", message: t("att.scan.locationDenied") });
          cooldownRef.current = Date.now() + 3500;
          return;
        }
        const idToken = await user.getIdToken();
        const res = await fetch("/api/attendance/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, token, lat, lng }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setResult({ kind: "error", message: data.error ?? t("att.scan.error") });
        } else {
          setResult({ kind: data.action, name: data.name, time: data.time });
        }
      } catch {
        setResult({ kind: "error", message: t("att.scan.error") });
      } finally {
        cooldownRef.current = Date.now() + 3500;
        busyRef.current = false;
        setStatus((s) => (s === "locating" ? "scanning" : s));
      }
    },
    [user, t],
  );

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    const Ctor = getDetectorCtor();
    if (!Ctor) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      detectorRef.current = new Ctor({ formats: ["qr_code"] });
      setActive(true);
      setStatus("scanning");
      intervalRef.current = setInterval(async () => {
        const video = videoRef.current;
        const detector = detectorRef.current;
        if (!video || !detector || busyRef.current || video.readyState < 2) return;
        try {
          const codes = await detector.detect(video);
          if (codes.length > 0 && codes[0].rawValue) {
            await submitScan(codes[0].rawValue);
          }
        } catch {
          /* tek kare hatası — yoksay */
        }
      }, 450);
    } catch {
      setResult({ kind: "error", message: t("att.scan.noCamera") });
      setActive(false);
    }
  }, [submitScan, t]);

  useEffect(() => () => stop(), [stop]);

  return (
    <div className="flex flex-col gap-6">
      <GlassCard tone="navy">
        <div className="mb-3 flex items-center gap-2">
          <ScanLine size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("att.scan.title")}</h2>
        </div>
        <p className="mb-4 text-sm text-muted">{t("att.scan.desc")}</p>

        {/* Kamera alanı */}
        {supported ? (
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-overlay/10 bg-black/40">
            <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
            {active && (
              <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-accent/60" />
            )}
            {!active && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
                <Camera size={28} aria-hidden="true" />
              </div>
            )}
          </div>
        ) : (
          <p className="flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-3 py-2 text-sm text-amber-300">
            <Info size={15} className="mt-0.5 shrink-0" aria-hidden="true" /> {t("att.scan.noCamera")}
          </p>
        )}

        {supported && (
          <div className="mt-4 flex items-center justify-center gap-3">
            {!active ? (
              <PrimaryButton type="button" size="md" onClick={() => void start()} disabled={!firebaseReady}>
                <Camera size={16} aria-hidden="true" /> {t("att.scan.start")}
              </PrimaryButton>
            ) : (
              <PrimaryButton type="button" variant="secondary" size="md" onClick={stop}>
                <CameraOff size={16} aria-hidden="true" /> {t("att.scan.stop")}
              </PrimaryButton>
            )}
            {active && (
              <span className="text-xs text-muted">
                {status === "locating" ? t("att.scan.locating") : t("att.scan.scanning")}
              </span>
            )}
          </div>
        )}

        {/* Sonuç bandı */}
        {result && (
          <div
            className={`mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
              result.kind === "error"
                ? "border-brand/30 bg-brand/10 text-brand"
                : result.kind === "in"
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-sky-400/30 bg-sky-400/10 text-sky-300"
            }`}
          >
            {result.kind === "error" ? (
              <XCircle size={18} aria-hidden="true" />
            ) : result.kind === "in" ? (
              <LogIn size={18} aria-hidden="true" />
            ) : (
              <LogOut size={18} aria-hidden="true" />
            )}
            <span className="font-medium">
              {result.kind === "error"
                ? result.message
                : `${result.name} · ${result.kind === "in" ? t("att.scan.in") : t("att.scan.out")} · ${result.time}`}
            </span>
            {result.kind !== "error" && <CheckCircle2 size={16} className="ml-auto" aria-hidden="true" />}
          </div>
        )}

        {/* Elle kod girişi (yedek) */}
        <div className="mt-5 border-t border-overlay/10 pt-4">
          <label htmlFor="manual-code" className="text-xs font-medium text-muted">
            {t("att.scan.manualLabel")}
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="manual-code"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="IKK-ATT|…"
              className="flex-1 rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2 text-sm text-content outline-none focus:border-accent"
            />
            <PrimaryButton
              type="button"
              size="md"
              variant="secondary"
              onClick={() => {
                if (manual.trim()) void submitScan(manual.trim());
              }}
              disabled={!manual.trim() || !firebaseReady}
            >
              {t("att.scan.manualBtn")}
            </PrimaryButton>
          </div>
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs text-muted">
          <Info size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          {t("att.scan.operatorNote")}
        </p>
      </GlassCard>
    </div>
  );
}
