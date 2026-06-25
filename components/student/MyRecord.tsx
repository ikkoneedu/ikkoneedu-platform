"use client";

import { useCallback, useEffect, useState } from "react";
import { GraduationCap, RefreshCw, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { getStudent, type StudentRecord } from "@/lib/services/students";
import { getClass } from "@/lib/services/classes";

/**
 * Öğrenci Merkezi — öğrencinin kendi kaydı (gerçek Firestore).
 * Kapsam profilden: `profile.linkedStudentId`. Kurallar yalnız kendi kaydına izin verir.
 */
export function MyRecord() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const isStudent = profile?.role === ROLES.STUDENT;
  const studentId = profile?.linkedStudentId ?? "";
  const usable = firebaseReady && Boolean(tenantId) && isStudent && Boolean(studentId);

  const [record, setRecord] = useState<StudentRecord | null>(null);
  const [className, setClassName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tenantId || !studentId) return;
    setRefreshing(true);
    setError(null);
    try {
      const r = await getStudent(tenantId, studentId);
      setRecord(r);
      if (r?.classId) setClassName((await getClass(tenantId, r.classId))?.name ?? "");
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt yüklenemedi.");
    } finally {
      setRefreshing(false);
    }
  }, [tenantId, studentId]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  if (!usable) return null;

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <GraduationCap size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Öğrenci Kaydım</h2>
        <button
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          className="ml-auto text-muted transition hover:text-content disabled:opacity-50"
          aria-label="Yenile"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <p className="mb-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </p>
      )}

      {!loaded ? (
        <p className="text-sm text-muted">Yükleniyor…</p>
      ) : !record ? (
        <p className="text-sm text-muted">Kayıt bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Ad Soyad" value={record.fullName} />
          <Field label="Öğrenci No" value={record.studentNo || "—"} />
          <Field label="Kademe" value={record.grade ? `${record.grade}. sınıf` : "—"} />
          <Field label="Sınıf" value={record.classId ? className || "—" : "Atanmadı"} />
        </div>
      )}
    </GlassCard>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-overlay/10 bg-overlay/[0.02] px-3 py-2.5">
      <span className="block text-xs text-muted">{label}</span>
      <span className="mt-0.5 block truncate font-medium text-content">{value}</span>
    </div>
  );
}
