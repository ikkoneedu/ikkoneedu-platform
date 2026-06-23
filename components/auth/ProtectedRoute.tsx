"use client";

import type { ReactNode } from "react";
import { useRequireAuth } from "@/components/auth/useRequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Client-side korumalı route sarmalayıcısı (hazırlık).
 *
 * Kullanım (ileride bir korumalı sayfada):
 *   <ProtectedRoute><AdminDashboard /></ProtectedRoute>
 *
 * - Firebase env yoksa dev'de Mock Mod korunur; production'da içerik kilitlenir.
 * - Oturum çözülürken minimal bir yükleniyor durumu gösterir.
 * - Oturum yoksa `useRequireAuth` `/login`e yönlendirir.
 *
 * Şu an mevcut sayfalara UYGULANMAMIŞTIR; mimari hazır dursun diye eklenmiştir.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { firebaseReady } = useAuth();
  const { user, loading } = useRequireAuth();

  // Mock Mod: dev'de koruma uygulanmaz, production'da güvenli başarısız ol.
  if (!firebaseReady) {
    if (!isProduction) return <>{children}</>;
    return (
      <main className="mesh-bg flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-content">
          Firebase yapılandırması eksik
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Bu korumalı sayfa production ortamında Firebase Auth yapılandırması
          olmadan açılamaz.
        </p>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="mesh-bg flex min-h-screen w-full items-center justify-center">
        <span className="h-1.5 w-24 animate-pulse rounded-full bg-accent/60" />
        <span className="sr-only">Yükleniyor…</span>
      </div>
    );
  }

  if (!user) return null; // Yönlendirme useRequireAuth tarafından yapılır.

  return <>{children}</>;
}
