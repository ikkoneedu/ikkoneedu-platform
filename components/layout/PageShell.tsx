import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
}

/**
 * Sayfa iskeleti.
 * İçeriği ortalar, kenar boşluklarını ve maksimum genişliği yönetir.
 * Mobil ve masaüstü için uyumlu temel düzeni sağlar.
 */
export function PageShell({ children }: PageShellProps) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">{children}</div>
    </main>
  );
}
