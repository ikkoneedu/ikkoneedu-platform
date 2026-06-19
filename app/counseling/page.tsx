import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CounselingMetrics } from "@/components/counseling/CounselingMetrics";
import { StudentWatchList } from "@/components/counseling/StudentWatchList";
import { SessionNotes } from "@/components/counseling/SessionNotes";
import { ParentMeetings } from "@/components/counseling/ParentMeetings";
import { RiskAnalysis } from "@/components/counseling/RiskAnalysis";
import { AiCounselingInsights } from "@/components/counseling/AiCounselingInsights";
import { productName } from "@/lib/constants";
import {
  counselingMetrics,
  watchListStudents,
  sessionNotes,
  parentMeetings,
  riskFactors,
  followUpPlan,
  aiInsights,
} from "@/lib/counseling-mock-data";

export const metadata: Metadata = {
  title: `Rehberlik Merkezi — ${productName}`,
  description:
    "Öğrenci gelişimini, görüşme süreçlerini ve rehberlik notlarını güvenli şekilde takip edin.",
};

export default function CounselingPage() {
  return (
    <PageShell title="Rehberlik Merkezi">
      <div className="flex flex-col gap-10">
        {/* 1. Başlık */}
        <SectionHeader
          eyebrow="Öğrenci Gelişimi"
          title="Rehberlik Merkezi"
          description="Öğrenci gelişimini, görüşme süreçlerini ve rehberlik notlarını güvenli şekilde takip edin."
        />

        {/* 2. Metrikler */}
        <CounselingMetrics metrics={counselingMetrics} />

        {/* 3. Öğrenci takip listesi */}
        <StudentWatchList students={watchListStudents} />

        {/* 4 + 5. Görüşme notları ve veli görüşmeleri */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SessionNotes notes={sessionNotes} />
          <ParentMeetings meetings={parentMeetings} />
        </div>

        {/* 6 + 7. Risk analizi ve AI önerileri */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RiskAnalysis factors={riskFactors} plan={followUpPlan} />
          <AiCounselingInsights insights={aiInsights} />
        </div>

        {/* 8. Gizlilik ve yetki uyarısı */}
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
                Bu ekrandaki öğrenci görüşme notları ve risk bilgilerine yalnızca
                yetkili rehberlik personeli rol bazlı erişim ile ulaşabilir.
                Bilgiler üçüncü kişilerle paylaşılmamalı, ekran görüntüsü
                alınmamalı ve gizlilik ilkelerine uygun şekilde saklanmalıdır.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}
