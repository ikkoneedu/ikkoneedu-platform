import type { Metadata } from "next";
import Link from "next/link";
import { Home, Clock } from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { productName } from "@/lib/constants";

/** Araç sayfası — arama motorlarında indekslenmez. */
export const metadata: Metadata = {
  title: "Yakında",
  robots: { index: false, follow: false },
};

/**
 * "Yakında" sayfası — henüz hazır olmayan özelliklerin (yardım merkezi, tema/dil
 * tercihleri vb.) yönlendirildiği nötr bilgilendirme sayfası. Dead button yerine
 * kullanıcıya net bir mesaj verir.
 */
export default function ComingSoonPage() {
  return (
    <main className="mesh-bg flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <LogoMark size={36} />
        <span className="text-lg font-semibold tracking-tight text-content">
          {productName}
        </span>
      </Link>

      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
        <Clock size={26} aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-content sm:text-4xl">
        Bu özellik yakında
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        Üzerinde çalışıyoruz. Bu bölüm çok yakında kullanıma açılacak. O zamana
        kadar mevcut panelinizden devam edebilirsiniz.
      </p>

      <div className="mt-8">
        <Link href="/">
          <PrimaryButton size="lg">
            <Home size={18} aria-hidden="true" />
            Ana Sayfaya Dön
          </PrimaryButton>
        </Link>
      </div>
    </main>
  );
}
