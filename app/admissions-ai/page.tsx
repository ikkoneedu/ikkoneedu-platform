import type { Metadata } from "next";
import { AiComingSoonNotice } from "@/components/ai/AiComingSoonNotice";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AdmissionsBoard } from "@/components/admissions/AdmissionsBoard";
import { AiAdvisorChat } from "@/components/admissions/AiAdvisorChat";
import { AdmissionsFunnel } from "@/components/admissions/AdmissionsFunnel";
import { CandidateProfiles } from "@/components/admissions/CandidateProfiles";
import { AppointmentAssistant } from "@/components/admissions/AppointmentAssistant";
import { AdmissionsFAQ } from "@/components/admissions/AdmissionsFAQ";
import { AdmissionsInsights } from "@/components/admissions/AdmissionsInsights";
import { LeadManagementPreview } from "@/components/admissions/LeadManagementPreview";
import { AdmissionsActions } from "@/components/admissions/AdmissionsActions";
import { productName } from "@/lib/constants";
import {
  admissionsChat,
  admissionsChatActions,
  admissionsFunnel,
  candidateParents,
  appointmentFields,
  admissionsFaq,
  admissionsInsights,
  leadFields,
  admissionsActions,
} from "@/lib/admissions-ai-mock-data";

export const metadata: Metadata = {
  title: `AI Kayıt Danışmanı — ${productName}`,
  description:
    "Aday velilerin sorularını yanıtlayan, randevuya yönlendiren ve kayıt dönüşümünü artıran yapay zeka destekli danışman.",
};

export default function AdmissionsAiPage() {
  return (
    <PageShell title="AI Kayıt Danışmanı">
      <div className="flex flex-col gap-10">
        <AiComingSoonNotice />

        {/* 1. Başlık */}
        <SectionHeader
          eyebrow="Kayıt"
          title="AI Kayıt Danışmanı"
          description="Aday velilerin sorularını yanıtlayan, randevuya yönlendiren ve kayıt dönüşümünü artıran yapay zeka destekli danışman."
        />

        {/* Kayıt Kabul operasyon panosu (gerçek Firestore — AI yok) */}
        <AdmissionsBoard />

        {/* 2 + 3. Danışman önizleme ve funnel */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AiAdvisorChat initialMessages={admissionsChat} actions={admissionsChatActions} />
          <AdmissionsFunnel stages={admissionsFunnel} />
        </div>

        {/* 4. Aday veli profili */}
        <CandidateProfiles candidates={candidateParents} />

        {/* 5 + 6. Randevu asistanı ve SSS */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AppointmentAssistant fields={appointmentFields} />
          <AdmissionsFAQ questions={admissionsFaq} />
        </div>

        {/* 7. AI içgörüleri */}
        <AdmissionsInsights insights={admissionsInsights} />

        {/* 8. CRM hazırlığı */}
        <LeadManagementPreview fields={leadFields} />

        {/* 9. Hızlı aksiyonlar */}
        <AdmissionsActions actions={admissionsActions} />
      </div>
    </PageShell>
  );
}
