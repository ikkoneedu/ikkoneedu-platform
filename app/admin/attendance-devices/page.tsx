import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AttendanceDevicesManager } from "@/components/admin/AttendanceDevicesManager";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Kiosk QR Okuyucu Cihazları — ${productName}`,
};

export default function AttendanceDevicesPage() {
  return (
    <PageShell title="Kiosk QR Okuyucu Cihazları">
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Personel Devam Sistemi"
          title="Kiosk QR Okuyucu Cihazları"
          description="Okul girişindeki USB QR okuyucu terminallerini tanımlayın, aktif/pasif yapın. Kamera kullanılmaz — fiziksel Keyboard Wedge okuyucu ile çalışır."
        />
        <AttendanceDevicesManager />
      </div>
    </PageShell>
  );
}
