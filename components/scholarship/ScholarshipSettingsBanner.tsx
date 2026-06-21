"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Users, Hash, Settings2 } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSettings, type ScholarshipSettings } from "@/lib/services/settings";

/**
 * Bursluluk ayar şeridi — `tenants/{id}/settings/scholarship`'ten OKUR.
 * Settings modülünün tek kaynak olduğunu somutlaştırır: sınav tarihi, son
 * başvuru, kontenjan ve başvuru no ön eki buradan gelir.
 */
export function ScholarshipSettingsBanner() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const usable = firebaseReady && Boolean(tenantId);

  const [s, setS] = useState<ScholarshipSettings | null>(null);

  useEffect(() => {
    if (!usable || !tenantId) return;
    let active = true;
    void (async () => {
      const data = await getSettings(tenantId, "scholarship");
      if (active) setS(data);
    })();
    return () => {
      active = false;
    };
  }, [usable, tenantId]);

  if (!usable || !s) return null;

  const hasAny = s.examDate || s.applicationDeadline || s.quota || s.applicationPrefix;
  const items = [
    { icon: Calendar, label: "Sınav Tarihi", value: s.examDate },
    { icon: Clock, label: "Son Başvuru", value: s.applicationDeadline },
    { icon: Users, label: "Kontenjan", value: s.quota },
    { icon: Hash, label: "Başvuru Ön Eki", value: s.applicationPrefix },
  ].filter((i) => i.value);

  return (
    <GlassCard tone="navy">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
          <Settings2 size={14} aria-hidden="true" /> Bursluluk Ayarları
        </span>
        {hasAny ? (
          <div className="flex flex-wrap gap-4">
            {items.map((i) => {
              const Icon = i.icon;
              return (
                <span key={i.label} className="flex items-center gap-1.5 text-sm text-content">
                  <Icon size={14} className="text-muted" aria-hidden="true" />
                  <span className="text-muted">{i.label}:</span> {i.value}
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-sm text-muted">Henüz ayar girilmedi.</span>
        )}
        <Link
          href="/settings#okul-ayarlari"
          className="ml-auto text-xs text-muted transition-colors hover:text-accent"
        >
          Ayarları düzenle
        </Link>
      </div>
    </GlassCard>
  );
}
