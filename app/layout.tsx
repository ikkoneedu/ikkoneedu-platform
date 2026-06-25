import type { Metadata, Viewport } from "next";
import { SEO, siteUrl, baseKeywords } from "@/lib/seo/seo";
import { colors } from "@/lib/constants";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

/**
 * Tema kayması (FOUC) önleyici — React hidrasyonundan ÖNCE çalışır; kayıtlı
 * temayı okuyup <html> sınıfını ayarlar. Varsayılan koyu.
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem('ikk_theme');var c=t==='light'?'light':'dark';document.documentElement.classList.add(c);document.documentElement.style.colorScheme=c;}catch(e){document.documentElement.classList.add('dark');}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SEO.defaultTitle,
    template: SEO.titleTemplate,
  },
  description: SEO.description,
  applicationName: SEO.siteName,
  keywords: baseKeywords,
  authors: [{ name: SEO.siteName }],
  creator: SEO.siteName,
  publisher: SEO.siteName,
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: SEO.locale,
    url: siteUrl,
    siteName: SEO.siteName,
    title: SEO.defaultTitle,
    description: SEO.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.defaultTitle,
    description: SEO.description,
    site: SEO.twitterHandle,
    creator: SEO.twitterHandle,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: colors.background,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
