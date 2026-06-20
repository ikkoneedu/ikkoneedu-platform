"use client";

import { GraduationCap, School } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";

/**
 * Veli panelinde bağlı öğrenci(ler) kartı (gerçek veri).
 * Öğrenci özetleri veli profiline denormalize edildiği için yalnızca kendi
 * profili okunur. Yalnızca giriş yapmış veli + Firebase aktifken görünür.
 */
export function ParentChildCard() {
  const { profile, firebaseReady } = useAuth();
  if (!firebaseReady || profile?.role !== ROLES.PARENT) return null;

  const children = profile.linkedStudents ?? [];

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <GraduationCap size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Öğrencim</h2>
      </div>

      {children.length === 0 ? (
        <p className="text-sm text-muted">
          Henüz bağlı öğrenci yok. Öğretmeninizle iletişime geçin.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {children.map((child) => (
            <div
              key={child.uid}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
                <GraduationCap size={22} aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-content">{child.displayName}</p>
                {profile.className && (
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <School size={13} aria-hidden="true" />
                    {profile.className}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
