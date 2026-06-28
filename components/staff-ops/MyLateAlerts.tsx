"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquareWarning, Send, CheckCircle2, Inbox } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import {
  listMyAlerts,
  answerAlert,
  type StaffAlert,
} from "@/lib/services/staff-alerts";

/** Personele sorulan geç-giriş açıklamaları — yanıtlar. */
export function MyLateAlerts() {
  const { user, profile, firebaseReady } = useAuth();
  const t = useT();
  const tenantId = profile?.tenantId;
  const usable = firebaseReady && Boolean(tenantId) && Boolean(user);

  const [rows, setRows] = useState<StaffAlert[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tenantId || !user) return;
    try {
      setRows(await listMyAlerts(tenantId, user.uid));
    } catch {
      setRows([]);
    }
  }, [tenantId, user]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  const reply = async (a: StaffAlert) => {
    if (!tenantId) return;
    const ans = (drafts[a.id] ?? "").trim();
    if (!ans) return;
    setBusyId(a.id);
    try {
      await answerAlert(tenantId, a.id, ans);
      await load();
    } catch {
      /* sessizce */
    } finally {
      setBusyId(null);
    }
  };

  if (!usable || rows === null || rows.length === 0) return null;

  return (
    <GlassCard tone="navy">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquareWarning size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("myalert.title")}</h2>
      </div>
      <p className="mb-4 text-sm text-muted">{t("myalert.desc")}</p>

      {rows.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" /> {t("myalert.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((a) => (
            <li key={a.id} className="rounded-xl border border-overlay/10 bg-overlay/[0.03] p-4">
              <p className="text-xs text-muted">{a.date}</p>
              <p className="mt-1 text-sm">
                <span className="font-medium text-content/70">{t("myalert.question")}:</span>{" "}
                <span className="text-content">{a.question}</span>
              </p>
              {a.status === "answered" ? (
                <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-sm text-content">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" />
                  {a.answer}
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    value={drafts[a.id] ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
                    placeholder={t("myalert.answerPlaceholder")}
                    className="min-w-[200px] flex-1 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-3 py-2 text-sm text-content outline-none focus:border-accent"
                  />
                  <PrimaryButton type="button" size="sm" onClick={() => void reply(a)} disabled={busyId === a.id}>
                    <Send size={14} aria-hidden="true" /> {t("myalert.answer")}
                  </PrimaryButton>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
