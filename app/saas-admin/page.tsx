import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `SaaS Yönetimi — ${productName}`,
  description: "Çoklu okul SaaS yönetim paneli.",
};

/**
 * SaaS yönetim ekranı — geçici yer tutucu.
 * "Yeni Okul Ekle" akışının yönlendirme hedefi; detaylı tasarım sonra gelecek.
 */
export default function SaasAdminPage() {
  return (
    <div className="mesh-bg flex min-h-screen w-full items-center justify-center px-4 py-10">
      <GlassCard tone="navy" className="max-w-md text-center sm:p-10">
        <div className="mb-5 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-navy/50 text-accent">
            <Building2 size={26} aria-hidden="true" />
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-content">
          SaaS Yönetimi
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Yeni okul ekleme ve çoklu okul SaaS yönetimi ekranı yakında hazır
          olacak.
        </p>
        <div className="mt-6">
          <Link href="/school-select">
            <PrimaryButton variant="secondary" size="lg" className="w-full sm:w-auto">
              Okul Seçimine Dön
            </PrimaryButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
