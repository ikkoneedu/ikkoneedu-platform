import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

interface PageShellProps {
  children: ReactNode;
  /** Üst çubukta gösterilecek sayfa başlığı. */
  title?: string;
}

/**
 * Uygulama iskeleti.
 * Sidebar (masaüstü), Topbar ve MobileBottomNav (mobil) ile tutarlı bir
 * uygulama düzeni sağlar. Sonraki tüm sayfalar bu kabuğu kullanır.
 * Mobil ve masaüstünde responsive çalışır.
 */
export function PageShell({ children, title }: PageShellProps) {
  return (
    <div className="bg-radial-glow min-h-screen w-full lg:pl-64">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar title={title} />

        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
