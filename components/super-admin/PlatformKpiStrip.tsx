"use client";

import { useEffect, useState } from "react";
import { School, Users, GraduationCap, BookOpen, Database, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { useHasRole } from "@/components/auth/RoleGate";
import { ROLES } from "@/lib/auth/role-constants";
import { listSchools } from "@/lib/services/schools";
import { listAllUsers } from "@/lib/services/users";
import { listAllCrm } from "@/lib/services/crm-global";

interface Kpi {
  schools: number;
  users: number;
  students: number;
  teachers: number;
  crm: number;
  converted: number;
}

/**
 * Platform KPI Özeti (SUPER_ADMIN) — tüm okullardan GERÇEK toplam sayılar.
 * Mevcut servislerden (schools, allUsers, global CRM) hesaplanır.
 */
export function PlatformKpiStrip() {
  const { firebaseReady } = useAuth();
  const isSuper = useHasRole([ROLES.SUPER_ADMIN]);
  const usable = firebaseReady && isSuper;

  const [k, setK] = useState<Kpi | null>(null);

  useEffect(() => {
    if (!usable) return;
    let active = true;
    void (async () => {
      const [schools, users, crm] = await Promise.all([
        listSchools(),
        listAllUsers(),
        listAllCrm(),
      ]);
      if (!active) return;
      setK({
        schools: schools.length,
        users: users.length,
        students: users.filter((u) => u.role === ROLES.STUDENT).length,
        teachers: users.filter((u) => u.role === ROLES.TEACHER).length,
        crm: crm.length,
        converted: crm.filter((c) => c.status === "converted").length,
      });
    })();
    return () => {
      active = false;
    };
  }, [usable]);

  if (!usable || !k) return null;

  const items = [
    { icon: School, label: "Okul", value: k.schools },
    { icon: Users, label: "Toplam Kullanıcı", value: k.users },
    { icon: GraduationCap, label: "Öğrenci", value: k.students },
    { icon: BookOpen, label: "Öğretmen", value: k.teachers },
    { icon: Database, label: "CRM Kaydı", value: k.crm },
    { icon: CheckCircle2, label: "Kayda Dönüşen", value: k.converted, tone: "emerald" },
  ];

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <Database size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Platform Özeti (canlı)</h2>
        <span className="ml-auto text-xs text-muted">tüm okullar · gerçek veri</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.label} className="flex flex-col gap-1.5 rounded-xl border border-overlay/10 bg-overlay/[0.03] p-4">
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <Icon size={14} className="text-accent" aria-hidden="true" />
                {it.label}
              </span>
              <span className={`text-2xl font-bold ${it.tone === "emerald" ? "text-emerald-300" : "text-content"}`}>
                {it.value}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
