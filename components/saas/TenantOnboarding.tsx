"use client";

import { useState, type FormEvent } from "react";
import {
  Building2,
  Plus,
  AlertCircle,
  CheckCircle2,
  Copy,
  Mail,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { onboardTenant } from "@/lib/services/onboarding";
import { sendPasswordReset } from "@/lib/services/auth-actions";
import { toSlug } from "@/lib/services/schools";
import { PACKAGES, DEFAULT_PACKAGE_ID, type PackageId } from "@/lib/packages";
import type { TenantStatus } from "@/lib/services/tenants";

interface OnboardedInfo {
  tenantId: string;
  schoolId: string;
  email: string;
  password: string;
}

/**
 * Tenant onboarding — tek formdan tenant + okul + ilk admin (SCHOOL_ADMIN).
 * Yalnızca SUPER_ADMIN + Firebase aktifken görünür. Yeni ekran açmaz; SaaS
 * Admin alanında çalışır. `onConboarded` ile listeyi tazeler.
 */
export function TenantOnboarding({ onCreated }: { onCreated?: () => void }) {
  const t = useT();
  const { user, profile, firebaseReady } = useAuth();
  const isSuper = profile?.role === ROLES.SUPER_ADMIN;
  const adminUid = user?.uid;

  const [form, setForm] = useState({
    name: "",
    slug: "",
    city: "",
    district: "",
    phone: "",
    schoolEmail: "",
    website: "",
    adminName: "",
    adminEmail: "",
  });
  const [packageId, setPackageId] = useState<PackageId>(DEFAULT_PACKAGE_ID);
  const [status, setStatus] = useState<TenantStatus>("trial");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboarded, setOnboarded] = useState<OnboardedInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [resetState, setResetState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const slugPreview = toSlug(form.slug || form.name);

  if (!firebaseReady || !isSuper) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!adminUid || busy) return;
    setBusy(true);
    setError(null);
    setOnboarded(null);
    setResetState("idle");
    const result = await onboardTenant({
      name: form.name,
      slug: form.slug,
      packageId,
      status,
      city: form.city,
      district: form.district,
      phone: form.phone,
      schoolEmail: form.schoolEmail,
      website: form.website,
      adminEmail: form.adminEmail,
      adminName: form.adminName,
      createdBy: adminUid,
    });
    setBusy(false);
    if (!result.ok || !result.admin) {
      setError(result.error ?? t("panelSaas.onb.err.failed"));
      return;
    }
    setOnboarded({
      tenantId: result.tenantId ?? "",
      schoolId: result.schoolId ?? "",
      email: result.admin.email,
      password: result.admin.tempPassword,
    });
    setForm({
      name: "",
      slug: "",
      city: "",
      district: "",
      phone: "",
      schoolEmail: "",
      website: "",
      adminName: "",
      adminEmail: "",
    });
    onCreated?.();
  };

  const copyPassword = async () => {
    if (!onboarded) return;
    try {
      await navigator.clipboard.writeText(onboarded.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const sendReset = async () => {
    if (!onboarded || resetState === "sending") return;
    setResetState("sending");
    const result = await sendPasswordReset(onboarded.email);
    setResetState(result.ok ? "sent" : "error");
  };

  return (
    <GlassCard tone="navy">
      <div className="mb-1 flex items-center gap-2">
        <Building2 size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("panelSaas.onb.heading")}</h2>
      </div>
      <p className="mb-4 text-xs text-muted">
        {t("panelSaas.onb.subtitle")}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField
            label={t("panelSaas.onb.field.name")}
            name="name"
            placeholder={t("panelSaas.onb.field.namePlaceholder")}
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <TextField
            label={t("panelSaas.onb.field.slug")}
            name="slug"
            placeholder={slugPreview || t("panelSaas.onb.field.slugPlaceholder")}
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted">{t("panelSaas.onb.field.package")}</label>
            <select
              value={packageId}
              onChange={(e) => setPackageId(e.target.value as PackageId)}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-3 text-sm text-content outline-none focus:border-accent"
            >
              {PACKAGES.map((p) => (
                <option key={p.id} value={p.id} className="bg-surface">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <TextField
            label={t("panelSaas.onb.field.city")}
            name="city"
            placeholder={t("panelSaas.onb.field.cityPlaceholder")}
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
          <TextField
            label={t("panelSaas.onb.field.district")}
            name="district"
            placeholder={t("panelSaas.onb.field.districtPlaceholder")}
            value={form.district}
            onChange={(e) => set("district", e.target.value)}
          />
          <TextField
            label={t("panelSaas.onb.field.phone")}
            name="phone"
            placeholder={t("panelSaas.onb.field.phonePlaceholder")}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <TextField
            label={t("panelSaas.onb.field.website")}
            name="website"
            placeholder={t("panelSaas.onb.field.websitePlaceholder")}
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:items-end">
          <TextField
            label={t("panelSaas.onb.field.schoolEmail")}
            name="schoolEmail"
            type="email"
            placeholder={t("panelSaas.onb.field.schoolEmailPlaceholder")}
            value={form.schoolEmail}
            onChange={(e) => set("schoolEmail", e.target.value)}
          />
          <TextField
            label={t("panelSaas.onb.field.adminName")}
            name="adminName"
            placeholder={t("panelSaas.onb.field.adminNamePlaceholder")}
            value={form.adminName}
            onChange={(e) => set("adminName", e.target.value)}
          />
          <TextField
            label={t("panelSaas.onb.field.adminEmail")}
            name="adminEmail"
            type="email"
            placeholder={t("panelSaas.onb.field.adminEmailPlaceholder")}
            required
            value={form.adminEmail}
            onChange={(e) => set("adminEmail", e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted">{t("panelSaas.onb.field.status")}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TenantStatus)}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-3 text-sm text-content outline-none focus:border-accent"
            >
              <option value="trial" className="bg-surface">{t("panelSaas.onb.status.trial")}</option>
              <option value="active" className="bg-surface">{t("panelSaas.onb.status.active")}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PrimaryButton type="submit" size="md" disabled={busy}>
            <Plus size={16} aria-hidden="true" />
            {busy ? t("panelSaas.onb.submitBusy") : t("panelSaas.onb.submit")}
          </PrimaryButton>
          {slugPreview && !onboarded && (
            <span className="text-xs text-muted">
              {t("panelSaas.onb.identity")} <span className="font-mono text-accent">{slugPreview}</span>
              {" · "}
              <span className="font-mono text-accent">
                {slugPreview}.ikkoneedu.com
              </span>
            </span>
          )}
        </div>
      </form>

      {error && (
        <p className="mt-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </p>
      )}

      {onboarded && (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-accent/30 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold text-content">
              {t("panelSaas.onb.created", { tenantId: onboarded.tenantId })}
            </p>
            <p className="mt-0.5 text-muted">
              {t("panelSaas.onb.adminLine", { email: onboarded.email })}{" "}
              <span className="font-mono text-accent">{onboarded.password}</span>
            </p>
            {resetState === "sent" && (
              <p className="mt-1 text-xs text-emerald-400">
                {t("panelSaas.onb.reset.sent")}
              </p>
            )}
            {resetState === "error" && (
              <p className="mt-1 text-xs text-brand">{t("panelSaas.onb.reset.error")}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <PrimaryButton type="button" variant="secondary" size="sm" onClick={copyPassword}>
              {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
              {copied ? t("panelSaas.onb.copied") : t("panelSaas.onb.copyPw")}
            </PrimaryButton>
            <PrimaryButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={sendReset}
              disabled={resetState === "sending" || resetState === "sent"}
            >
              <Mail size={15} aria-hidden="true" />
              {resetState === "sending"
                ? t("panelSaas.onb.reset.sending")
                : resetState === "sent"
                  ? t("panelSaas.onb.reset.sentBtn")
                  : t("panelSaas.onb.reset.send")}
            </PrimaryButton>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
