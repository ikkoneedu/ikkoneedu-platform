"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { NotebookPen, Send, AlertCircle, CheckCircle2, BookOpen, Trash2, Pencil, X } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  createLessonPlan,
  updateLessonPlan,
  deleteLessonPlan,
  listLessonPlans,
  type LessonPlanRecord,
} from "@/lib/services/lesson-plans";
import { listMyClasses, type ClassRecord } from "@/lib/services/access-codes";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { useT } from "@/components/i18n/LocaleProvider";

const STAFF_ROLES: string[] = [
  ROLES.TEACHER, ROLES.COORDINATOR, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
  ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.SUPER_ADMIN,
];

/**
 * Ders planları — GERÇEK Firestore. Öğretmen sınıf hedefli plan paylaşır;
 * öğrenci/veli kendi sınıfının (veya okul geneli) planlarını görür. Tenant izole.
 */
export function LessonPlansBoard({ readOnly = false }: { readOnly?: boolean }) {
  const t = useT();
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const isStaff = profile != null && STAFF_ROLES.includes(profile.role);
  const isTeacher = profile?.role === ROLES.TEACHER;
  const canCreate = !readOnly && isStaff;

  const [items, setItems] = useState<LessonPlanRecord[] | null>(null);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    try {
      setItems(await listLessonPlans(tenantId));
      if (canCreate && isTeacher && user) {
        setClasses(await listMyClasses(tenantId, user.uid));
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId, canCreate, isTeacher, user]);

  useEffect(() => {
    if (firebaseReady && tenantId) void refresh();
  }, [firebaseReady, tenantId, refresh]);

  const editing = editId ? items?.find((x) => x.id === editId) ?? null : null;
  const startEdit = (p: LessonPlanRecord) => {
    setEditId(p.id);
    setError(null);
    setSaved(false);
  };
  const cancelEdit = () => setEditId(null);

  const handleDelete = async (id: string) => {
    if (!tenantId) return;
    if (editId === id) setEditId(null);
    try {
      await deleteLessonPlan(tenantId, id);
      setItems((prev) => prev?.filter((x) => x.id !== id) ?? prev);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenantId || !user || busy) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const subject = String(data.get("subject") ?? "").trim();
    const week = String(data.get("week") ?? "").trim();
    const content = String(data.get("content") ?? "").trim();
    const classId = String(data.get("classId") ?? "").trim() || undefined;
    const className = classes.find((c) => c.id === classId)?.name;
    if (!title || !content) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      if (editId) {
        await updateLessonPlan(tenantId, editId, { title, subject, week, content, classId, className });
        setEditId(null);
      } else {
        await createLessonPlan({
          tenantId, authorUid: user.uid, authorName: profile?.displayName ?? "Öğretmen",
          title, subject, week, content, classId, className,
        });
        form.reset();
      }
      setSaved(true);
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!firebaseReady || !profile || !tenantId || items === null) {
    return (
      <GlassCard tone="navy">
        <p className="py-8 text-center text-sm text-muted">{t("schoolLife.loading")}</p>
      </GlassCard>
    );
  }

  // Öğrenci/veli yalnızca kendi sınıfının veya okul geneli planları görür.
  const myClassId = profile.classId;
  const visible = isStaff
    ? items
    : items.filter((p) => !p.classId || p.classId === myClassId);

  return (
    <div className="flex flex-col gap-6">
      {canCreate && (
        <GlassCard tone="navy">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <NotebookPen size={18} className="text-accent" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-content">
                {editId ? t("schoolLife.lessonPlans.form.editTitle") : t("schoolLife.lessonPlans.form.addTitle")}
              </h2>
            </div>
            {editId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-content"
              >
                <X size={14} aria-hidden="true" />{t("schoolLife.cancel")}
              </button>
            )}
          </div>
          <form key={editId ?? "new"} onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <TextField label={t("schoolLife.lessonPlans.form.titleLabel")} name="title" placeholder={t("schoolLife.lessonPlans.form.titlePlaceholder")} defaultValue={editing?.title} required />
              <TextField label={t("schoolLife.lessonPlans.form.subjectLabel")} name="subject" placeholder={t("schoolLife.lessonPlans.form.subjectPlaceholder")} defaultValue={editing?.subject} />
              <TextField label={t("schoolLife.lessonPlans.form.weekLabel")} name="week" placeholder={t("schoolLife.lessonPlans.form.weekPlaceholder")} defaultValue={editing?.week} />
            </div>
            {isTeacher && classes.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">{t("schoolLife.lessonPlans.form.targetClassLabel")}</label>
                <select
                  name="classId" defaultValue={editing?.classId ?? ""}
                  className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  <option value="" className="bg-surface">{t("schoolLife.lessonPlans.form.schoolWide")}</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface">{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lp-content" className="text-sm font-medium text-muted">{t("schoolLife.lessonPlans.form.contentLabel")}</label>
              <textarea
                id="lp-content" name="content" rows={4} required
                defaultValue={editing?.content}
                placeholder={t("schoolLife.lessonPlans.form.contentPlaceholder")}
                className="w-full rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            {error && (
              <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
                <AlertCircle size={16} aria-hidden="true" />{error}
              </p>
            )}
            {saved && (
              <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle2 size={16} aria-hidden="true" />{editId ? t("schoolLife.lessonPlans.savedEdit") : t("schoolLife.lessonPlans.savedAdd")}
              </p>
            )}
            <PrimaryButton type="submit" size="md" disabled={busy}>
              <Send size={16} aria-hidden="true" />
              {busy ? t("schoolLife.saving") : editId ? t("schoolLife.update") : t("schoolLife.lessonPlans.share")}
            </PrimaryButton>
          </form>
        </GlassCard>
      )}

      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <NotebookPen size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("schoolLife.lessonPlans.list.title")}</h2>
        </div>
        {visible.length === 0 ? (
          <p className="text-sm text-muted">{t("schoolLife.lessonPlans.list.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((p) => (
              <li key={p.id} className="rounded-xl border border-overlay/10 bg-overlay/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-content">{p.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {p.subject && (
                      <span className="flex items-center gap-1 text-muted">
                        <BookOpen size={12} aria-hidden="true" />{p.subject}
                      </span>
                    )}
                    {p.week && <span className="text-muted">· {p.week}</span>}
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 font-medium text-accent">
                      {p.className || t("schoolLife.lessonPlans.schoolWideBadge")}
                    </span>
                    {canCreate && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          aria-label={t("schoolLife.lessonPlans.editAria")}
                          className="text-muted transition-colors hover:text-accent"
                        >
                          <Pencil size={13} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          aria-label={t("schoolLife.lessonPlans.deleteAria")}
                          className="text-muted transition-colors hover:text-brand"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{p.content}</p>
                {p.authorName && <p className="mt-2 text-xs text-muted/70">— {p.authorName}</p>}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
