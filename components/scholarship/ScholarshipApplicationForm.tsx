"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  User,
  IdCard,
  CalendarDays,
  School,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Send,
  CheckCircle2,
  Copy,
  FileText,
  MessageCircle,
  PhoneCall,
  CalendarCheck,
  AlertCircle,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";
import {
  applyFormOptions,
  applyConsents,
  applyExtras,
  sampleApplicationNo,
} from "@/lib/scholarship-exam-mock-data";
import {
  createScholarshipApplication,
  generateApplicationNo,
} from "@/lib/services/scholarship-applications";

interface ScholarshipApplicationFormProps {
  /** Başvurunun bağlı olacağı okul/tenant (okula özel sayfalarda slug resolver'dan gelir). */
  tenantId?: string;
  /** Başvuru numarası ön eki (ör. "IKK", "ATA", "DEMO"). */
  applicationPrefix?: string;
}

/**
 * Bursluluk Sınavı Başvuru Formu — halka açık (aday veli).
 * Firestore `createScholarshipApplication` servisine bağlıdır. Firebase env
 * yoksa mock modda çalışır (Firestore'a yazmaz) ve başarı ekranı gösterir.
 */
export function ScholarshipApplicationForm({
  tenantId,
  applicationPrefix = "IKK",
}: ScholarshipApplicationFormProps = {}) {
  const [submitted, setSubmitted] = useState(false);
  const [consents, setConsents] = useState<boolean[]>(
    applyConsents.map(() => false),
  );
  const [extras, setExtras] = useState<boolean[]>(applyExtras.map(() => false));
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationNo, setApplicationNo] = useState(sampleApplicationNo);

  const allConsentsAccepted = consents.every(Boolean);

  const toggleConsent = (index: number) => {
    setConsents((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const toggleExtra = (index: number) => {
    setExtras((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!allConsentsAccepted || submitting) return;

    const data = new FormData(event.currentTarget);
    const newApplicationNo = generateApplicationNo(applicationPrefix);
    setSubmitting(true);
    setError(null);

    const result = await createScholarshipApplication({
      tenantId,
      applicationNo: newApplicationNo,
      studentName: String(data.get("studentName") ?? ""),
      studentTc: String(data.get("studentTc") ?? ""),
      birthDate: String(data.get("birthDate") ?? ""),
      parentName: String(data.get("parentName") ?? ""),
      parentPhone: String(data.get("parentPhone") ?? ""),
      parentEmail: String(data.get("parentEmail") ?? ""),
      district: String(data.get("district") ?? ""),
      address: String(data.get("address") ?? ""),
    });

    setSubmitting(false);
    if (result.ok) {
      setApplicationNo(newApplicationNo);
      setSubmitted(true);
    } else {
      setError(
        "Başvurunuz şu anda gönderilemedi. Lütfen birkaç dakika sonra tekrar deneyin.",
      );
    }
  };

  // Mock kopyalama: gerçek panoya yazma denenir, başarısız olursa sessizce geçilir.
  const handleCopyApplicationNo = async () => {
    try {
      await navigator.clipboard.writeText(applicationNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleCopyWhatsApp = async () => {
    const message = `Bursluluk Sınavı başvurunuz alınmıştır. Başvuru No: ${applicationNo}. Sınav giriş belgenizi sistemden görüntüleyebilirsiniz.`;
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      // Mock: panoya yazılamazsa sessizce geçilir.
    }
  };

  if (submitted) {
    return (
      <GlassCard tone="navy" className="flex flex-col items-center gap-5 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
          <CheckCircle2 size={28} aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-content sm:text-2xl">
            Başvurunuz alınmıştır.
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Sınav giriş belgenizi aşağıdaki başvuru numarası ile
            görüntüleyebilirsiniz. Bilgilendirme için sizinle iletişime
            geçeceğiz.
          </p>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Başvuru Numaranız
          </p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="select-all text-2xl font-bold tracking-tight text-accent sm:text-3xl">
              {applicationNo}
            </span>
            <button
              type="button"
              onClick={handleCopyApplicationNo}
              aria-label="Başvuru numarasını kopyala"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted transition-colors hover:border-accent/30 hover:text-content"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            </button>
          </div>
          {copied && (
            <p className="mt-2 text-xs text-emerald-400">Kopyalandı</p>
          )}
        </div>

        <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/scholarship-exam/admission-card" className="w-full">
            <PrimaryButton size="md" className="w-full">
              <FileText size={18} aria-hidden="true" />
              Sınav Giriş Belgesini Gör
            </PrimaryButton>
          </Link>
          <PrimaryButton
            type="button"
            variant="secondary"
            size="md"
            className="w-full"
            onClick={handleCopyWhatsApp}
          >
            <MessageCircle size={18} aria-hidden="true" />
            WhatsApp Metnini Kopyala
          </PrimaryButton>
          <PrimaryButton
            type="button"
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => {}}
          >
            <PhoneCall size={18} aria-hidden="true" />
            Okulu Ara
          </PrimaryButton>
          <Link href="/demo" className="w-full">
            <PrimaryButton variant="ghost" size="md" className="w-full">
              <CalendarCheck size={18} aria-hidden="true" />
              Randevu Oluştur
            </PrimaryButton>
          </Link>
        </div>
      </GlassCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Öğrenci Bilgileri */}
      <GlassCard tone="navy">
        <h2 className="text-lg font-bold tracking-tight text-content">
          Öğrenci Bilgileri
        </h2>
        <p className="mt-1 text-sm text-muted">
          Sınava girecek öğrencinin bilgilerini eksiksiz doldurun.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Ad Soyad"
            name="studentName"
            icon={User}
            placeholder="Ad Soyad"
            required
          />
          <TextField
            label="TC Kimlik No"
            name="studentTc"
            icon={IdCard}
            inputMode="numeric"
            maxLength={11}
            placeholder="11 haneli"
            required
          />
          <TextField
            label="Doğum Tarihi"
            name="birthDate"
            type="date"
            icon={CalendarDays}
            required
          />
          <SelectField label="Mevcut Sınıf" items={applyFormOptions.grades} />
          <SelectField
            label="Mevcut Okul"
            items={applyFormOptions.currentSchools}
          />
          <SelectField
            label="Başvurulacak Sınıf"
            items={applyFormOptions.grades}
          />
          <SelectField label="Cinsiyet" items={applyFormOptions.genders} />
        </div>
      </GlassCard>

      {/* Veli Bilgileri */}
      <GlassCard tone="navy">
        <h2 className="text-lg font-bold tracking-tight text-content">
          Veli Bilgileri
        </h2>
        <p className="mt-1 text-sm text-muted">
          Sizinle iletişim kurabilmemiz için veli bilgilerini girin.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Veli Ad Soyad"
            name="parentName"
            icon={User}
            placeholder="Ad Soyad"
            required
          />
          <TextField
            label="Telefon"
            name="parentPhone"
            type="tel"
            icon={Phone}
            placeholder="0 5xx xxx xx xx"
            required
          />
          <TextField
            label="E-posta"
            name="parentEmail"
            type="email"
            icon={Mail}
            placeholder="ornek@eposta.com"
            required
          />
          <SelectField label="İl" items={applyFormOptions.cities} />
          <TextField
            label="İlçe"
            name="district"
            icon={MapPin}
            placeholder="İlçe"
          />
          <TextField
            label="Adres"
            name="address"
            icon={MapPin}
            placeholder="Açık adres"
          />
        </div>
      </GlassCard>

      {/* Tercihler */}
      <GlassCard tone="navy">
        <h2 className="text-lg font-bold tracking-tight text-content">
          Tercihler
        </h2>
        <p className="mt-1 text-sm text-muted">
          Kampüs ve oturum tercihinizi belirtin.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField label="Kampüs" items={applyFormOptions.campuses} />
          <SelectField label="Oturum" items={applyFormOptions.sessions} />
        </div>
        <div className="mt-5 space-y-3">
          {applyExtras.map((extra, index) => (
            <label
              key={extra}
              className="flex cursor-pointer items-start gap-2.5 text-sm text-muted"
            >
              <input
                type="checkbox"
                checked={extras[index]}
                onChange={() => toggleExtra(index)}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/[0.04] accent-accent"
              />
              <span>{extra}</span>
            </label>
          ))}
        </div>
      </GlassCard>

      {/* Onaylar */}
      <GlassCard tone="navy">
        <h2 className="text-lg font-bold tracking-tight text-content">
          Onaylar
        </h2>
        <p className="mt-1 text-sm text-muted">
          Başvurunuzu tamamlamak için tüm onayları işaretlemeniz gerekir.
        </p>
        <div className="mt-6 space-y-3">
          {applyConsents.map((consent, index) => (
            <label
              key={consent}
              className="flex cursor-pointer items-start gap-2.5 text-sm text-muted"
            >
              <input
                type="checkbox"
                checked={consents[index]}
                onChange={() => toggleConsent(index)}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/[0.04] accent-accent"
              />
              <span>{consent}</span>
            </label>
          ))}
        </div>
      </GlassCard>

      {/* Güvenlik */}
      <GlassCard tone="navy">
        <h2 className="text-lg font-bold tracking-tight text-content">
          Güvenlik
        </h2>
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-5 text-sm text-muted">
          <ShieldCheck size={20} className="text-accent" aria-hidden="true" />
          <span>Captcha doğrulaması (yakında)</span>
        </div>
      </GlassCard>

      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}

      <PrimaryButton
        type="submit"
        size="lg"
        className="w-full"
        disabled={!allConsentsAccepted || submitting}
      >
        <Send size={18} aria-hidden="true" />
        {submitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
      </PrimaryButton>
      {!allConsentsAccepted && (
        <p className="text-center text-xs text-muted">
          Başvuruyu göndermek için tüm onayları işaretleyin.
        </p>
      )}
    </form>
  );
}
