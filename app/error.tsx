"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home, AlertTriangle } from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { productName } from "@/lib/constants";

/**
 * Segment hata sınırı (error boundary).
 * Beklenmeyen çalışma zamanı hatalarında premium, minimal bir ekran gösterir.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Üretimde gerçek bir hata izleme servisine gönderilebilir (ileride).
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <main className="mesh-bg flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <LogoMark size={36} />
        <span className="text-lg font-semibold tracking-tight text-content">
          {productName}
        </span>
      </Link>

      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
        <AlertTriangle size={28} aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-content sm:text-3xl">
        Bir şeyler ters gitti
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        Beklenmeyen bir hata oluştu. Sayfayı yeniden deneyebilir veya ana sayfaya
        dönebilirsiniz.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <PrimaryButton size="lg" onClick={reset}>
          <RotateCcw size={18} aria-hidden="true" />
          Yeniden Dene
        </PrimaryButton>
        <Link href="/">
          <PrimaryButton variant="secondary" size="lg">
            <Home size={18} aria-hidden="true" />
            Ana Sayfaya Dön
          </PrimaryButton>
        </Link>
      </div>
    </main>
  );
}
