import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const isVercel = process.env.VERCEL === "1";
const vercelLiveSource = isVercel ? " https://vercel.live" : "";

/**
 * Content-Security-Policy.
 *
 * Geliştirme ortamını bozmamak için:
 * - dev'de `'unsafe-eval'` (React Fast Refresh / HMR) ve `ws:` (HMR soketi) açıktır.
 * - `'unsafe-inline'` script/style Next.js bootstrap ve Tailwind/Framer Motion
 *   satır içi stilleri için gereklidir (nonce'a geçilene kadar).
 * - `connect-src https: wss:` ileride Firebase (Firestore/Auth) bağlantısı için
 *   hazırdır; ek koda gerek kalmaz.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${vercelLiveSource}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https: wss:${isDev ? " ws:" : ""}`,
  `frame-src 'self'${vercelLiveSource}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Strict-Transport-Security yalnızca production'da (HTTPS) gönderilir.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
