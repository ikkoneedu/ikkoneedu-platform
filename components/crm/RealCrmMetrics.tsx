"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Sparkle,
  CalendarClock,
  CalendarCheck,
  Trophy,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listLeads, type LeadRecord } from "@/lib/services/leads";
import { listAppointments, type AppointmentRecord } from "@/lib/services/appointments";

const CRM_ROLES: string[] = [
  ROLES.SUPER_ADMIN,
  ROLES.FOUNDER,
  ROLES.SCHOOL_ADMIN,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.SALES,
  ROLES.PR,
  ROLES.SUPPORT,
];

interface Metric {
  id: string;
  label: string;
  value: number;
  icon: LucideIcon;
}

/**
 * CRM Genel Metrikleri — GERÇEK Firestore (leads + appointments). Tenant izole.
 * Mock `CrmMetrics` yerine kullanılır; sayımlar canlı veriden hesaplanır.
 */
export function RealCrmMetrics() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canView = profile != null && CRM_ROLES.includes(profile.role);
  const usable = firebaseReady && Boolean(tenantId) && canView;

  const [leads, setLeads] = useState<LeadRecord[] | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRecord[] | null>(null);

  const load = useCallback(async () => {
    if (!tenantId) return;
    try {
      const [l, a] = await Promise.all([
        listLeads(tenantId),
        listAppointments(tenantId),
      ]);
      setLeads(l);
      setAppointments(a);
    } catch {
      setLeads([]);
      setAppointments([]);
    }
  }, [tenantId]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  if (!usable) return null;

  const ready = leads !== null && appointments !== null;
  const leadRows = leads ?? [];
  const apptRows = appointments ?? [];

  const metrics: Metric[] = [
    { id: "toplam", label: "Toplam Lead", value: leadRows.length, icon: Users },
    {
      id: "yeni",
      label: "Yeni Lead",
      value: leadRows.filter((l) => l.status === "new").length,
      icon: Sparkle,
    },
    {
      id: "randevu",
      label: "Toplam Randevu",
      value: apptRows.length,
      icon: CalendarClock,
    },
    {
      id: "planli",
      label: "Planlı Randevu",
      value: apptRows.filter((a) => a.status === "SCHEDULED").length,
      icon: CalendarCheck,
    },
    {
      id: "kazanilan",
      label: "Kazanılan",
      value: leadRows.filter((l) => l.status === "won").length,
      icon: Trophy,
    },
    {
      id: "kaybedilen",
      label: "Kaybedilen",
      value: leadRows.filter((l) => l.status === "lost").length,
      icon: XCircle,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <GlassCard key={metric.id} tone="navy" interactive className="p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-overlay/10 bg-navy/40 text-accent">
              <Icon size={18} aria-hidden="true" />
            </span>
            <p className="mt-3 text-2xl font-bold tracking-tight text-content">
              {ready ? metric.value : "—"}
            </p>
            <p className="mt-0.5 text-xs text-muted">{metric.label}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}
