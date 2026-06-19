"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Korumalı sayfalar için client-side guard hook'u.
 *
 * Oturum çözüldükten sonra kullanıcı yoksa `/login`e yönlendirir
 * (geldiği yolu `redirect` parametresiyle taşır).
 *
 * NOT: Firebase env tanımlı değilse (Mock Mod) yönlendirme yapılmaz; mevcut
 * mock akış bozulmaz. Server-side koruma (middleware) ileride aktifleşecektir.
 */
export function useRequireAuth() {
  const { user, profile, loading, firebaseReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!firebaseReady) return; // Mock Mod: mevcut akışı bozma.
    if (loading) return;
    if (!user) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
    }
  }, [user, loading, firebaseReady, pathname, router]);

  return { user, profile, loading };
}
