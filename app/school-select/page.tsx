import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/shared/LogoMark";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Kampüs Seçimi — ${productName}`,
  description: "Devam etmek için bir kampüs seçin.",
};

/**
 * Kampüs/okul seçim ekranı — geçici yer tutucu.
 * Giriş akışının yönlendirme hedefi; detaylı tasarım sonraki adımda gelecek.
 */
export default function SchoolSelectPage() {
  return (
    <div className="mesh-bg flex min-h-screen w-full items-center justify-center px-4 py-10">
      <GlassCard tone="navy" className="max-w-md text-center sm:p-10">
        <div className="mb-5 flex justify-center">
          <LogoMark size={52} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-content">
          Kampüs Seçimi
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Bu ekran yakında hazır olacak. Devam etmek için yönetim panelini
          görüntüleyebilirsiniz.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/admin">
            <PrimaryButton size="lg" className="w-full sm:w-auto">
              Yönetim Paneli
            </PrimaryButton>
          </Link>
          <Link href="/login">
            <PrimaryButton variant="secondary" size="lg" className="w-full sm:w-auto">
              Girişe Dön
            </PrimaryButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
