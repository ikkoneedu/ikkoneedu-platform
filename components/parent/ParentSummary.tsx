"use client";

import { useEffect, useState } from "react";
import { Star, CalendarCheck, ClipboardList, CalendarX } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { getStudentGrades } from "@/lib/services/grades";
import { getAttendance } from "@/lib/services/attendance";
import { listAssignments } from "@/lib/services/assignments";

/**
 * Veli özeti — bağlı öğrencinin gerçek not/yoklama/ödev sayıları (Firestore).
 * Yalnızca giriş yapmış veli + Firebase aktifken görünür.
 */
export function ParentSummary() {
  const { profile, firebaseReady } = useAuth();
  const childUid = profile?.linkedStudentIds?.[0];
  const tenantId = profile?.tenantId;

  const [stats, setStats] = useState<{
    grades: number;
    present: number;
    absent: number;
    assignments: number;
  } | null>(null);

  useEffect(() => {
    if (!firebaseReady || profile?.role !== ROLES.PARENT || !childUid || !tenantId) return;
    let active = true;
    void (async () => {
      const [grades, attendance, assignments] = await Promise.all([
        getStudentGrades(childUid),
        getAttendance(childUid),
        listAssignments(tenantId),
      ]);
      if (!active) return;
      const myClassId = profile.classId;
      setStats({
        grades: grades.length,
        present: attendance.filter((a) => a.status === "present").length,
        absent: attendance.filter((a) => a.status === "absent").length,
        assignments: assignments.filter((a) => !a.classId || a.classId === myClassId).length,
      });
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, profile, childUid, tenantId]);

  if (!firebaseReady || profile?.role !== ROLES.PARENT || !stats) return null;

  const cards = [
    { label: "Not Sayısı", value: stats.grades, icon: Star },
    { label: "Gelen Gün", value: stats.present, icon: CalendarCheck },
    { label: "Gelmediği Gün", value: stats.absent, icon: CalendarX },
    { label: "Ödev", value: stats.assignments, icon: ClipboardList },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <GlassCard key={c.label} tone="navy" className="!p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-navy/50 text-accent">
              <Icon size={18} aria-hidden="true" />
            </span>
            <p className="mt-3 text-2xl font-bold tracking-tight text-content">{c.value}</p>
            <p className="text-xs text-muted">{c.label}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}
