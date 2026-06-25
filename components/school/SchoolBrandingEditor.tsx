"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Palette, Save, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SchoolLogo } from "@/components/school/SchoolLogo";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  getSchool,
  updateSchool,
  isHexColor,
  DEFAULT_BRAND_COLOR,
} from "@/lib/services/schools";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const MANAGER_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL, ROLES.SUPER_ADMIN,
];

/**
 * Okul Marka Kimliği (white-label) editörü — okul yönetimi kendi okulunun
 * logosunu, sloganını, marka rengini ve tanıtım metnini düzenler. Canlı önizleme
 * gösterir. Veriler public okul sayfasında (tenants/{id}) kullanılır. Tenant izole.
 */
export function SchoolBrandingEditor() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canEdit = profile != null && MANAGER_ROLES.includes(profile.role);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState("");
  const [slogan, setSlogan] = useState("");
  const [brandColor, setBrandColor] = useState(DEFAULT_BRAND_COLOR);
  const [about, setAbout] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!tenantId) return;
    try {
      const s = await getSchool(tenantId);
      if (s) {
        setName(s.name);
        setSlug(s.slug);
        setLogo(s.logo);
        setSlogan(s.slogan);
        setBrandColor(isHexColor(s.brandColor) ? s.brandColor : DEFAULT_BRAND_COLOR);
        setAbout(s.about);
      }
      setLoaded(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setLoaded(true);
    }
  }, [tenantId]);

  useEffect(() => {
    if (firebaseReady && tenantId && canEdit) void load();
  }, [firebaseReady, tenantId, canEdit, load]);

  if (!firebaseReady || !tenantId || !canEdit) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    if (logo && !/^https?:\/\//i.test(logo.trim())) {
      setError("Logo bağlantısı http(s) ile başlamalı (veya boş bırakın).");
      return;
    }
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updateSchool(tenantId, {
        logo: logo.trim(),
        slogan: slogan.trim(),
        brandColor,
        about: about.trim(),
      });
      setSaved(true);
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
          <Palette size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-content">Okul Marka Kimliği</h2>
          <p className="text-xs text-muted">
            Logo, slogan, marka rengi ve tanıtım metni — public okul sayfanızda görünür.
          </p>
        </div>
        {slug && (
          <a
            href={`/school/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs text-muted transition hover:text-accent"
          >
            Sayfayı gör <ExternalLink size={12} aria-hidden="true" />
          </a>
        )}
      </div>

      {!loaded ? (
        <p className="text-sm text-muted">Yükleniyor…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Logo Bağlantısı (URL)"
              name="logo"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://…/logo.png"
            />
            <TextField
              label="Slogan"
              name="slogan"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Geleceğe açılan kapı"
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="be-color" className="text-sm font-medium text-muted">
                Marka Rengi
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="be-color"
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-11 w-20 cursor-pointer rounded-xl border border-overlay/10 bg-overlay/[0.04] px-2"
                />
                <span className="font-mono text-sm text-muted">{brandColor}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="be-about" className="text-sm font-medium text-muted">
                Tanıtım Metni
              </label>
              <textarea
                id="be-about"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={3}
                placeholder="Okulunuzu kısaca tanıtın…"
                className="w-full rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {error && (
              <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
                <AlertCircle size={16} aria-hidden="true" /> {error}
              </p>
            )}
            {saved && (
              <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-300">
                <CheckCircle2 size={16} aria-hidden="true" /> Marka kimliği kaydedildi.
              </p>
            )}

            <PrimaryButton type="submit" size="md" disabled={busy}>
              <Save size={16} aria-hidden="true" />
              {busy ? "Kaydediliyor…" : "Kaydet"}
            </PrimaryButton>
          </form>

          {/* Canlı önizleme */}
          <div
            className="flex w-full min-w-0 flex-col items-center gap-3 rounded-2xl border border-overlay/10 bg-overlay/[0.02] p-6 text-center lg:w-64"
            style={{ ["--brand" as string]: brandColor }}
          >
            <div className="h-1 w-full rounded-full" style={{ backgroundColor: brandColor }} />
            <SchoolLogo logo={logo} brand={brandColor} size={64} name={name} rounded="rounded-2xl" />
            <p className="text-sm font-bold text-content">{name || "Okul Adı"}</p>
            {slogan && (
              <p className="text-xs font-medium italic" style={{ color: brandColor }}>
                “{slogan}”
              </p>
            )}
            {about && <p className="text-xs leading-relaxed text-muted">{about}</p>}
            <span
              className="mt-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
              style={{ backgroundColor: brandColor }}
            >
              Okul Portalına Giriş
            </span>
            <p className="text-[10px] uppercase tracking-wide text-muted/60">Önizleme</p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
