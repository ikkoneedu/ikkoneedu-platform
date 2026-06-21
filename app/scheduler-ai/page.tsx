import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SchedulerHero } from "@/components/scheduler/SchedulerHero";
import { SchedulerForm } from "@/components/scheduler/SchedulerForm";
import { RulePanel } from "@/components/scheduler/RulePanel";
import { WeeklyTimetable } from "@/components/scheduler/WeeklyTimetable";
import { ConflictAnalysis } from "@/components/scheduler/ConflictAnalysis";
import { AiScheduleSuggestions } from "@/components/scheduler/AiScheduleSuggestions";
import { ScheduleExportActions } from "@/components/scheduler/ScheduleExportActions";
import { productName } from "@/lib/constants";
import {
  schedulerFormOptions,
  schedulerSmartRules,
  schedulerDays,
  schedulerHours,
  schedulerTimetable,
  schedulerConflictAnalysis,
  schedulerAiSuggestions,
} from "@/lib/scheduler-mock-data";

export const metadata: Metadata = {
  title: `AI Ders Programı Oluşturucu — ${productName}`,
  description:
    "Öğretmen, sınıf, ders ve kurum kurallarını dikkate alarak çakışmasız haftalık ders programları oluşturun.",
};

export default function SchedulerAiPage() {
  return (
    <PageShell title="AI Ders Programı Oluşturucu">
      <div className="flex flex-col gap-10">
        <SectionHeader
          eyebrow="Yapay Zeka"
          title="AI Ders Programı Oluşturucu"
          description="Öğretmen, sınıf, ders ve kurum kurallarını dikkate alarak çakışmasız haftalık ders programları oluşturun."
        />

        {/* 1. Hero */}
        <SchedulerHero />

        {/* 2 + 3. Form ve kural paneli */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SchedulerForm options={schedulerFormOptions} />
          <RulePanel rules={schedulerSmartRules} />
        </div>

        {/* 4. Haftalık program */}
        <WeeklyTimetable
          days={schedulerDays}
          hours={schedulerHours}
          timetable={schedulerTimetable}
        />

        {/* 5 + 6. Çakışma analizi ve AI önerileri */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ConflictAnalysis data={schedulerConflictAnalysis} />
          <AiScheduleSuggestions suggestions={schedulerAiSuggestions} />
        </div>

        {/* 7. Kaydet / Dışa aktar */}
        <ScheduleExportActions
          days={schedulerDays}
          hours={schedulerHours}
          timetable={schedulerTimetable}
        />
      </div>
    </PageShell>
  );
}
