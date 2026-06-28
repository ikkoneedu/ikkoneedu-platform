"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { SelectField } from "@/components/shared/SelectField";
import { useAuth } from "@/components/auth/AuthProvider";
import { listStudents } from "@/lib/services/students";
import { listClasses } from "@/lib/services/classes";
import { subjects } from "@/lib/report-card-mock-data";

/**
 * Öğrenci Seçimi — GERÇEK Firestore (öğrenci/sınıf). Dersler statik config.
 * Yetkili personel kendi okulunun öğrenci ve sınıflarını seçer.
 */
export function StudentSelector() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;

  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [classNames, setClassNames] = useState<string[]>([]);

  useEffect(() => {
    if (!firebaseReady || !tenantId) return;
    let active = true;
    void (async () => {
      try {
        const [st, cl] = await Promise.all([listStudents(tenantId), listClasses(tenantId)]);
        if (!active) return;
        setStudentNames(st.map((s) => s.fullName).filter(Boolean));
        setClassNames(cl.map((c) => c.name).filter(Boolean));
      } catch {
        if (active) {
          setStudentNames([]);
          setClassNames([]);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, tenantId]);

  const students = studentNames.length ? studentNames : ["— Öğrenci yok —"];
  const classes = classNames.length ? classNames : ["— Sınıf yok —"];

  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <GraduationCap size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Öğrenci Seçimi</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="Öğrenci" items={students} className="sm:col-span-2" />
        <SelectField label="Sınıf" items={classes} />
        <SelectField label="Ders" items={subjects.map((s) => s.name)} />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Karne yorumu, seçilen öğrencinin sınıf ve ders performansına göre
        kişiselleştirilir.
      </p>
    </GlassCard>
  );
}
