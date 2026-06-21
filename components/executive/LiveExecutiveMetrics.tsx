"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Users,
  BookOpen,
  Contact,
  CalendarClock,
  Award,
  Wallet,
  TrendingDown,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listTenantUsers } from "@/lib/services/users";
import { listLeads } from "@/lib/services/leads";
import { listAppointments } from "@/lib/services/appointments";
import { listPayments, summarizePayments } from "@/lib/services/payments";
import { listScholarshipApplications } from "@/lib/services/scholarship-applications";

const MGMT_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.SUPER_ADMIN,
];

interface Metrics {
  students: number;
  teachers: number;
  parents: number;
  leads: number;
  appointments: number;
  scholarship: number;
  collected: number;
  outstanding: number;
}

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) + " ₺";

/**
 * Canlı yönetim metrikleri — giriş yapan kullanıcının okulundan (tenant) GERÇEK
 * sayılar toplar: öğrenci/öğretmen/veli, lead, randevu, bursluluk başvurusu,
 * tahsilat ve bakiye. Mevcut servislerden hesaplanır; tenant izole.
 */
export function LiveExecutiveMetrics() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canSee = profile != null && MGMT_ROLES.includes(profile.role);
  const usable =
    firebaseReady &&
    Boolean(tenantId) &&
    tenantId !== "platform" &&
    tenantId !== "public" &&
    canSee;

  const [m, setM] = useState<Metrics | null>(null);

  useEffect(() => {
    if (!usable || !tenantId) return;
    let active = true;
    void (async () => {
      const [users, leads, appts, payments, scholarship] = await Promise.all([
        listTenantUsers(tenantId),
        listLeads(tenantId),
        listAppointments(tenantId),
        listPayments(tenantId),
        listScholarshipApplications(tenantId),
      ]);
      if (!active) return;
      const pay = summarizePayments(payments);
      setM({
        students: users.filter((u) => u.role === ROLES.STUDENT).length,
        teachers: users.filter((u) => u.role === ROLES.TEACHER).length,
        parents: users.filter((u) => u.role === ROLES.PARENT).length,
        leads: leads.length,
        appointments: appts.length,
        scholarship: scholarship.length,
        collected: pay.collected,
        outstanding: pay.outstanding,
      });
    })();
    return () => {
      active = false;
    };
  }, [usable, tenantId]);

  if (!usable || !m) return null;

  const items = [
    { icon: GraduationCap, label: "Öğrenci", value: String(m.students) },
    { icon: BookOpen, label: "Öğretmen", value: String(m.teachers) },
    { icon: Users, label: "Veli", value: String(m.parents) },
    { icon: Contact, label: "Lead", value: String(m.leads) },
    { icon: CalendarClock, label: "Randevu", value: String(m.appointments) },
    { icon: Award, label: "Bursluluk Başvurusu", value: String(m.scholarship) },
    { icon: Wallet, label: "Tahsilat", value: fmtMoney(m.collected), tone: "emerald" },
    { icon: TrendingDown, label: "Bakiye", value: fmtMoney(m.outstanding), tone: "brand" },
  ];

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <TrendingDown size={18} className="rotate-180 text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Canlı Okul Metrikleri</h2>
        <span className="ml-auto text-xs text-muted">gerçek veri</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((it) => {
          const Icon = it.icon;
          const color =
            it.tone === "emerald" ? "text-emerald-300" : it.tone === "brand" ? "text-brand" : "text-content";
          return (
            <div key={it.label} className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <Icon size={14} className="text-accent" aria-hidden="true" />
                {it.label}
              </span>
              <span className={`text-xl font-bold ${color}`}>{it.value}</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
