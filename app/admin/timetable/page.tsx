import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ClassStructureManager } from "@/components/admin/ClassStructureManager";
import { TimetableManager } from "@/components/schedule/TimetableManager";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Ders Programı ve Sınıflar — ${productName}`,
  description:
    "Kademe ve şubeleri tanımlayın, sınıf bazlı haftalık ders programını oluşturun.",
};

export default function AdminTimetablePage() {
  return (
    <PageShell title="Ders Programı ve Sınıflar">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="Okul Yapısı"
            title="Sınıf Yapısı"
            description="Her kademe için şube sayısını girin; sistem şubeleri otomatik üretir. Örn. 1. sınıf 4 şube, 2. sınıf 5 şube, 4. sınıf 7 şube."
          />
          <ClassStructureManager />
        </div>

        <div className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="Haftalık Plan"
            title="Ders Programı"
            description="Bir sınıf seçin ve haftalık ders programını gün × saat ızgarasında oluşturun. Saat dilimleri okul ayarlarından gelir."
          />
          <TimetableManager />
        </div>
      </div>
    </PageShell>
  );
}
