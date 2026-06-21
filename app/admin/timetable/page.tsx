import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ClassStructureManager } from "@/components/admin/ClassStructureManager";
import { TimetableGenerator } from "@/components/schedule/TimetableGenerator";
import { TimetableManager } from "@/components/schedule/TimetableManager";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Ders Programı ve Sınıflar — ${productName}`,
  description:
    "Kademe ve şubeleri tanımlayın, sınıf öğretmeni ve dersleri girin, çakışmasız ders programını otomatik oluşturun.",
};

export default function AdminTimetablePage() {
  return (
    <PageShell title="Ders Programı ve Sınıflar">
      <div className="flex flex-col gap-12">
        {/* 1) Sınıf yapısı: kademe + şube */}
        <div className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="1. Adım · Okul Yapısı"
            title="Sınıf Yapısı"
            description="Her kademe için şube sayısını girin; sistem şubeleri otomatik üretir. Örn. 1. sınıf 4 şube, 2. sınıf 5 şube, 4. sınıf 7 şube."
          />
          <ClassStructureManager />
        </div>

        {/* 2) Otomatik program: sınıf öğretmeni + ders havuzu + çakışmasız üretim */}
        <div className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="2. Adım · Otomatik Program"
            title="Çakışmasız Ders Programı"
            description="Sınıf öğretmenini atayın, dersleri ve haftalık saatlerini girin; sistem tüm okulu çakışmasız ve dengeli otomatik yerleştirir, PDF çıktısı verir."
          />
          <TimetableGenerator />
        </div>

        {/* 3) Manuel ince ayar */}
        <div className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="3. Adım · İnce Ayar (opsiyonel)"
            title="Manuel Düzenleme"
            description="Otomatik oluşturulan programı hücre hücre elle düzeltin; ders ekleyin, değiştirin veya silin."
          />
          <TimetableManager />
        </div>
      </div>
    </PageShell>
  );
}
