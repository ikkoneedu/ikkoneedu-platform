import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ScholarshipDashboard } from "@/components/scholarship/ScholarshipDashboard";
import { ScholarshipExamBuilder } from "@/components/scholarship/ScholarshipExamBuilder";
import { ScholarshipContentManager } from "@/components/scholarship/ScholarshipContentManager";
import { ScholarshipApplicationsTable } from "@/components/scholarship/ScholarshipApplicationsTable";
import { ClassPlacementAdvisor } from "@/components/scholarship/ClassPlacementAdvisor";
import { AiSessionPlanner } from "@/components/scholarship/AiSessionPlanner";
import { RoomSeatPlanner } from "@/components/scholarship/RoomSeatPlanner";
import { ProctorAssignment } from "@/components/scholarship/ProctorAssignment";
import { AdmissionCardManager } from "@/components/scholarship/AdmissionCardManager";
import { ScholarshipResultEngine } from "@/components/scholarship/ScholarshipResultEngine";
import { ScholarshipCRMConversion } from "@/components/scholarship/ScholarshipCRMConversion";
import { productName } from "@/lib/constants";
import { activeExam } from "@/lib/scholarship-exam-mock-data";

export const metadata: Metadata = {
  title: `Bursluluk Sınavı Yönetimi — ${productName}`,
  description:
    "Okulunuza özel bursluluk sınavlarını oluşturun, başvuruları yönetin ve kayıt dönüşümünü takip edin.",
};

export default function ScholarshipExamPage() {
  return (
    <PageShell title="Bursluluk Sınavı Yönetimi">
      <div className="flex flex-col gap-10">
        {/* Başlık */}
        <SectionHeader
          eyebrow={`Aktif Sınav · ${activeExam.name}`}
          title="Bursluluk Sınavı Yönetimi"
          description="Okulunuza özel bursluluk sınavlarını oluşturun, başvuruları yönetin ve kayıt dönüşümünü takip edin."
        />

        {/* 1. Genel durum panosu */}
        <ScholarshipDashboard />

        {/* 2 + 3. Sınav oluşturucu ve içerik */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ScholarshipExamBuilder />
          <ScholarshipContentManager />
        </div>

        {/* 4. Başvuru yönetimi (tam genişlik) */}
        <ScholarshipApplicationsTable />

        {/* 5 + 6. Yerleştirme ve AI oturum planlama */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ClassPlacementAdvisor />
          <AiSessionPlanner />
        </div>

        {/* 7. Salon / sıra yerleşimi */}
        <RoomSeatPlanner />

        {/* 8. Gözetmen atama */}
        <ProctorAssignment />

        {/* 9. Sınav giriş belgesi */}
        <AdmissionCardManager />

        {/* 10 + 11. Sonuç ve CRM dönüşümü */}
        <ScholarshipResultEngine />
        <ScholarshipCRMConversion />
      </div>
    </PageShell>
  );
}
