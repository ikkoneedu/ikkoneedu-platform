import type { Metadata } from "next";
import { KioskScreen } from "@/components/attendance/KioskScreen";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Personel Giriş / Çıkış Sistemi — ${productName}`,
  robots: { index: false, follow: false },
};

/**
 * Kiosk sayfası — okul girişindeki USB QR okuyucu (Keyboard Wedge) terminali.
 * Bilinçli olarak `PageShell` (Sidebar/Topbar) KULLANMAZ: tam ekran, kiosk
 * mantığında, uygulama kabuğundan bağımsız çalışır. Kamera KULLANILMAZ.
 */
export default function AttendanceKioskPage() {
  return <KioskScreen />;
}
