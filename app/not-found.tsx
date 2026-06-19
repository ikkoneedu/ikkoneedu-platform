import type { Metadata } from "next";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="mesh-bg flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <LogoMark size={36} />
        <span className="text-lg font-semibold tracking-tight text-content">
          {productName}
        </span>
      </Link>

      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-content sm:text-4xl">
        Aradığınız sayfa bulunamadı
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        Sayfa taşınmış veya hiç var olmamış olabilir. Ana sayfaya dönerek devam
        edebilirsiniz.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <PrimaryButton size="lg">
            <Home size={18} aria-hidden="true" />
            Ana Sayfaya Dön
          </PrimaryButton>
        </Link>
        <Link href="/features">
          <PrimaryButton variant="secondary" size="lg">
            <ArrowLeft size={18} aria-hidden="true" />
            Özellikleri İncele
          </PrimaryButton>
        </Link>
      </div>
    </main>
  );
}
