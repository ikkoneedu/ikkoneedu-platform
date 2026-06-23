"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Korumalı sayfalar için client-side guard hook'u.
 *
 * Oturum çözüldükten sonra kullanıcı yoksa `/login`e yönlendirir
 * (geldiği yolu `redirect` parametresiyle taşır).
 *
 * NOT: Firebase env tanımlı değilse dev'de Mock Mod bozulmaz; production'da
 * korumalı sayfa bileşenleri güvenli başarısız olur.
 */
export function useRequireAuth() {
  const { user, profile, loading, firebaseReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!firebaseReady) {
      if (!isProduction) return; // Dev Mock Mod: mevcut akışı bozma.
      return;
    }
    if (loading) return;
    if (!user) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
    }
  }, [user, loading, firebaseReady, pathname, router]);

  return { user, profile, loading };
}
