"use client";

import { useState, type FormEvent } from "react";
import { Megaphone, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES, ROLE_LABELS } from "@/lib/auth/role-constants";
import { listTenantUsers } from "@/lib/services/users";
import { createAnnouncement, type AnnouncementStatus } from "@/lib/services/announcements";
import { createUserNotification } from "@/lib/services/notifications";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const STAFF_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.TEACHER,
  ROLES.SUPER_ADMIN,
];

/** Duyuru hedeflenebilecek roller. */
const TARGET_ROLE_OPTIONS = [
  ROLES.PARENT,
  ROLES.STUDENT,
  ROLES.TEACHER,
  ROLES.COORDINATOR,
  ROLES.VICE_PRINCIPAL,
  ROLES.PRINCIPAL,
  ROLES.SCHOOL_ADMIN,
];

/**
 * Duyuru Oluşturucu — `tenants/{tenantId}/announcements` (yalnızca personel).
 * targetRoles + opsiyonel targetClassIds. "published" seçilirse hedef rollerdeki
 * kullanıcılara uygulama içi bildirim (FCM yok) oluşturulur.
 */
export function AnnouncementComposer({ onCreated }: { onCreated?: () => void }) {
  const { user, profile, firebaseReady } = useAuth();
  const uid = user?.uid ?? "";
  const tenantId = profile?.tenantId;
  const isStaff = profile != null && STAFF_ROLES.includes(profile.role);

  const [targetRoles, setTargetRoles] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<AnnouncementStatus>("published");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!firebaseReady || !tenantId || !isStaff) return null;

  const toggleRole = (role: string) =>
    setTargetRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile || busy) return;
    const form = event.currentTarget;
    const fd = new FormData(form);
    const title = String(fd.get("title") ?? "").trim();
    const body = String(fd.get("body") ?? "").trim();
    const classIdsRaw = String(fd.get("classIds") ?? "").trim();
    if (!title || !body) {
      setError("Başlık ve içerik zorunludur.");
      return;
    }
    const roles = Array.from(targetRoles);
    const classIds = classIdsRaw
      ? classIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await createAnnouncement({
        tenantId,
        schoolId: profile.schoolId ?? tenantId,
        authorUid: uid,
        authorName: profile.displayName || "Yönetim",
        title,
        body,
        targetRoles: roles,
        targetClassIds: classIds,
        status,
      });

      // Yayınlandıysa hedef rollerdeki kullanıcılara bildirim oluştur (fan-out).
      let delivered = 0;
      if (status === "published") {
        const users = await listTenantUsers(tenantId);
        const targets = users.filter(
          (u) =>
            u.status === "ACTIVE" &&
            u.uid !== uid &&
            (roles.length === 0 || roles.includes(u.role)) &&
            // Sınıf hedefi verildiyse yalnız o sınıftaki kullanıcılar.
            (classIds.length === 0 || (u.classId && classIds.includes(u.classId))),
        );
        await Promise.all(
          targets.map((u) =>
            createUserNotification(tenantId, {
              userId: u.uid,
              schoolId: profile.schoolId ?? tenantId,
              title: `Duyuru: ${title}`,
              body,
              type: "announcement",
              link: "/notifications",
            }),
          ),
        );
        delivered = targets.length;
      }

      form.reset();
      setTargetRoles(new Set());
      setNotice(
        status === "published"
          ? `Duyuru yayınlandı · ${delivered} kullanıcıya bildirim gönderildi.`
          : "Duyuru taslak olarak kaydedildi.",
      );
      onCreated?.();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <Megaphone size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Duyuru Oluştur</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField label="Başlık" name="title" placeholder="Duyuru başlığı" required />
        <label className="flex flex-col gap-1.5 text-sm font-medium text-muted">
          İçerik
          <textarea
            name="body"
            rows={3}
            required
            placeholder="Duyuru metni…"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-content outline-none focus:border-accent"
          />
        </label>

        <div>
          <span className="mb-2 block text-sm font-medium text-muted">
            Hedef Roller (boş = herkes)
          </span>
          <div className="flex flex-wrap gap-2">
            {TARGET_ROLE_OPTIONS.map((role) => {
              const on = targetRoles.has(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                    on
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-white/10 text-muted hover:text-content"
                  }`}
                >
                  {ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end">
          <TextField
            label="Hedef Sınıf ID (opsiyonel, virgülle)"
            name="classIds"
            placeholder="1-A, 1-B"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted">Durum</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AnnouncementStatus)}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-content outline-none focus:border-accent"
            >
              <option value="published" className="bg-surface">Yayınla</option>
              <option value="draft" className="bg-surface">Taslak</option>
            </select>
          </div>
        </div>

        {notice && (
          <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-300">
            <CheckCircle2 size={16} aria-hidden="true" /> {notice}
          </p>
        )}
        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
            <AlertCircle size={16} aria-hidden="true" /> {error}
          </p>
        )}

        <PrimaryButton type="submit" size="md" disabled={busy} className="self-start">
          <Send size={16} aria-hidden="true" />
          {busy ? "Kaydediliyor…" : status === "published" ? "Yayınla" : "Taslağı Kaydet"}
        </PrimaryButton>
      </form>
    </GlassCard>
  );
}
