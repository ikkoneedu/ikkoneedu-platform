"use client";

import { Wallet, Lock } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { useT } from "@/components/i18n/LocaleProvider";

/**
 * Veli Finans Kartı — kilitli (salt bilgilendirme) durum.
 *
 * Finans/ödeme verisi HASSAS'tır: Firestore kuralları `payments` koleksiyonunu
 * yalnızca okul yönetimine açar (PARENT/STUDENT/TEACHER erişemez). Bu nedenle
 * veli panelinde ödeme listesi ÇEKİLMEZ; bunun yerine modül okul tarafından
 * aktif edildiğinde görüneceğini bildiren kilitli bir kart gösterilir.
 * (Gerçek veli ödeme görünümü ayrı bir faz; kuralları genişletmeden gelecek.)
 */
export function ParentFinanceCard() {
  const { profile, firebaseReady } = useAuth();
  const isParent = profile?.role === ROLES.PARENT;
  const t = useT();

  if (!firebaseReady || !isParent) return null;

  return (
    <GlassCard tone="navy">
      <div className="mb-3 flex items-center gap-2">
        <Wallet size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("dash.parent.finance.title")}</h2>
        <Lock size={14} className="ml-auto text-muted" aria-hidden="true" />
      </div>
      <p className="flex items-start gap-2 rounded-xl border border-overlay/10 bg-overlay/[0.03] px-4 py-3 text-sm text-muted">
        {t("dash.parent.finance.locked")}
      </p>
    </GlassCard>
  );
}
