"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CalendarClock,
  Send,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Check,
  Clock,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { getStudent, type StudentRecord } from "@/lib/services/students";
import { createUserNotification } from "@/lib/services/notifications";
import {
  createMeetingRequest,
  listMeetingRequests,
  listMyMeetingRequests,
  respondMeetingRequest,
  MEETING_STATUS_LABELS,
  type MeetingRequestRecord,
  type MeetingStatus,
} from "@/lib/services/meeting-requests";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const STAFF_ROLES: string[] = [
  ROLES.TEACHER, ROLES.COORDINATOR, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
  ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.SUPER_ADMIN,
];

function statusBadge(status: MeetingStatus): string {
  if (status === "approved") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  if (status === "declined") return "border-brand/30 bg-brand/10 text-brand";
  return "border-amber-400/30 bg-amber-400/10 text-amber-300";
}

/**
 * Veli ↔ öğretmen görüşme (randevu) talepleri — GERÇEK Firestore, rol uyumlu.
 *
 *  - VELİ: çocuğunu seçip tarih + not ile görüşme talebi oluşturur; kendi
 *    taleplerini ve durumlarını (Bekliyor/Onaylandı/Reddedildi) görür.
 *  - PERSONEL (öğretmen/yönetim): gelen talepleri görür, not ile onaylar/
 *    reddeder; yanıt velinin bildirimine düşer.
 *
 * Tenant izole. Yetki Firestore kurallarıyla zorlanır.
 */
export function MeetingRequests() {
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const isParent = profile?.role === ROLES.PARENT;
  const isStaff = profile != null && STAFF_ROLES.includes(profile.role);
  const childIds = useMemo(
    () => profile?.linkedStudentIds ?? [],
    [profile?.linkedStudentIds],
  );

  const [items, setItems] = useState<MeetingRequestRecord[] | null>(null);
  const [children, setChildren] = useState<StudentRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseNote, setResponseNote] = useState("");

  const refresh = useCallback(async () => {
    if (!tenantId || !user) return;
    try {
      const rows = isParent
        ? await listMyMeetingRequests(tenantId, user.uid)
        : await listMeetingRequests(tenantId);
      setItems(rows);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId, user, isParent]);

  useEffect(() => {
    if (firebaseReady && tenantId && user && (isParent || isStaff)) void refresh();
  }, [firebaseReady, tenantId, user, isParent, isStaff, refresh]);

  // Veli: bağlı çocuk adlarını yükle (talep formundaki seçim için).
  useEffect(() => {
    if (!firebaseReady || !tenantId || !isParent || childIds.length === 0) return;
    let cancelled = false;
    void (async () => {
      const records = (
        await Promise.all(childIds.map((id) => getStudent(tenantId, id)))
      ).filter((s): s is StudentRecord => s !== null);
      if (!cancelled) setChildren(records);
    })();
    return () => {
      cancelled = true;
    };
  }, [firebaseReady, tenantId, isParent, childIds]);

  if (!firebaseReady || !tenantId || !(isParent || isStaff)) return null;

  // ---- VELİ: talep oluşturma ----
  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || busy) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const studentName = String(data.get("studentName") ?? "").trim();
    const preferredDate = String(data.get("preferredDate") ?? "").trim();
    const note = String(data.get("note") ?? "").trim();
    if (!studentName) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await createMeetingRequest({
        tenantId,
        parentUid: user.uid,
        parentName: profile?.displayName ?? "Veli",
        studentName,
        preferredDate,
        note,
      });
      setSaved(true);
      form.reset();
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // ---- PERSONEL: yanıt (onayla/reddet) ----
  const respond = async (
    row: MeetingRequestRecord,
    status: Exclude<MeetingStatus, "requested">,
  ) => {
    if (busy) return;
    const note = responseNote.trim();
    setBusy(true);
    setError(null);
    try {
      await respondMeetingRequest(
        tenantId,
        row.id,
        status,
        note,
        profile?.displayName ?? "Okul",
      );
      // Veliye bildirim düşür (best-effort).
      try {
        await createUserNotification(tenantId, {
          userId: row.parentUid,
          title:
            status === "approved"
              ? "Görüşme talebiniz onaylandı"
              : "Görüşme talebiniz yanıtlandı",
          body:
            `${row.studentName} için görüşme talebiniz ` +
            `${MEETING_STATUS_LABELS[status].toLowerCase()}.` +
            (note ? ` Not: ${note}` : ""),
          type: "system",
          link: "/parent",
        });
      } catch {
        /* best-effort */
      }
      setRespondingId(null);
      setResponseNote("");
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-navy/50 text-accent">
          <CalendarClock size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-content">
            {isParent ? "Öğretmen Görüşmesi" : "Görüşme Talepleri"}
          </h2>
          <p className="text-xs text-muted">
            {isParent
              ? "Öğretmen/yönetimle görüşme talebi oluşturun ve durumunu takip edin."
              : "Velilerden gelen görüşme taleplerini yanıtlayın."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="ml-auto text-muted transition hover:text-content"
          aria-label="Yenile"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {error && (
        <p className="mb-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </p>
      )}

      {/* VELİ: talep formu */}
      {isParent && (
        <form onSubmit={handleCreate} className="mb-5 space-y-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="mr-student" className="text-sm font-medium text-muted">
              Öğrenci
            </label>
            {children.length > 0 ? (
              <select
                id="mr-student"
                name="studentName"
                required
                className="w-full rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.fullName}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            ) : (
              <TextField label="" name="studentName" placeholder="Öğrenci adı" required />
            )}
          </div>
          <TextField
            label="Tercih edilen tarih/saat"
            name="preferredDate"
            placeholder="Örn. 28 Haziran Cuma, 15:00"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="mr-note" className="text-sm font-medium text-muted">
              Görüşme konusu
            </label>
            <textarea
              id="mr-note"
              name="note"
              rows={2}
              placeholder="Görüşmek istediğiniz konu…"
              className="w-full rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          {saved && (
            <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-300">
              <CheckCircle2 size={16} aria-hidden="true" /> Görüşme talebiniz iletildi.
            </p>
          )}
          <PrimaryButton type="submit" size="md" disabled={busy}>
            <Send size={16} aria-hidden="true" />
            {busy ? "Gönderiliyor…" : "Görüşme Talebi Gönder"}
          </PrimaryButton>
        </form>
      )}

      {/* Liste */}
      {items === null ? (
        <p className="text-sm text-muted">Yükleniyor…</p>
      ) : items.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" />
          {isParent ? "Henüz görüşme talebiniz yok." : "Bekleyen görüşme talebi yok."}
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.02] px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-content">{row.studentName}</span>
                {!isParent && row.parentName && (
                  <span className="text-xs text-muted">· {row.parentName}</span>
                )}
                <span
                  className={`ml-auto inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusBadge(
                    row.status,
                  )}`}
                >
                  {row.status === "requested" ? (
                    <Clock size={11} aria-hidden="true" />
                  ) : row.status === "approved" ? (
                    <Check size={11} aria-hidden="true" />
                  ) : (
                    <XCircle size={11} aria-hidden="true" />
                  )}
                  {MEETING_STATUS_LABELS[row.status]}
                </span>
              </div>
              {row.preferredDate && (
                <p className="mt-1 text-xs text-muted">Tercih: {row.preferredDate}</p>
              )}
              {row.note && <p className="mt-1 text-sm text-muted">{row.note}</p>}
              {row.responseNote && (
                <p className="mt-2 rounded-lg border border-overlay/10 bg-overlay/[0.03] px-3 py-2 text-xs text-content">
                  <span className="text-muted">
                    {row.respondedByName || "Okul"} yanıtı:
                  </span>{" "}
                  {row.responseNote}
                </p>
              )}

              {/* PERSONEL: bekleyen talebe yanıt */}
              {!isParent && row.status === "requested" && (
                respondingId === row.id ? (
                  <div className="mt-3 space-y-2">
                    <input
                      value={responseNote}
                      onChange={(e) => setResponseNote(e.target.value)}
                      placeholder="Yanıt notu (opsiyonel) — örn. uygun saat"
                      className="w-full rounded-lg border border-overlay/10 bg-overlay/[0.04] px-3 py-2 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void respond(row, "approved")}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-50"
                      >
                        <Check size={14} aria-hidden="true" /> Onayla
                      </button>
                      <button
                        type="button"
                        onClick={() => void respond(row, "declined")}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand transition hover:bg-brand/20 disabled:opacity-50"
                      >
                        <XCircle size={14} aria-hidden="true" /> Reddet
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRespondingId(null);
                          setResponseNote("");
                        }}
                        className="ml-auto text-xs text-muted transition hover:text-content"
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setRespondingId(row.id);
                      setResponseNote("");
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition hover:bg-accent/20"
                  >
                    <CalendarClock size={14} aria-hidden="true" /> Yanıtla
                  </button>
                )
              )}
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
