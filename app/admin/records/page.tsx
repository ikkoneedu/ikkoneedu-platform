import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SchoolRecordsManager } from "@/components/admin/SchoolRecordsManager";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Öğrenci, Veli, Öğretmen ve Sınıflar — ${productName}`,
  description:
    "Okulunuzun öğrenci, veli, öğretmen ve sınıf kayıtlarını gerçek verilerle yönetin.",
};

export default function AdminRecordsPage() {
  return (
    <PageShell title="Okul Kayıtları">
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Okul Yönetimi"
          title="Öğrenci · Veli · Öğretmen · Sınıf"
          description="Kayıtları oluşturun, güncelleyin, sınıflara ve velilere bağlayın. İlişkiler iki taraflı tutulur; pasifleştirme soft delete'tir."
        />
        <SchoolRecordsManager />
      </div>
    </PageShell>
  );
}
