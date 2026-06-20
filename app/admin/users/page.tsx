import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StaffManager } from "@/components/admin/StaffManager";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Personel ve Kullanıcılar — ${productName}`,
  description:
    "Okulunuzun öğretmen ve müdür hesaplarını oluşturun, kullanıcıları yönetin.",
};

export default function AdminUsersPage() {
  return (
    <PageShell title="Personel ve Kullanıcılar">
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Okul Yönetimi"
          title="Personel ve Kullanıcılar"
          description="Öğretmen ve müdür hesapları oluşturun (geçici şifre ile), okulunuzdaki tüm kullanıcıları görüntüleyin."
        />
        <StaffManager />
      </div>
    </PageShell>
  );
}
