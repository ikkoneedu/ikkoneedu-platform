"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  School,
  Users,
  Check,
  ShieldCheck,
} from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { productName, productFullName, tagline } from "@/lib/constants";

const benefits = [
  { id: "okul", icon: School, text: "Tek platformda okul yönetimi" },
  { id: "ai", icon: Sparkles, text: "Yapay zeka destekli eğitim süreçleri" },
  {
    id: "deneyim",
    icon: Users,
    text: "Veli, öğrenci, öğretmen ve yönetim için tek deneyim",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function LoginPage() {
  const router = useRouter();

  // Mock giriş: gerçek auth yok, doğrudan okul seçimine yönlendirir.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/school-select");
  };

  return (
    <div className="mesh-bg relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      {/* Premium degrade ışımalar */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-navy/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Sol taraf — marka ve faydalar */}
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center gap-3">
            <LogoMark size={48} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-content">
                {productName}
              </h1>
              <p className="text-xs text-muted">{productFullName}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-lg font-medium text-accent">
              Türkiye&apos;nin Yapay Zeka Destekli Eğitim İşletim Sistemi
            </p>
            <p className="max-w-md text-2xl font-bold leading-snug tracking-tight text-content sm:text-3xl">
              {tagline}
            </p>
          </div>

          <ul className="mt-2 space-y-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <li key={benefit.id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-navy/40 text-accent">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="text-sm text-muted sm:text-base">
                    {benefit.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </motion.section>

        {/* Sağ taraf — giriş kartı */}
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          <GlassCard tone="navy" className="sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-content sm:text-2xl">
              Hesabınıza Giriş Yapın
            </h2>
            <p className="mt-1 text-sm text-muted">
              Devam etmek için bilgilerinizi girin.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <TextField
                label="E-posta"
                name="email"
                type="email"
                icon={Mail}
                placeholder="ornek@okul.com"
                autoComplete="email"
                required
              />

              <TextField
                label="Şifre"
                name="password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-muted">
                  <input
                    type="checkbox"
                    name="remember"
                    className="h-4 w-4 rounded border-white/20 bg-white/[0.04] text-accent accent-accent focus:ring-accent"
                  />
                  Beni hatırla
                </label>
                <button
                  type="button"
                  className="font-medium text-accent transition-colors hover:text-content"
                >
                  Şifremi unuttum
                </button>
              </div>

              <PrimaryButton type="submit" size="lg" className="w-full">
                Giriş Yap
                <ArrowRight size={18} aria-hidden="true" />
              </PrimaryButton>

              <PrimaryButton
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => router.push("/school-select")}
              >
                <Sparkles size={18} aria-hidden="true" />
                Demo Hesapla Giriş
              </PrimaryButton>

              <PrimaryButton
                type="button"
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={() => router.push("/super-admin")}
              >
                <ShieldCheck size={18} aria-hidden="true" />
                Super Admin Demo Girişi
              </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Okulunuzu sisteme taşımak için{" "}
              <Link
                href="/demo"
                className="font-semibold text-accent transition-colors hover:text-content"
              >
                demo talep edin
              </Link>
            </p>
          </GlassCard>
        </motion.section>
      </div>
    </div>
  );
}
