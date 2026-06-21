"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings2, School } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLE_LABELS } from "@/lib/auth/role-constants";
import { getSchool } from "@/lib/services/schools";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "IK";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Panel üstünde gösterilen hesap özeti — giriş yapan kullanıcının kimliği,
 * rolü ve bağlı okulu. Profil düzenlemeye kısayol. Yalnızca giriş yapmış
 * kullanıcı + Firebase aktifken görünür (Mock Mod'da hiçbir şey göstermez).
 */
export function AccountSummaryCard() {
  const { profile, firebaseReady } = useAuth();
  const [schoolName, setSchoolName] = useState<string | null>(null);

  useEffect(() => {
    const tid = profile?.tenantId;
    if (!tid || tid === "public" || tid === "platform") return;
    let active = true;
    void (async () => {
      try {
        const s = await getSchool(tid);
        if (active) setSchoolName(s?.name ?? null);
      } catch {
        /* yoksay */
      }
    })();
    return () => {
      active = false;
    };
  }, [profile?.tenantId]);

  if (!firebaseReady || !profile) return null;

  const school =
    schoolName ??
    (profile.tenantId === "platform"
      ? "Platform"
      : profile.tenantId === "public"
        ? "Genel"
        : profile.tenantId);

  return (
    <GlassCard tone="navy" className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-navy text-base font-bold text-accent">
        {initials(profile.displayName || profile.email)}
      </div>
      <div className="min-w-0">
        <p className="text-base font-semibold text-content">
          Hoş geldiniz, {profile.displayName || "Kullanıcı"}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted">
          <span>{ROLE_LABELS[profile.role] ?? profile.role}</span>
          <span className="text-muted/40" aria-hidden="true">
            ·
          </span>
          <span className="flex items-center gap-1">
            <School size={13} className="text-accent" aria-hidden="true" />
            {school}
          </span>
        </p>
      </div>
      <Link href="/profile" className="sm:ml-auto">
        <PrimaryButton variant="secondary" size="sm">
          <Settings2 size={15} aria-hidden="true" />
          Profili Düzenle
        </PrimaryButton>
      </Link>
    </GlassCard>
  );
}
