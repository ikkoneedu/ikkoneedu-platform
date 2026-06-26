import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { LessonPlansBoard } from "@/components/lesson-plans/LessonPlansBoard";
import { productName } from "@/lib/constants";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t("schoolLife.lessonPlans.meta.title", { product: productName }),
    description: t("schoolLife.lessonPlans.meta.description"),
  };
}

export default async function LessonPlansPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("schoolLife.lessonPlans.page.title")}>
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow={t("schoolLife.lessonPlans.section.eyebrow")}
          title={t("schoolLife.lessonPlans.section.title")}
          description={t("schoolLife.lessonPlans.section.description")}
        />
        <LessonPlansBoard />
      </div>
    </PageShell>
  );
}
