"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Users, BookOpen, UsersRound } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listTenantUsers } from "@/lib/services/users";

/**
 * Okul Özeti — tenant'taki kullanıcıların gerçek (Firestore) sayıları.
 * Yalnızca giriş yapmış personel + Firebase aktifken görünür; aksi halde
 * (Mock Mod / demo) hiçbir şey render etmez, mevcut sayfayı bozmaz.
 */
export function TenantOverview() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const isStaff =
    profile?.role === ROLES.SCHOOL_ADMIN ||
    profile?.role === ROLES.PRINCIPAL ||
    profile?.role === ROLES.SUPER_ADMIN;

  const [counts, setCounts] = useState<{
    students: number;
    parents: number;
    teachers: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (!firebaseReady || !tenantId || !isStaff) return;
    let active = true;
    void (async () => {
      const users = await listTenantUsers(tenantId);
      if (!active) return;
      setCounts({
        students: users.filter((u) => u.role === ROLES.STUDENT).length,
        parents: users.filter((u) => u.role === ROLES.PARENT).length,
        teachers: users.filter(
          (u) => u.role === ROLES.TEACHER || u.role === ROLES.PRINCIPAL,
        ).length,
        total: users.length,
      });
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, tenantId, isStaff]);

  if (!firebaseReady || !isStaff || !counts) return null;

  const cards = [
    { label: "Öğrenci", value: counts.students, icon: GraduationCap },
    { label: "Veli", value: counts.parents, icon: Users },
    { label: "Öğretmen / Müdür", value: counts.teachers, icon: BookOpen },
    { label: "Toplam Kullanıcı", value: counts.total, icon: UsersRound },
  ];

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <UsersRound size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Okul Özeti (canlı)</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-navy/50 text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
              <p className="mt-3 text-2xl font-bold tracking-tight text-content">
                {card.value}
              </p>
              <p className="text-xs text-muted">{card.label}</p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
