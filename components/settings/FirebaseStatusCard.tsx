"use client";

import { Flame, CheckCircle2, CircleDashed } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { isFirebaseConfigured } from "@/lib/firebase/client";

/**
 * Firebase Bağlantı Durumu kartı.
 * - Env değerleri varsa: "Bağlantıya Hazır"
 * - Env değerleri yoksa: "Mock Mod"
 * Gerçek bir bağlantı testi yapmaz; yalnızca yapılandırma varlığını gösterir.
 */
export function FirebaseStatusCard() {
  const configured = isFirebaseConfigured();

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Flame size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Firebase Bağlantısı</h2>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={[
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
              configured
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                : "border-amber-400/30 bg-amber-400/10 text-amber-400",
            ].join(" ")}
          >
            {configured ? (
              <CheckCircle2 size={22} aria-hidden="true" />
            ) : (
              <CircleDashed size={22} aria-hidden="true" />
            )}
          </span>
          <div>
            <p className="text-sm font-semibold text-content">
              {configured ? "Bağlantıya Hazır" : "Mock Mod"}
            </p>
            <p className="mt-0.5 max-w-md text-xs text-muted">
              {configured
                ? "Firebase ortam değişkenleri tanımlı. Auth ve Firestore bağlantısı kurulabilir; formlar Firestore'a yazmaya hazırdır."
                : "Firebase ortam değişkenleri tanımlı değil. Formlar mock modda çalışır: kullanıcıya başarı mesajı gösterilir, Firestore'a yazılmaz."}
            </p>
          </div>
        </div>

        <span
          className={[
            "inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
            configured
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
              : "border-amber-400/30 bg-amber-400/10 text-amber-400",
          ].join(" ")}
        >
          <span
            className={[
              "h-1.5 w-1.5 rounded-full",
              configured ? "bg-emerald-400" : "bg-amber-400",
            ].join(" ")}
          />
          {configured ? "Hazır" : "Mock"}
        </span>
      </div>
    </GlassCard>
  );
}
