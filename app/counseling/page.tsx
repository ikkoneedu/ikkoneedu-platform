import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CounselingNotesManager } from "@/components/counseling/CounselingNotesManager";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Rehberlik Merkezi — ${productName}`,
  description:
    "Öğrenci gelişimini, görüşme süreçlerini ve rehberlik notlarını güvenli şekilde takip edin.",
};

export default function CounselingPage() {
  return (
    <PageShell title="Rehberlik Merkezi">
      <div className="flex flex-col gap-10">
        <SectionHeader
          eyebrow="Öğrenci Gelişimi"
          title="Rehberlik Merkezi"
          description="Öğrenci görüşme notlarını ve rehberlik kayıtlarını güvenli şekilde takip edin."
        />

        {/* Canlı rehberlik görüşme notları (gerçek Firestore).
            Mock metrik/izleme listesi/risk/AI bölümleri kaldırıldı; bu hassas
            alanda yalnızca gerçek kayıtlar gösterilir. */}
        <CounselingNotesManager />

        {/* Gizlilik ve yetki uyarısı (statik bilgilendirme) */}
        <GlassCard tone="navy" className="border-white/10">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-navy/40 text-muted">
              <ShieldCheck size={18} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-content">
                Gizlilik ve Yetki Uyarısı
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Rehberlik kayıtları KVKK kapsamında hassas veri olarak işlenir.
                Bu ekrandaki öğrenci görüşme notlarına yalnızca yetkili rehberlik
                personeli rol bazlı erişim ile ulaşabilir. Bilgiler üçüncü
                kişilerle paylaşılmamalı ve gizlilik ilkelerine uygun saklanmalıdır.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}
