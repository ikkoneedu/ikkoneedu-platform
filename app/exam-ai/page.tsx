import type { Metadata } from "next";
import Link from "next/link";
import { Wand2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `AI Sınav Oluşturucu — ${productName}`,
  description: "Yapay zeka destekli sınav ve quiz oluşturucu.",
};

/**
 * AI Sınav Oluşturucu — geçici yer tutucu.
 * Öğretmen portalı "Sınav Oluştur" akışının yönlendirme hedefi.
 */
export default function ExamAiPage() {
  return (
    <div className="mesh-bg flex min-h-screen w-full items-center justify-center px-4 py-10">
      <GlassCard tone="navy" className="max-w-md text-center sm:p-10">
        <div className="mb-5 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-navy/50 text-accent">
            <Wand2 size={26} aria-hidden="true" />
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-content">
          AI Sınav Oluşturucu
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Yapay zeka destekli sınav ve quiz oluşturma ekranı yakında hazır
          olacak.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/teacher">
            <PrimaryButton variant="secondary" size="lg">
              Öğretmen Portalına Dön
            </PrimaryButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
