"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Star, Send, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listMyCodes } from "@/lib/services/access-codes";
import { addGrade, getStudentGrades, type GradeEntry } from "@/lib/services/grades";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

interface Student {
  uid: string;
  name: string;
}

/**
 * Not/Karne panosu.
 * Öğretmen öğrenciye not girer; öğrenci kendi notlarını, veli bağlı öğrencisinin
 * notlarını görür. Yalnızca giriş yapmış kullanıcı + Firebase aktifken görünür.
 */
export function GradeBoard() {
  const { user, profile, firebaseReady } = useAuth();
  const myUid = user?.uid;
  const tenantId = profile?.tenantId;
  const isTeacher = profile?.role === ROLES.TEACHER;
  const isStudent = profile?.role === ROLES.STUDENT;
  const isParent = profile?.role === ROLES.PARENT;

  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [grades, setGrades] = useState<GradeEntry[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // İzlenecek öğrenci uid'i: öğrenci=kendisi, veli=bağlı öğrenci, öğretmen=seçili.
  const viewedStudentUid = isStudent
    ? myUid
    : isParent
      ? profile?.linkedStudentIds?.[0]
      : selected;

  useEffect(() => {
    if (!firebaseReady || !profile || !tenantId) return;
    if (!isTeacher || !myUid) return;
    let active = true;
    void (async () => {
      const codes = await listMyCodes(tenantId, myUid);
      const list = codes
        .filter((c) => c.role === ROLES.STUDENT)
        .map((c) => ({ uid: c.uid, name: c.displayName }));
      if (active) {
        setStudents(list);
        setSelected(list[0]?.uid ?? "");
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, profile, tenantId, isTeacher, myUid]);

  const loadGrades = useCallback(async () => {
    if (!viewedStudentUid) {
      setGrades([]);
      return;
    }
    setGrades(await getStudentGrades(viewedStudentUid));
  }, [viewedStudentUid]);

  useEffect(() => {
    if (firebaseReady && profile) void loadGrades();
  }, [firebaseReady, profile, loadGrades]);

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !selected || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const subject = String(data.get("subject") ?? "").trim();
    const score = String(data.get("score") ?? "").trim();
    const note = String(data.get("note") ?? "").trim();
    if (!subject || !score) return;

    setBusy(true);
    setError(null);
    try {
      await addGrade({
        tenantId,
        studentUid: selected,
        subject,
        score,
        note,
        byName: profile?.displayName ?? "Öğretmen",
      });
      form.reset();
      await loadGrades();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!firebaseReady || !profile || grades === null) return null;
  if (!isTeacher && !isStudent && !isParent) return null;

  return (
    <div className="flex flex-col gap-6">
      {isTeacher && (
        <GlassCard tone="navy">
          <div className="mb-4 flex items-center gap-2">
            <Star size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">Not Gir</h2>
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-muted">Önce öğrenci kodu üretin.</p>
          ) : (
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Öğrenci</label>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  {students.map((s) => (
                    <option key={s.uid} value={s.uid} className="bg-surface">{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField label="Ders" name="subject" placeholder="Matematik" required />
                <TextField label="Not" name="score" placeholder="85 / AA" required />
              </div>
              <TextField label="Açıklama (opsiyonel)" name="note" placeholder="Yorum" />
              {error && (
                <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
                  <AlertCircle size={16} aria-hidden="true" />
                  {error}
                </p>
              )}
              <PrimaryButton type="submit" size="md" disabled={busy}>
                <Send size={16} aria-hidden="true" />
                {busy ? "Kaydediliyor…" : "Notu Kaydet"}
              </PrimaryButton>
            </form>
          )}
        </GlassCard>
      )}

      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Star size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">
            {isTeacher ? "Öğrenci Notları" : "Notlarım"}
          </h2>
        </div>
        {grades.length === 0 ? (
          <p className="text-sm text-muted">Henüz not yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 pr-4 font-medium">Ders</th>
                  <th className="pb-2 pr-4 font-medium">Not</th>
                  <th className="pb-2 pr-4 font-medium">Açıklama</th>
                  <th className="pb-2 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {grades.map((g, i) => (
                  <tr key={`${g.subject}-${i}`} className="text-content">
                    <td className="py-2.5 pr-4">{g.subject}</td>
                    <td className="py-2.5 pr-4 font-semibold text-accent">{g.score}</td>
                    <td className="py-2.5 pr-4 text-muted">{g.note || "—"}</td>
                    <td className="py-2.5 text-muted">{g.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
