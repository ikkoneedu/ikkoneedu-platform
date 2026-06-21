import type { Metadata } from "next";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SchoolPublicShell } from "@/components/school/SchoolPublicShell";
import { ScholarshipApplicationForm } from "@/components/scholarship/ScholarshipApplicationForm";
import { RealSchoolScholarshipApply } from "@/components/school/RealSchoolScholarshipApply";
import { PUBLIC_SCHOOLS, getPublicSchoolBySlug } from "@/lib/tenant/tenant-config";
import { productName } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PUBLIC_SCHOOLS.map((school) => ({ slug: school.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const school = getPublicSchoolBySlug(slug);
  return {
    title: school
      ? `${school.schoolName} Bursluluk Başvurusu — ${productName}`
      : `Bursluluk Başvurusu — ${productName}`,
  };
}

export default async function SchoolScholarshipApplyPage({ params }: PageProps) {
  const { slug } = await params;
  const school = getPublicSchoolBySlug(slug);
  // Statik mock okul yoksa gerçek tenant için başvuru sayfasını göster.
  if (!school) return <RealSchoolScholarshipApply slug={slug} />;

  return (
    <SchoolPublicShell school={school}>
      <SectionHeader
        align="center"
        eyebrow={school.schoolName}
        title={`${school.schoolName} Bursluluk Sınavı Başvurusu`}
        description="Çocuğunuz için bursluluk ve kabul sınavı başvurusunu birkaç dakika içinde tamamlayın."
        className="mb-10"
      />
      <ScholarshipApplicationForm
        tenantId={school.tenantId}
        applicationPrefix={school.applicationPrefix}
      />
    </SchoolPublicShell>
  );
}
