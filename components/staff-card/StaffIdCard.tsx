"use client";

import { useEffect, useRef, useState } from "react";
import { IdCard, Upload, Save, Printer, Camera, CheckCircle2, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { LogoMark } from "@/components/shared/LogoMark";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import { ROLE_LABELS } from "@/lib/auth/role-constants";
import { departmentLabel } from "@/lib/staff/departments";
import { updateMyProfile } from "@/lib/services/user-profile";
import { uploadStaffPhoto } from "@/lib/services/staff-photo";
import { printToPDF } from "@/lib/export/download";
import { FOUNDER_SCHOOL_NAME } from "@/lib/config/app-mode";

function cardNumber(uid: string): string {
  return `IKK-${uid.slice(-6).toUpperCase()}`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Personel Kimlik Kartı — premium okul personeli kimliği.
 * Fotoğraf yükleme + unvan/doğum tarihi düzenleme + yazdırma. Güvenli profil
 * alanları kullanıcı tarafından güncellenir (rol/tenant değişmez).
 */
export function StaffIdCard() {
  const { user, profile, firebaseReady } = useAuth();
  const t = useT();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setTitle(profile.title ?? "");
      setBirthDate(profile.birthDate ?? "");
      setPhotoURL(profile.photoURL ?? "");
    }
  }, [profile]);

  if (!firebaseReady || !user || !profile) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="text-sm text-muted">{t("card.unavailable")}</p>
      </GlassCard>
    );
  }

  const name = profile.displayName || profile.email;
  const roleLabel = ROLE_LABELS[profile.role] ?? profile.role;
  const deptLabel = profile.department ? departmentLabel(profile.department) : "—";
  const cardNo = cardNumber(user.uid);

  const onPickPhoto = async (file: File) => {
    setPhotoBusy(true);
    setError(null);
    try {
      const url = await uploadStaffPhoto(user.uid, file);
      setPhotoURL(url);
      await updateMyProfile(user.uid, { photoURL: url });
    } catch {
      setError(t("card.err.upload"));
    } finally {
      setPhotoBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updateMyProfile(user.uid, { title: title.trim(), birthDate: birthDate.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError(t("card.err.save"));
    } finally {
      setBusy(false);
    }
  };

  const print = () => {
    const photoHtml = photoURL
      ? `<img src="${esc(photoURL)}" style="width:96px;height:120px;object-fit:cover;border-radius:10px;border:2px solid #B2C7EF" />`
      : `<div style="width:96px;height:120px;border-radius:10px;background:#1e293b"></div>`;
    const body = `
      <div style="width:360px;border-radius:18px;overflow:hidden;border:1px solid #B2C7EF;font-family:Inter,system-ui,sans-serif">
        <div style="background:linear-gradient(135deg,#0A2342,#13315c);color:#fff;padding:16px 18px;display:flex;align-items:center;gap:10px">
          <div style="font-weight:800;font-size:15px">${esc(FOUNDER_SCHOOL_NAME)}</div>
        </div>
        <div style="padding:18px;background:#fff;color:#0A2342">
          <div style="font-size:11px;letter-spacing:.16em;color:#B2C7EF;font-weight:700">${esc(t("card.docTitle"))}</div>
          <div style="display:flex;gap:16px;margin-top:12px">
            ${photoHtml}
            <div style="flex:1">
              <div style="font-size:18px;font-weight:800">${esc(name)}</div>
              <div style="font-size:13px;color:#334">${esc(title || roleLabel)}</div>
              <div style="margin-top:8px;font-size:12px;color:#556">
                <div><b>${esc(t("card.field.role"))}:</b> ${esc(roleLabel)}</div>
                <div><b>${esc(t("card.field.department"))}:</b> ${esc(deptLabel)}</div>
                ${birthDate ? `<div><b>${esc(t("card.field.birthDate"))}:</b> ${esc(birthDate)}</div>` : ""}
                <div><b>${esc(t("card.field.cardNo"))}:</b> ${esc(cardNo)}</div>
              </div>
            </div>
          </div>
          <div style="margin-top:14px;display:inline-block;background:#D62839;color:#fff;font-size:11px;font-weight:700;letter-spacing:.1em;padding:4px 10px;border-radius:6px">${esc(t("card.staffBadge"))}</div>
          <div style="margin-top:12px;font-size:9px;color:#889">${esc(t("card.validity"))}</div>
        </div>
      </div>`;
    printToPDF(t("card.metaTitle"), body);
  };

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
      {/* Kart önizleme */}
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-accent/30 shadow-2xl">
        {/* Üst bant — okul */}
        <div className="flex items-center gap-3 bg-gradient-to-br from-navy to-[#13315c] px-5 py-4">
          <LogoMark size={30} />
          <div className="leading-tight">
            <p className="text-sm font-extrabold tracking-tight text-white">{FOUNDER_SCHOOL_NAME}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              {t("card.docTitle")}
            </p>
          </div>
        </div>

        {/* Gövde */}
        <div className="bg-surface px-5 py-5">
          <div className="flex gap-4">
            <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-accent/40 bg-overlay/[0.06]">
              {photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoURL} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted">
                  <Camera size={22} aria-hidden="true" />
                  <span className="text-[9px]">{t("card.noPhoto")}</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-extrabold text-content">{name}</p>
              <p className="truncate text-sm text-muted">{title || roleLabel}</p>
              <dl className="mt-2 space-y-0.5 text-xs text-muted">
                <div className="flex gap-1">
                  <dt className="font-semibold text-content/70">{t("card.field.role")}:</dt>
                  <dd>{roleLabel}</dd>
                </div>
                <div className="flex gap-1">
                  <dt className="font-semibold text-content/70">{t("card.field.department")}:</dt>
                  <dd>{deptLabel}</dd>
                </div>
                {birthDate && (
                  <div className="flex gap-1">
                    <dt className="font-semibold text-content/70">{t("card.field.birthDate")}:</dt>
                    <dd>{birthDate}</dd>
                  </div>
                )}
                <div className="flex gap-1">
                  <dt className="font-semibold text-content/70">{t("card.field.cardNo")}:</dt>
                  <dd className="font-mono">{cardNo}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="rounded-md bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              {t("card.staffBadge")}
            </span>
            <IdCard size={20} className="text-accent" aria-hidden="true" />
          </div>
          <p className="mt-3 text-[9px] leading-snug text-muted/70">{t("card.validity")}</p>
        </div>
      </div>

      {/* Düzenleme paneli */}
      <GlassCard tone="navy" className="w-full max-w-sm">
        <div className="mb-4 flex items-center gap-2">
          <IdCard size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("card.title")}</h2>
        </div>
        <p className="mb-4 text-sm text-muted">{t("card.desc")}</p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onPickPhoto(f);
            e.target.value = "";
          }}
        />

        <div className="flex flex-col gap-4">
          <PrimaryButton
            type="button"
            variant="secondary"
            size="md"
            onClick={() => fileRef.current?.click()}
            disabled={photoBusy}
            className="w-full sm:w-fit"
          >
            <Upload size={16} aria-hidden="true" />
            {photoBusy ? t("card.uploading") : photoURL ? t("card.changePhoto") : t("card.upload")}
          </PrimaryButton>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-muted">
            {t("card.field.title")}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("card.field.titlePlaceholder")}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-muted">
            {t("card.field.birthDate")}
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content outline-none focus:border-accent"
            />
          </label>

          {error && (
            <p className="flex items-center gap-2 text-sm text-brand">
              <AlertCircle size={15} aria-hidden="true" /> {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <PrimaryButton type="button" size="md" onClick={save} disabled={busy}>
              {saved ? <CheckCircle2 size={16} aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
              {busy ? t("card.saving") : saved ? t("card.saved") : t("card.save")}
            </PrimaryButton>
            <PrimaryButton type="button" variant="secondary" size="md" onClick={print}>
              <Printer size={16} aria-hidden="true" /> {t("card.print")}
            </PrimaryButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
