import type { Metadata } from "next";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SchoolPublicShell } from "@/components/school/SchoolPublicShell";
import { ScholarshipResultsLookup } from "@/components/scholarship/ScholarshipResultsLookup";
import { RealSchoolScholarshipResults } from "@/components/school/RealSchoolScholarshipResults";
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
      ? `${school.schoolName} Sonuç Sorgulama — ${productName}`
      : `Sonuç Sorgulama — ${productName}`,
  };
}

export default async function SchoolResultsPage({ params }: PageProps) {
  const { slug } = await params;
  const school = getPublicSchoolBySlug(slug);
  // Statik mock okul yoksa gerçek tenant için sonuç sorgulama (canlı Firestore).
  if (!school) return <RealSchoolScholarshipResults slug={slug} />;

  return (
    <SchoolPublicShell school={school}>
      <SectionHeader
        align="center"
        eyebrow={school.schoolName}
        title={`${school.schoolName} Bursluluk Sonuç Sorgulama`}
        description="TC Kimlik No ve başvuru numaranızla sınav sonucunuzu ve burs oranınızı görüntüleyin."
        className="mb-10"
      />
      <ScholarshipResultsLookup />
    </SchoolPublicShell>
  );
}
