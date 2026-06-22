import { NextResponse, type NextRequest } from "next/server";
import { isProtectedRoute } from "@/lib/auth/route-config";

/**
 * Güvenlik ve route koruma middleware'i.
 *
 * KORUMA STRATEJİSİ (bilinçli karar):
 *   Bu middleware YALNIZCA güvenlik header'ları ekler; route YETKİLENDİRMESİ
 *   yapmaz. Yetkilendirme tek noktadan, İSTEMCİ tarafında `RoleGuard` ile
 *   yapılır: her korumalı segmentin `layout.tsx` dosyası `<RoleGuard>` sarmalar
 *   ve `lib/auth/route-config.ts`'teki rol haritasını uygular. Bu sayede yarım
 *   çalışan/oturumu bozan bir middleware riski olmaz.
 *
 *   Not: İstemci tarafı koruma, kullanıcı deneyimi ve UX yönlendirmesi içindir;
 *   GERÇEK veri güvenliği Firestore Security Rules ile sağlanır (sunucu tarafı).
 *
 * SUNUCU TARAFI KORUMAYA GEÇİŞ (gelecekte, Admin SDK ile):
 *   `AUTH_ENABLED` true yapılır; `__session` oturum çerezi Edge'de doğrulanır;
 *   `isProtectedRoute`/`getRequiredRoles` ile sunucuda da yönlendirme yapılır.
 *   Şu an bu yol PASİFTİR (riskli yarım entegrasyon eklemiyoruz).
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
  response.headers.set("X-Frame-Options", "DENY");

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
