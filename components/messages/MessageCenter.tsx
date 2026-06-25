"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Send,
  Inbox,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Archive,
  Trash2,
  MailOpen,
  Mail,
  Reply,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES, ROLE_LABELS } from "@/lib/auth/role-constants";
import { listTenantUsers } from "@/lib/services/users";
import { getSchoolProfile } from "@/lib/services/school-profiles";
import { createUserNotification } from "@/lib/services/notifications";
import {
  sendMessage,
  listMessagesForCurrentUser,
  markMessageRead,
  setMessageStatus,
  type MessageRecord,
} from "@/lib/services/messages";
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

function formatDate(ms: number | null): string {
  if (!ms) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

interface Candidate {
  uid: string;
  name: string;
  role: string;
}

/**
 * Mesaj Merkezi — `tenants/{tenantId}/messages` (gerçek Firestore, FCM yok).
 * Kullanıcı yalnızca kendine gelen + kendi gönderdiği mesajları görür.
 * Alıcı seçimi role göre kısıtlanır (personel tüm tenant; veli/öğrenci öğretmeni).
 */
export function MessageCenter() {
  const { user, profile, firebaseReady } = useAuth();
  const uid = user?.uid ?? "";
  const tenantId = profile?.tenantId;
  const usable = firebaseReady && Boolean(uid) && Boolean(tenantId) && Boolean(profile);
  const isStaff = profile != null && STAFF_ROLES.includes(profile.role);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [data, setData] = useState<{ inbox: MessageRecord[]; sent: MessageRecord[] } | null>(
    null,
  );
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [replyTo, setReplyTo] = useState<Candidate | null>(null);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tenantId || !uid) return;
    setRefreshing(true);
    setError(null);
    try {
      setData(await listMessagesForCurrentUser(tenantId, uid));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [tenantId, uid]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  // Alıcı adaylarını role göre yükle.
  useEffect(() => {
    if (!usable || !tenantId || !profile) return;
    let active = true;
    void (async () => {
      try {
        if (isStaff) {
          const users = await listTenantUsers(tenantId);
          if (!active) return;
          setCandidates(
            users
              .filter((u) => u.uid !== uid && u.status === "ACTIVE")
              .map((u) => ({ uid: u.uid, name: u.displayName || u.email, role: u.role })),
          );
        } else {
          // Veli/öğrenci kullanıcı listesini okuyamaz. Sabit hedefler:
          //  - hesabını oluşturan öğretmen (profile.createdBy)
          //  - okul yönetimi (school profile.primaryAdminUid)
          const list: Candidate[] = [];
          if (profile.createdBy) {
            list.push({
              uid: profile.createdBy,
              name: profile.createdByName || "Öğretmenim",
              role: ROLES.TEACHER,
            });
          }
          try {
            const sp = await getSchoolProfile(profile.schoolId ?? tenantId);
            if (
              sp?.primaryAdminUid &&
              sp.primaryAdminUid !== uid &&
              sp.primaryAdminUid !== profile.createdBy
            ) {
              list.push({
                uid: sp.primaryAdminUid,
                name: sp.primaryAdminName || "Okul Yönetimi",
                role: ROLES.SCHOOL_ADMIN,
              });
            }
          } catch {
            /* okul profili okunamazsa yalnızca öğretmen hedefi kalır */
          }
          if (active) setCandidates(list);
        }
      } catch {
        if (active) setCandidates([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [usable, tenantId, profile, isStaff, uid]);

  // Yanıt hedefi adaylarda yoksa (ör. veli, kendisine yazan başka bir admine
  // yanıt veriyor) listeye ekle ki seçili görünsün.
  const allCandidates = useMemo(() => {
    if (replyTo && !candidates.some((c) => c.uid === replyTo.uid)) {
      return [replyTo, ...candidates];
    }
    return candidates;
  }, [candidates, replyTo]);

  const filteredCandidates = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return allCandidates;
    return allCandidates.filter(
      (c) => c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q),
    );
  }, [allCandidates, filter]);

  const startReply = (m: MessageRecord) => {
    const cand: Candidate = {
      uid: m.senderId,
      name: m.senderName || "Gönderen",
      role: m.senderRole || "",
    };
    setReplyTo(cand);
    setSelected(new Set([m.senderId]));
    setSubject(m.subject.startsWith("Re:") ? m.subject : `Re: ${m.subject}`);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !profile || busy) return;
    const form = event.currentTarget;
    const fd = new FormData(form);
    const subjectValue = subject.trim();
    const body = String(fd.get("body") ?? "").trim();
    const recipientIds = Array.from(selected);
    if (!subjectValue || !body) {
      setError("Konu ve mesaj zorunludur.");
      return;
    }
    if (recipientIds.length === 0) {
      setError("En az bir alıcı seçin.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const recipientRoles = Array.from(
        new Set(
          recipientIds
            .map((id) => allCandidates.find((c) => c.uid === id)?.role)
            .filter((r): r is string => Boolean(r)),
        ),
      );
      // senderRole istemciden değil, doğrulanmış profilden alınır.
      await sendMessage({
        tenantId,
        schoolId: profile.schoolId ?? tenantId,
        senderId: uid,
        senderName: profile.displayName || "Kullanıcı",
        senderRole: profile.role,
        recipientIds,
        recipientRoles,
        subject: subjectValue,
        body,
      });
      // Her alıcıya uygulama içi bildirim (FCM yok).
      await Promise.all(
        recipientIds.map((rid) =>
          createUserNotification(tenantId, {
            userId: rid,
            schoolId: profile.schoolId ?? tenantId,
            title: `Yeni mesaj: ${subjectValue}`,
            body: `${profile.displayName || "Bir kullanıcı"} size mesaj gönderdi.`,
            type: "message",
            link: "/messages",
          }),
        ),
      );
      form.reset();
      setSubject("");
      setReplyTo(null);
      setSelected(new Set());
      await load();
      setTab("sent");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const openMessage = async (m: MessageRecord) => {
    setOpenId(openId === m.id ? null : m.id);
    // Gelen kutusunda ve henüz okunmadıysa okundu işaretle.
    if (
      openId !== m.id &&
      tenantId &&
      m.recipientIds.includes(uid) &&
      !m.readBy.includes(uid)
    ) {
      try {
        await markMessageRead(tenantId, m.id, uid);
        setData((prev) =>
          prev
            ? {
                inbox: prev.inbox.map((x) =>
                  x.id === m.id ? { ...x, readBy: [...x.readBy, uid] } : x,
                ),
                sent: prev.sent,
              }
            : prev,
        );
      } catch {
        /* okundu işareti başarısız olsa da mesaj açılır */
      }
    }
  };

  const changeStatus = async (m: MessageRecord, status: "archived" | "deleted") => {
    if (!tenantId) return;
    setBusy(true);
    try {
      await setMessageStatus(tenantId, m.id, status);
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!usable) return null;

  const list = data ? (tab === "inbox" ? data.inbox : data.sent) : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Oluştur */}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Send size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Mesaj Gönder</h2>
        </div>
        <form onSubmit={handleSend} className="flex flex-col gap-4">
          {replyTo && (
            <p className="flex items-center justify-between gap-2 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-xs text-accent">
              <span className="inline-flex items-center gap-1.5">
                <Reply size={13} aria-hidden="true" /> Yanıt: {replyTo.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setSelected(new Set());
                  setSubject("");
                }}
                className="text-muted hover:text-content"
              >
                Vazgeç
              </button>
            </p>
          )}
          <TextField
            label="Konu"
            name="subject"
            placeholder="Konu"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <label className="flex flex-col gap-1.5 text-sm font-medium text-muted">
            Mesaj
            <textarea
              name="body"
              rows={3}
              required
              placeholder="Mesajınızı yazın…"
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content outline-none focus:border-accent"
            />
          </label>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium text-muted">
                Alıcılar ({selected.size})
              </span>
              {candidates.length > 6 && (
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Ara…"
                  className="ml-auto rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1 text-xs text-content outline-none focus:border-accent"
                />
              )}
            </div>
            {candidates.length === 0 ? (
              <p className="rounded-lg border border-overlay/10 bg-overlay/[0.02] px-3 py-2 text-xs text-muted">
                Mesaj gönderebileceğiniz kişi bulunamadı. Gelen mesajlara yanıt
                verebilirsiniz.
              </p>
            ) : (
              <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-lg border border-overlay/10 bg-overlay/[0.02] p-2">
                {filteredCandidates.map((c) => (
                  <label
                    key={c.uid}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-content hover:bg-overlay/[0.04]"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(c.uid)}
                      onChange={() => toggle(c.uid)}
                      className="h-4 w-4 rounded border-overlay/20 bg-overlay/[0.04] accent-accent"
                    />
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="shrink-0 text-xs text-muted">
                      {ROLE_LABELS[c.role as keyof typeof ROLE_LABELS] ?? c.role}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
              <AlertCircle size={16} aria-hidden="true" /> {error}
            </p>
          )}

          <PrimaryButton type="submit" size="md" disabled={busy} className="self-start">
            <Send size={16} aria-hidden="true" />
            {busy ? "Gönderiliyor…" : "Gönder"}
          </PrimaryButton>
        </form>
      </GlassCard>

      {/* Gelen / Giden */}
      <GlassCard tone="navy">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Inbox size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Mesajlar</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTab("inbox")}
              className={`rounded-lg px-2.5 py-1 text-xs transition ${
                tab === "inbox"
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-content"
              }`}
            >
              Gelen ({data?.inbox.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setTab("sent")}
              className={`rounded-lg px-2.5 py-1 text-xs transition ${
                tab === "sent"
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-content"
              }`}
            >
              Giden ({data?.sent.length ?? 0})
            </button>
          </div>
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

        {data === null ? (
          <p className="text-sm text-muted">Yükleniyor…</p>
        ) : list.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Inbox size={15} aria-hidden="true" />
            {tab === "inbox" ? "Gelen mesaj yok." : "Gönderilmiş mesaj yok."}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {list.map((m) => {
              const unread = tab === "inbox" && !m.readBy.includes(uid);
              const open = openId === m.id;
              const archived = m.status === "archived";
              return (
                <li
                  key={m.id}
                  className={`rounded-lg border bg-overlay/[0.02] ${
                    unread ? "border-accent/30" : "border-overlay/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => void openMessage(m)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                  >
                    {tab === "inbox" ? (
                      unread ? (
                        <Mail size={15} className="shrink-0 text-accent" aria-hidden="true" />
                      ) : (
                        <MailOpen size={15} className="shrink-0 text-muted" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpRight size={15} className="shrink-0 text-muted" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate ${unread ? "font-semibold text-content" : "text-content"}`}
                      >
                        {m.subject || "(konusuz)"}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {tab === "inbox"
                          ? `Gönderen: ${m.senderName}`
                          : `Alıcı: ${m.recipientIds.length} kişi`}
                        {archived ? " · arşivlendi" : ""}
                      </span>
                    </span>
                    {unread && (
                      <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        Yeni
                      </span>
                    )}
                    <span className="shrink-0 text-xs text-muted">
                      {formatDate(m.createdAt)}
                    </span>
                  </button>
                  {open && (
                    <div className="border-t border-overlay/10 px-3 py-3">
                      <p className="whitespace-pre-wrap text-sm text-content">{m.body}</p>
                      {tab === "inbox" && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => startReply(m)}
                            className="inline-flex items-center gap-1 rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent transition hover:bg-accent/20"
                          >
                            <Reply size={13} aria-hidden="true" /> Yanıtla
                          </button>
                        </div>
                      )}
                      {tab === "sent" && (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => void changeStatus(m, "archived")}
                            disabled={busy || archived}
                            className="inline-flex items-center gap-1 rounded-lg border border-overlay/10 px-2 py-1 text-xs text-muted transition hover:text-content disabled:opacity-50"
                          >
                            <Archive size={13} aria-hidden="true" /> Arşivle
                          </button>
                          <button
                            type="button"
                            onClick={() => void changeStatus(m, "deleted")}
                            disabled={busy}
                            className="inline-flex items-center gap-1 rounded-lg border border-brand/30 bg-brand/10 px-2 py-1 text-xs text-brand transition hover:bg-brand/20 disabled:opacity-50"
                          >
                            <Trash2 size={13} aria-hidden="true" /> Sil
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
