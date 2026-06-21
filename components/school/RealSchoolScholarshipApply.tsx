"use client";

import { SectionHeader } from "@/components/shared/SectionHeader";
import { RealSchoolShell } from "@/components/school/RealSchoolShell";
import { ScholarshipApplicationForm } from "@/components/scholarship/ScholarshipApplicationForm";
import { deriveApplicationPrefix } from "@/lib/services/scholarship-applications";

/**
 * Gerçek okul (tenant) için halka açık bursluluk başvuru sayfası.
 * /school/[slug]/scholarship/apply, statik mock okul bulamazsa bunu kullanır.
 */
export function RealSchoolScholarshipApply({ slug }: { slug: string }) {
  return (
    <RealSchoolShell slug={slug}>
      {(school) => (
        <>
          <SectionHeader
            align="center"
            eyebrow={school.name}
            title={`${school.name} Bursluluk Sınavı Başvurusu`}
            description="Çocuğunuz için bursluluk ve kabul sınavı başvurusunu birkaç dakika içinde tamamlayın."
            className="mb-10"
          />
          <ScholarshipApplicationForm
            tenantId={school.id}
            applicationPrefix={deriveApplicationPrefix(school.name)}
          />
        </>
      )}
    </RealSchoolShell>
  );
}
