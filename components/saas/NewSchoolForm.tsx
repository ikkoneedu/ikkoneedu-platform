"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowUpRight,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { createSchool } from "@/lib/services/schools";
import { createManagedAccount } from "@/lib/services/users";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

interface NewSchoolFormProps {
  plans: string[];
}

/**
 * Yeni Okul Ekle — GERÇEK okul oluşturma (süper admin).
 * Okulu (tenant) oluşturur; yetkili e-postası verilirse kurucu (FOUNDER) hesabı
 * açar ve geçici şifre üretir. Süper admin değilse yönlendirme gösterir.
 */
export function NewSchoolForm({ plans }: NewSchoolFormProps) {
  const { user, profile, firebaseReady } = useAuth();
  const isSuper = profile?.role === ROLES.SUPER_ADMIN;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ school: string; email?: string; password?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || busy) return;
    const f = new FormData(e.currentTarget);
    const name = String(f.get("school") ?? "").trim();
    const manager = String(f.get("manager") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const city = String(f.get("city") ?? "").trim();
    const logo = String(f.get("logo") ?? "").trim();
    const slogan = String(f.get("slogan") ?? "").trim();
    const brandColor = String(f.get("brandColor") ?? "").trim();
    const about = String(f.get("about") ?? "").trim();
    if (!name) {
      setError("Okul adı zorunludur.");
      return;
    }
    if (email && !email.includes("@")) {
      setError("Geçerli bir yetkili e-postası girin (veya boş bırakın).");
      return;
    }
    if (logo && !/^https?:\/\//i.test(logo)) {
      setError("Logo bağlantısı http(s) ile başlamalı (veya boş bırakın).");
      return;
    }
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const school = await createSchool({
        name, slug: name, city, createdBy: user.uid,
        logo, slogan, brandColor, about,
      });
      let founder: { email: string; password: string } | undefined;
      if (email) {
        const res = await createManagedAccount({
          tenantId: school.id,
          createdBy: user.uid,
          role: ROLES.FOUNDER,
          displayName: manager || name,
          email,
        });
        founder = { email: res.email, password: res.tempPassword };
      }
      setDone({ school: school.name, email: founder?.email, password: founder?.password });
      e.currentTarget.reset();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const copyPw = async () => {
    if (!done?.password) return;
    try {
      await navigator.clipboard.writeText(done.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <PlusCircle size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Yeni Okul Ekle</h2>
      </div>

      {!firebaseReady || !isSuper ? (
        <p className="text-sm text-muted">
          Gerçek okul oluşturma yalnızca giriş yapmış bir süper admin hesabıyla ve
          Firebase aktifken kullanılabilir.{" "}
          <Link href="/super-admin" className="text-accent hover:text-content">
            Süper Admin Konsolu
          </Link>
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Okul Adı" name="school" placeholder="Örnek Koleji" required />
            <TextField label="Yetkili (Kurucu) Adı" name="manager" placeholder="Ad Soyad" />
            <TextField label="Telefon" name="phone" type="tel" placeholder="0 5xx xxx xx xx" />
            <TextField label="Kurucu E-posta (opsiyonel)" name="email" type="email" placeholder="kurucu@okul.com" />
            <TextField label="Öğrenci Sayısı" name="students" type="number" placeholder="500" />
            <SelectField label="Paket Türü" name="plan" items={plans} />
          </div>

          {/* Marka kimliği (white-label) — okula özgü public sayfa için */}
          <div className="mt-5 rounded-xl border border-overlay/10 bg-overlay/[0.02] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent">
              Marka Kimliği (opsiyonel)
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Şehir" name="city" placeholder="Ankara" />
              <TextField label="Logo Bağlantısı (URL)" name="logo" placeholder="https://…/logo.png" />
              <TextField label="Slogan" name="slogan" placeholder="Geleceğe açılan kapı" />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="brandColor" className="text-sm font-medium text-muted">
                  Marka Rengi
                </label>
                <input
                  id="brandColor"
                  name="brandColor"
                  type="color"
                  defaultValue="#B2C7EF"
                  className="h-11 w-full cursor-pointer rounded-xl border border-overlay/10 bg-overlay/[0.04] px-2"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <label htmlFor="about" className="text-sm font-medium text-muted">
                Tanıtım Metni
              </label>
              <textarea
                id="about"
                name="about"
                rows={2}
                placeholder="Okulunuzu kısaca tanıtın…"
                className="w-full rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
              <AlertCircle size={15} aria-hidden="true" /> {error}
            </p>
          )}

          {done && (
            <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4 text-sm">
              <p className="flex items-center gap-1.5 font-semibold text-content">
                <CheckCircle2 size={15} className="text-emerald-400" /> Okul oluşturuldu: {done.school}
              </p>
              {done.email && done.password ? (
                <p className="mt-1 flex flex-wrap items-center gap-2 text-muted">
                  Kurucu: {done.email} · Geçici şifre:{" "}
                  <span className="font-mono text-accent">{done.password}</span>
                  <button type="button" onClick={copyPw} className="text-muted hover:text-content" aria-label="Şifreyi kopyala">
                    {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                  </button>
                </p>
              ) : (
                <p className="mt-1 text-muted">
                  Kurucu/personel eklemek için{" "}
                  <Link href="/super-admin" className="text-accent hover:text-content">konsolu</Link>{" "}
                  kullanın.
                </p>
              )}
            </div>
          )}

          <PrimaryButton type="submit" size="lg" className="mt-6 w-full sm:w-fit" disabled={busy}>
            <PlusCircle size={18} aria-hidden="true" />
            {busy ? "Oluşturuluyor…" : "Okul Oluştur"}
          </PrimaryButton>
        </form>
      )}

      <Link href="/super-admin" className="mt-4 inline-flex items-center gap-1 text-xs text-muted hover:text-accent">
        Tüm okulları yönet <ArrowUpRight size={13} aria-hidden="true" />
      </Link>
    </GlassCard>
  );
}
