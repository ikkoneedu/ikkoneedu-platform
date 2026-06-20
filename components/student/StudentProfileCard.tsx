"use client";

import { GraduationCap, School, KeyRound } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";

/**
 * Öğrenci panelinde öğrencinin kendi bilgisi (gerçek veri — kendi profili).
 * Yalnızca giriş yapmış öğrenci + Firebase aktifken görünür.
 */
export function StudentProfileCard() {
  const { profile, firebaseReady } = useAuth();
  if (!firebaseReady || profile?.role !== ROLES.STUDENT) return null;

  return (
    <GlassCard tone="navy">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-navy/50 text-accent">
          <GraduationCap size={28} aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg font-bold tracking-tight text-content">
            {profile.displayName}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            {profile.className && (
              <span className="flex items-center gap-1.5">
                <School size={13} aria-hidden="true" />
                {profile.className}
              </span>
            )}
            {profile.accessCode && (
              <span className="flex items-center gap-1.5">
                <KeyRound size={13} aria-hidden="true" />
                {profile.accessCode}
              </span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
