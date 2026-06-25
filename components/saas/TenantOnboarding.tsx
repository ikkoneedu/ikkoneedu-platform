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
      setError(result.error ?? "Onboarding başarısız.");
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
        <h2 className="text-lg font-semibold text-content">Yeni Okul Onboarding</h2>
      </div>
      <p className="mb-4 text-xs text-muted">
        Tenant + okul profili + ilk okul admini (SCHOOL_ADMIN) tek adımda
        oluşturulur. Admin için geçici şifre üretilir.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField
            label="Okul Adı *"
            name="name"
            placeholder="İngiliz Kültür"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <TextField
            label="Kısa Ad (slug / subdomain)"
            name="slug"
            placeholder={slugPreview || "ingilizkultur"}
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted">Paket</label>
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
            label="Şehir"
            name="city"
            placeholder="İstanbul"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
          <TextField
            label="İlçe"
            name="district"
            placeholder="Kadıköy"
            value={form.district}
            onChange={(e) => set("district", e.target.value)}
          />
          <TextField
            label="Telefon"
            name="phone"
            placeholder="0216 ..."
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <TextField
            label="Web Sitesi"
            name="website"
            placeholder="https://..."
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:items-end">
          <TextField
            label="Okul E-postası"
            name="schoolEmail"
            type="email"
            placeholder="info@okul.com"
            value={form.schoolEmail}
            onChange={(e) => set("schoolEmail", e.target.value)}
          />
          <TextField
            label="Admin Ad Soyad"
            name="adminName"
            placeholder="Ad Soyad"
            value={form.adminName}
            onChange={(e) => set("adminName", e.target.value)}
          />
          <TextField
            label="Admin E-posta *"
            name="adminEmail"
            type="email"
            placeholder="admin@okul.com"
            required
            value={form.adminEmail}
            onChange={(e) => set("adminEmail", e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted">Durum</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TenantStatus)}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-3 text-sm text-content outline-none focus:border-accent"
            >
              <option value="trial" className="bg-surface">Deneme</option>
              <option value="active" className="bg-surface">Aktif</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PrimaryButton type="submit" size="md" disabled={busy}>
            <Plus size={16} aria-hidden="true" />
            {busy ? "Oluşturuluyor…" : "Onboarding'i Tamamla"}
          </PrimaryButton>
          {slugPreview && !onboarded && (
            <span className="text-xs text-muted">
              Kimlik: <span className="font-mono text-accent">{slugPreview}</span>
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
              Okul oluşturuldu — {onboarded.tenantId}
            </p>
            <p className="mt-0.5 text-muted">
              Admin: {onboarded.email} · Geçici şifre:{" "}
              <span className="font-mono text-accent">{onboarded.password}</span>
            </p>
            {resetState === "sent" && (
              <p className="mt-1 text-xs text-emerald-400">
                Şifre belirleme e-postası gönderildi.
              </p>
            )}
            {resetState === "error" && (
              <p className="mt-1 text-xs text-brand">E-posta gönderilemedi.</p>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <PrimaryButton type="button" variant="secondary" size="sm" onClick={copyPassword}>
              {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
              {copied ? "Kopyalandı" : "Şifreyi Kopyala"}
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
                ? "Gönderiliyor…"
                : resetState === "sent"
                  ? "Gönderildi"
                  : "Şifre E-postası Gönder"}
            </PrimaryButton>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
