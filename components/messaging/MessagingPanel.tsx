"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { MessageSquare, Send, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listMyCodes } from "@/lib/services/access-codes";
import {
  sendMessage,
  listConversation,
  type DirectMessage,
} from "@/lib/services/messaging";

interface Contact {
  uid: string;
  name: string;
}

function formatTime(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Birebir mesajlaşma paneli.
 * Öğretmen: kendi öğrenci/velileriyle. Öğrenci/Veli: öğretmeniyle.
 * Yalnızca giriş yapmış kullanıcı + Firebase aktifken görünür.
 */
export function MessagingPanel() {
  const t = useT();
  const { user, profile, firebaseReady } = useAuth();
  const myUid = user?.uid;
  const tenantId = profile?.tenantId;
  const isTeacher = profile?.role === ROLES.TEACHER;

  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [busy, setBusy] = useState(false);

  // Kontakları yükle.
  useEffect(() => {
    if (!firebaseReady || !profile || !myUid || !tenantId) return;
    let active = true;
    void (async () => {
      if (isTeacher) {
        const codes = await listMyCodes(tenantId, myUid);
        const list = codes.map((c) => ({
          uid: c.uid,
          name: `${c.displayName} (${c.role === ROLES.STUDENT ? t("boardC.messaging.roleStudent") : t("boardC.messaging.roleParent")})`,
        }));
        if (active) {
          setContacts(list);
          setSelected(list[0] ?? null);
        }
      } else {
        // Öğrenci/veli → öğretmeni.
        const teacher = profile.createdBy
          ? [{ uid: profile.createdBy, name: profile.createdByName ?? t("boardC.messaging.myTeacher") }]
          : [];
        if (active) {
          setContacts(teacher);
          setSelected(teacher[0] ?? null);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, profile, myUid, tenantId, isTeacher, t]);

  const loadConversation = useCallback(async () => {
    if (!myUid || !selected) {
      setMessages([]);
      return;
    }
    setMessages(await listConversation(myUid, selected.uid));
  }, [myUid, selected]);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!myUid || !tenantId || !selected || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const text = String(data.get("text") ?? "").trim();
    if (!text) return;

    setBusy(true);
    try {
      await sendMessage({
        tenantId,
        senderUid: myUid,
        senderName: profile?.displayName ?? t("boardC.messaging.defaultUser"),
        recipientUid: selected.uid,
        text,
      });
      form.reset();
      await loadConversation();
    } finally {
      setBusy(false);
    }
  };

  if (!firebaseReady || !profile || contacts === null) return null;

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("boardC.messaging.title")}</h2>
        <button
          type="button"
          onClick={() => void loadConversation()}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg border border-overlay/10 bg-overlay/[0.04] text-muted transition-colors hover:border-accent/30 hover:text-content"
          aria-label={t("boardC.messaging.refresh")}
        >
          <RefreshCw size={15} aria-hidden="true" />
        </button>
      </div>

      {contacts.length === 0 ? (
        <p className="text-sm text-muted">
          {isTeacher
            ? t("boardC.messaging.emptyTeacher")
            : t("boardC.messaging.emptyOther")}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Kontak seçimi (öğretmende birden fazla) */}
          {isTeacher && contacts.length > 1 && (
            <select
              value={selected?.uid ?? ""}
              onChange={(e) =>
                setSelected(contacts.find((c) => c.uid === e.target.value) ?? null)
              }
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            >
              {contacts.map((c) => (
                <option key={c.uid} value={c.uid} className="bg-surface">
                  {c.name}
                </option>
              ))}
            </select>
          )}
          {selected && (
            <p className="text-xs text-muted">
              {t("boardC.messaging.talkingTo")} <span className="text-content">{selected.name}</span>
            </p>
          )}

          {/* Mesaj akışı */}
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto rounded-xl border border-overlay/10 bg-overlay/[0.02] p-3">
            {messages.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">{t("boardC.messaging.noMessages")}</p>
            ) : (
              messages.map((m) => {
                const mine = m.senderUid === myUid;
                return (
                  <div
                    key={m.id}
                    className={["flex flex-col", mine ? "items-end" : "items-start"].join(" ")}
                  >
                    <div
                      className={[
                        "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                        mine
                          ? "bg-accent/20 text-content"
                          : "border border-overlay/10 bg-overlay/[0.04] text-content",
                      ].join(" ")}
                    >
                      {m.text}
                    </div>
                    <span className="mt-0.5 text-[10px] text-muted/70">
                      {mine ? t("boardC.messaging.you") : m.senderName} · {formatTime(m.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Gönderme */}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              name="text"
              placeholder={t("boardC.messaging.placeholder")}
              autoComplete="off"
              className="flex-1 rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-2.5 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <PrimaryButton type="submit" size="md" disabled={busy || !selected}>
              <Send size={16} aria-hidden="true" />
            </PrimaryButton>
          </form>
        </div>
      )}
    </GlassCard>
  );
}
