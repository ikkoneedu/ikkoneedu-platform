import { NextResponse, type NextRequest } from "next/server";
import { isProtectedRoute } from "@/lib/auth/route-config";

/**
 * Güvenlik ve route koruma middleware'i.
 *
 * MEVCUT DURUM: Gerçek kimlik doğrulama YOK. Bu middleware şu an hiçbir isteği
 * engellemez; yalnızca güvenlik header'larını pekiştirir ve korumalı route'ları
 * işaretler. Mimari, Firebase Auth bağlandığında tek noktadan koruma sağlayacak
 * şekilde hazırlanmıştır.
 *
 * FIREBASE BAĞLANINCA:
 *   1. `AUTH_ENABLED` true yapılır.
 *   2. Oturum çerezi/ID token (`__session`) doğrulanır (Edge uyumlu doğrulama
 *      veya hafif bir kontrol + sayfa tarafında tam doğrulama).
 *   3. `isProtectedRoute(pathname)` true ve oturum yoksa `/login`e yönlendirilir.
 *   4. `getRequiredRoles(pathname)` ile claim'lerdeki rol kontrol edilir.
 */
const AUTH_ENABLED = false;
const SESSION_COOKIE = "__session";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const response = NextResponse.next();

  // Korumalı route'ları aşağı akışta tanımak için işaretle (debug/analiz amaçlı).
  const protectedRoute = isProtectedRoute(pathname);
  if (protectedRoute) {
    response.headers.set("x-route-protected", "1");
  }

  // Güvenlik header'larının her yanıtta bulunmasını garanti et.
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Firebase Auth bağlanınca devreye girecek koruma (şu an pasif).
  if (AUTH_ENABLED && protectedRoute) {
    const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

/**
 * Statik dosyalar, görseller ve Next iç kaynakları hariç tüm yollar.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
};
