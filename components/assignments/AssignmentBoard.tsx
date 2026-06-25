"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ClipboardList, Send, AlertCircle, CheckCircle2, CalendarClock, Check, Undo2, Users } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  createAssignment,
  listAssignments,
  type Assignment,
} from "@/lib/services/assignments";
import { listMyClasses, type ClassRecord } from "@/lib/services/access-codes";
import { createNotification, notifyClassMembers } from "@/lib/services/notifications";
import {
  markSubmitted,
  withdrawSubmission,
  listMySubmissions,
  listAllSubmissions,
} from "@/lib/services/submissions";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { useT } from "@/components/i18n/LocaleProvider";

const STAFF_ROLES = [
  ROLES.TEACHER,
  ROLES.COORDINATOR,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.SUPER_ADMIN,
] as const;

/**
 * Ödev panosu — personel ödev verir; öğrenci/veli kendi sınıfının ödevlerini görür.
 * Yalnızca giriş yapmış kullanıcı + Firebase aktifken görünür.
 */
export function AssignmentBoard({ readOnly = false }: { readOnly?: boolean }) {
  const t = useT();
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const isStaff =
    profile != null && (STAFF_ROLES as readonly string[]).includes(profile.role);
  const isTeacher = profile?.role === ROLES.TEACHER;
  const isStudent = profile?.role === ROLES.STUDENT;
  // Veli/öğrenci paneli (readOnly): ödev verme formu hiç gösterilmez.
  const canCompose = !readOnly && isStaff;

  const [items, setItems] = useState<Assignment[] | null>(null);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    try {
      setItems(await listAssignments(tenantId));
      if (isTeacher && user) {
        setClasses(await listMyClasses(tenantId, user.uid));
      }
      // Öğrenci: kendi teslimleri. Personel: ödev başına teslim sayısı.
      if (isStudent && user) {
        const subs = await listMySubmissions(tenantId, user.uid);
        setSubmittedIds(
          new Set(subs.filter((s) => s.status === "submitted").map((s) => s.assignmentId)),
        );
      } else if (isStaff) {
        const subs = await listAllSubmissions(tenantId);
        const map: Record<string, number> = {};
        for (const s of subs) {
          if (s.status === "submitted") map[s.assignmentId] = (map[s.assignmentId] ?? 0) + 1;
        }
        setCounts(map);
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId, isTeacher, isStudent, isStaff, user]);

  const toggleSubmission = async (assignmentId: string) => {
    if (!tenantId || !user || togglingId) return;
    setTogglingId(assignmentId);
    setError(null);
    try {
      if (submittedIds.has(assignmentId)) {
        await withdrawSubmission(tenantId, assignmentId, user.uid);
        setSubmittedIds((prev) => {
          const next = new Set(prev);
          next.delete(assignmentId);
          return next;
        });
      } else {
        await markSubmitted(tenantId, assignmentId, user.uid, profile?.displayName ?? "Öğrenci");
        setSubmittedIds((prev) => new Set(prev).add(assignmentId));
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    if (firebaseReady && tenantId) void refresh();
  }, [firebaseReady, tenantId, refresh]);

  const handlePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !user || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const dueDate = String(data.get("dueDate") ?? "").trim();
    const classId = String(data.get("classId") ?? "").trim() || undefined;
    const className = classes.find((c) => c.id === classId)?.name;
    if (!title || !description) return;

    setBusy(true);
    setError(null);
    setPosted(false);
    try {
      await createAssignment({
        tenantId,
        authorUid: user.uid,
        authorName: profile?.displayName ?? "Öğretmen",
        title,
        description,
        dueDate,
        classId,
        className,
      });
      // Bildirim merkezine düşür (best-effort).
      try {
        await createNotification(tenantId, {
          title: `Yeni ödev: ${title}`,
          body: dueDate ? `${description}\nSon tarih: ${dueDate}` : description,
          audience: className ? `${className}` : "Tüm okul",
          createdBy: user.uid,
          createdByName: profile?.displayName ?? "Öğretmen",
        });
        // Sınıf hedefliyse o sınıfın öğrenci+velisine kişiye özel bildirim.
        if (classId) {
          await notifyClassMembers(tenantId, classId, {
            title: `Yeni ödev: ${title}`,
            body: dueDate ? `Son tarih: ${dueDate}` : description,
            type: "announcement",
            link: "/notifications",
          });
        }
      } catch {
        /* bildirim best-effort */
      }
      form.reset();
      setPosted(true);
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!firebaseReady || !profile || !tenantId || items === null) return null;

  // Öğrenci/veli yalnızca kendi sınıfının (veya okul geneli) ödevlerini görür.
  const myClassId = profile.classId;
  const visible = isStaff
    ? items
    : items.filter((a) => !a.classId || a.classId === myClassId);

  return (
    <div className="flex flex-col gap-6">
      {canCompose && (
        <GlassCard tone="navy">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">{t("boardA.asg.compose.heading")}</h2>
          </div>
          <form onSubmit={handlePost} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField label={t("boardA.asg.title.label")} name="title" placeholder={t("boardA.asg.title.placeholder")} required />
              <TextField label={t("boardA.asg.dueDate.label")} name="dueDate" type="date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="asg-desc" className="text-sm font-medium text-muted">
                {t("boardA.asg.description.label")}
              </label>
              <textarea
                id="asg-desc"
                name="description"
                rows={3}
                required
                placeholder={t("boardA.asg.description.placeholder")}
                className="w-full rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            {isTeacher && classes.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">{t("boardA.asg.class.label")}</label>
                <select
                  name="classId"
                  defaultValue=""
                  className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  <option value="" className="bg-surface">{t("boardA.asg.class.allSchool")}</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface">{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            {error && (
              <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
                <AlertCircle size={16} aria-hidden="true" />
                {error}
              </p>
            )}
            {posted && (
              <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle2 size={16} aria-hidden="true" />
                {t("boardA.asg.posted")}
              </p>
            )}
            <PrimaryButton type="submit" size="md" disabled={busy}>
              <Send size={16} aria-hidden="true" />
              {busy ? t("boardA.asg.submit.busy") : t("boardA.asg.submit.idle")}
            </PrimaryButton>
          </form>
        </GlassCard>
      )}

      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("boardA.asg.list.heading")}</h2>
        </div>
        {visible.length === 0 ? (
          <p className="text-sm text-muted">{t("boardA.asg.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((a) => (
              <li key={a.id} className="rounded-xl border border-overlay/10 bg-overlay/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-content">{a.title}</h3>
                  {a.dueDate && (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-amber-400">
                      <CalendarClock size={13} aria-hidden="true" />
                      {a.dueDate}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{a.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="text-xs text-muted/70">
                    {a.className ? `${a.className} · ` : `${t("boardA.asg.scope.allSchool")} · `}
                    {a.authorName}
                  </p>
                  {/* Personel: kaç öğrenci teslim etti */}
                  {isStaff && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-overlay/10 bg-overlay/5 px-2 py-0.5 text-[11px] font-medium text-muted">
                      <Users size={12} aria-hidden="true" />
                      {t("boardA.asg.submissions.count", { count: counts[a.id] ?? 0 })}
                    </span>
                  )}
                  {/* Öğrenci: teslim et / geri al */}
                  {isStudent && submittedIds.has(a.id) && (
                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                      <Check size={13} aria-hidden="true" /> {t("boardA.asg.submitted")}
                    </span>
                  )}
                  {isStudent && submittedIds.has(a.id) && (
                    <button
                      type="button"
                      onClick={() => void toggleSubmission(a.id)}
                      disabled={togglingId === a.id}
                      className="inline-flex items-center gap-1 text-[11px] text-muted transition hover:text-content disabled:opacity-50"
                      aria-label={t("boardA.asg.withdraw.aria")}
                    >
                      <Undo2 size={12} aria-hidden="true" /> {t("boardA.asg.withdraw")}
                    </button>
                  )}
                  {isStudent && !submittedIds.has(a.id) && (
                    <button
                      type="button"
                      onClick={() => void toggleSubmission(a.id)}
                      disabled={togglingId === a.id}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition hover:bg-accent/20 disabled:opacity-50"
                    >
                      <Send size={14} aria-hidden="true" /> {t("boardA.asg.submit")}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
