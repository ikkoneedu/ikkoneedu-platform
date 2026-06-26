"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Lock, Clock } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useT } from "@/components/i18n/LocaleProvider";
import { useTenantModules } from "@/components/modules/useTenantModules";
import { getModule, type ModuleId } from "@/lib/modules/module-catalog";

interface ModuleGuardProps {
  moduleId: ModuleId;
  children: ReactNode;
  /** comingSoon durumunu da kilitli gibi ele al (varsayılan: true). */
  blockComingSoon?: boolean;
  /** Kilitli durumda children yerine gösterilecek özel içerik. */
  fallback?: ReactNode;
}

/**
 * Modül erişim kapısı (opt-in, salt görsel).
 *
 * Tenant'ın modül erişimine göre çocukları gösterir; modül paketinde yoksa
 * (locked) veya hazır değilse (comingSoon) bilgilendirici bir kart gösterir.
 * GERÇEK güvenlik bu bileşende DEĞİL — Firestore kuralları + RoleGuard'dadır.
 * Veri yüklenirken children render edilir (içerik gizlenmez/yanıp sönmez).
 */
export function ModuleGuard({
  moduleId,
  children,
  blockComingSoon = true,
  fallback,
}: ModuleGuardProps) {
  const t = useT();
  const { ready, statusOf } = useTenantModules();

  // Yükleme bitene kadar içeriği göster (engelleme yok).
  if (!ready) return <>{children}</>;

  const status = statusOf(moduleId);
  const blocked = status === "locked" || (blockComingSoon && status === "comingSoon");
  if (!blocked) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  const mod = getModule(moduleId);
  const isComingSoon = status === "comingSoon";
  const Icon = isComingSoon ? Clock : Lock;

  return (
    <GlassCard tone="navy" className="flex flex-col items-start gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-lg font-semibold text-content">
          {t(isComingSoon ? "modules.guard.comingSoonTitle" : "modules.guard.lockedTitle")}
        </h2>
        {mod && (
          <p className="mt-0.5 text-sm font-medium text-accent">{t(mod.nameKey)}</p>
        )}
        <p className="mt-1 text-sm text-muted">
          {t(isComingSoon ? "modules.guard.comingSoonBody" : "modules.guard.lockedBody")}
        </p>
      </div>
      {!isComingSoon && (
        <Link
          href="/demo"
          className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/20"
        >
          {t("modules.guard.contactSales")}
        </Link>
      )}
    </GlassCard>
  );
}
