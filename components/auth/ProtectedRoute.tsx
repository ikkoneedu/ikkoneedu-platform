"use client";

import type { ReactNode } from "react";
import { useRequireAuth } from "@/components/auth/useRequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Client-side korumalı route sarmalayıcısı (hazırlık).
 *
 * Kullanım (ileride bir korumalı sayfada):
 *   <ProtectedRoute><AdminDashboard /></ProtectedRoute>
 *
 * - Firebase env yoksa (Mock Mod) içerik doğrudan render edilir (mevcut akış korunur).
 * - Oturum çözülürken minimal bir yükleniyor durumu gösterir.
 * - Oturum yoksa `useRequireAuth` `/login`e yönlendirir.
 *
 * Şu an mevcut sayfalara UYGULANMAMIŞTIR; mimari hazır dursun diye eklenmiştir.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { firebaseReady } = useAuth();
  const { user, loading } = useRequireAuth();

  // Mock Mod: koruma uygulanmaz, mevcut akış korunur.
  if (!firebaseReady) return <>{children}</>;

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
