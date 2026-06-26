"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox, Award, Contact, MessageSquare, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useT } from "@/components/i18n/LocaleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  listScholarshipApplications,
  type ScholarshipApplicationRecord,
} from "@/lib/services/scholarship-applications";
import { listLeads, type LeadRecord } from "@/lib/services/leads";
import {
  listSchoolInquiries,
  type SchoolInquiryRecord,
} from "@/lib/services/demo-requests";
import { CrmStatusSelect } from "@/components/crm/CrmStatusSelect";
import { ConvertToStudentAction } from "@/components/crm/ConvertToStudentAction";

const STAFF_ROLES = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.PR,
  ROLES.SALES,
  ROLES.SUPER_ADMIN,
] as const;

// Öğrenci kaydı (erişim kodu) açabilen roller — kurallarla tutarlı (SALES/PR hariç).
const ENROLL_ROLES = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.TEACHER,
  ROLES.SUPER_ADMIN,
] as const;

/**
 * CRM gelen kutusu — gerçek bursluluk başvuruları + lead'ler (Firestore).
 * Yalnızca giriş yapmış CRM personeli + Firebase aktifken görünür.
 */
export function CrmInbox() {
  const t = useT();
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canEnroll =
    profile != null && (ENROLL_ROLES as readonly string[]).includes(profile.role);
  const canSee =
    profile != null && (STAFF_ROLES as readonly string[]).includes(profile.role);

  const [apps, setApps] = useState<ScholarshipApplicationRecord[] | null>(null);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [inquiries, setInquiries] = useState<SchoolInquiryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    const [a, l, i] = await Promise.all([
      listScholarshipApplications(tenantId),
      listLeads(tenantId),
      listSchoolInquiries(tenantId),
    ]);
    setApps(a);
    setLeads(l);
    setInquiries(i);
  }, [tenantId]);

  useEffect(() => {
    if (firebaseReady && tenantId && canSee) void refresh();
  }, [firebaseReady, tenantId, canSee, refresh]);

  if (!firebaseReady || !canSee || apps === null || !tenantId) return null;

  const isNew = (s: string) => s === "new" || s === "received" || s === "";
  const newApps = apps.filter((a) => isNew(a.status)).length;
  const newLeads = leads.filter((l) => isNew(l.status)).length;
  const newInquiries = inquiries.filter((i) => isNew(i.status)).length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand lg:col-span-2">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Award size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("panelCrm.inbox.scholarshipTitle")}</h2>
          <NewBadge count={newApps} />
          <span className="ml-auto text-xs text-muted">{apps.length}</span>
        </div>
        {apps.length === 0 ? (
          <p className="text-sm text-muted">{t("panelCrm.inbox.scholarshipEmpty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {apps.map((a) => (
              <li key={a.id} className="rounded-lg border border-overlay/10 bg-overlay/[0.03] p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-content">{a.studentName || t("panelCrm.inbox.dash")}</span>
                  <span className="font-mono text-xs text-accent">{a.applicationNo}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {t("panelCrm.inbox.parent", {
                    name: a.parentName || t("panelCrm.inbox.dash"),
                    contact: a.parentPhone || a.parentEmail || t("panelCrm.inbox.dash"),
                  })}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CrmStatusSelect
                    tenantId={tenantId}
                    kind="scholarship"
                    id={a.id}
                    status={a.status}
                    onChanged={refresh}
                    onError={setError}
                  />
                  {canEnroll && a.status !== "converted" && user && (
                    <ConvertToStudentAction
                      tenantId={tenantId}
                      kind="scholarship"
                      id={a.id}
                      studentName={a.studentName}
                      parentName={a.parentName}
                      staffUid={user.uid}
                      staffName={profile?.displayName}
                      onConverted={refresh}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Contact size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("panelCrm.inbox.leadsTitle")}</h2>
          <NewBadge count={newLeads} />
          <span className="ml-auto text-xs text-muted">{leads.length}</span>
        </div>
        {leads.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Inbox size={15} aria-hidden="true" />
            {t("panelCrm.inbox.leadsEmpty")}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {leads.map((l) => (
              <li key={l.id} className="rounded-lg border border-overlay/10 bg-overlay/[0.03] p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-content">{l.fullName || t("panelCrm.inbox.dash")}</span>
                  <span className="text-xs text-muted">{l.source || t("panelCrm.inbox.dash")}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {l.phone || t("panelCrm.inbox.dash")}
                  {l.email ? ` · ${l.email}` : ""}
                </p>
                {l.note && <p className="mt-1 text-xs text-muted/70">{l.note}</p>}
                <div className="mt-2">
                  <CrmStatusSelect
                    tenantId={tenantId}
                    kind="lead"
                    id={l.id}
                    status={l.status}
                    onChanged={refresh}
                    onError={setError}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard tone="navy" className="lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("panelCrm.inbox.inquiriesTitle")}</h2>
          <NewBadge count={newInquiries} />
          <span className="ml-auto text-xs text-muted">{inquiries.length}</span>
        </div>
        {inquiries.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Inbox size={15} aria-hidden="true" />
            {t("panelCrm.inbox.inquiriesEmpty")}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {inquiries.map((i) => (
              <li key={i.id} className="rounded-lg border border-overlay/10 bg-overlay/[0.03] p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-content">{i.fullName || t("panelCrm.inbox.dash")}</span>
                  {i.grade && <span className="text-xs text-accent">{i.grade}</span>}
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {i.phone || t("panelCrm.inbox.dash")}
                  {i.email ? ` · ${i.email}` : ""}
                </p>
                {i.message && <p className="mt-1 text-xs text-muted/70">{i.message}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CrmStatusSelect
                    tenantId={tenantId}
                    kind={i.type === "school_inquiry" ? "inquiry" : "demo"}
                    id={i.id}
                    status={i.status}
                    onChanged={refresh}
                    onError={setError}
                  />
                  {canEnroll && i.status !== "converted" && user && (
                    <ConvertToStudentAction
                      tenantId={tenantId}
                      kind={i.type === "school_inquiry" ? "inquiry" : "demo"}
                      id={i.id}
                      studentName={i.fullName}
                      staffUid={user.uid}
                      staffName={profile?.displayName}
                      onConverted={refresh}
                    />
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

/** İşlenmemiş (yeni) kayıt sayısını vurgulayan rozet. */
function NewBadge({ count }: { count: number }) {
  const t = useT();
  if (count <= 0) return null;
  return (
    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-300">
      {t("panelCrm.inbox.newBadge", { count })}
    </span>
  );
}
