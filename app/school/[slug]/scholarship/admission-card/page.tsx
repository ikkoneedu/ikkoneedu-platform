import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SchoolPublicShell } from "@/components/school/SchoolPublicShell";
import { AdmissionCardLookup } from "@/components/scholarship/AdmissionCardLookup";
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
      ? `${school.schoolName} Sınav Giriş Belgesi — ${productName}`
      : `Sınav Giriş Belgesi — ${productName}`,
  };
}

export default async function SchoolAdmissionCardPage({ params }: PageProps) {
  const { slug } = await params;
  const school = getPublicSchoolBySlug(slug);
  if (!school) notFound();

  return (
    <SchoolPublicShell school={school}>
      <SectionHeader
        align="center"
        eyebrow={school.schoolName}
        title={`${school.schoolName} Sınav Giriş Belgesi`}
        description="TC Kimlik No ve başvuru numaranızla sınav giriş belgenizi görüntüleyin."
        className="mb-10"
      />
      <AdmissionCardLookup />
    </SchoolPublicShell>
  );
}
