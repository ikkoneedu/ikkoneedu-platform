"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useT } from "@/components/i18n/LocaleProvider";
import { productName, tagline } from "@/lib/constants";

interface FooterLink {
  labelKey: string;
  href: string;
}

const COLUMNS: { titleKey: string; links: FooterLink[] }[] = [
  {
    titleKey: "footer.col.platform",
    links: [
      { labelKey: "footer.link.features", href: "/features" },
      { labelKey: "footer.link.pricing", href: "/pricing" },
      { labelKey: "footer.link.mobile", href: "/mobile-app" },
      { labelKey: "footer.link.demo", href: "/demo" },
    ],
  },
  {
    titleKey: "footer.col.corporate",
    links: [
      { labelKey: "footer.link.founder", href: "/founder-school" },
      { labelKey: "footer.link.scholarship", href: "/scholarship-exam/apply" },
      { labelKey: "footer.link.portal", href: "/school-select" },
    ],
  },
  {
    titleKey: "footer.col.account",
    links: [
      { labelKey: "footer.link.login", href: "/login" },
      { labelKey: "footer.link.register", href: "/register" },
      { labelKey: "footer.link.codeLogin", href: "/code-login" },
      { labelKey: "footer.link.profile", href: "/profile" },
    ],
  },
];

/**
 * Global site altbilgisi — gerçek bağlantılı, premium tema, kırmızı vurgu.
 * Tüm halka açık/pazarlama sayfalarında kullanılır. TR/EN.
 */
export function SiteFooter() {
  const t = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-overlay/10 bg-background">
      {/* Üst kırmızı aksan çizgisi */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Marka + CTA */}
          <div className="lg:col-span-5">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark size={32} />
              <span className="text-lg font-semibold tracking-tight text-content">
                {productName}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {tagline}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted/80">
              {t("footer.tagline")}
            </p>
            <Link href="/demo" className="mt-6 inline-block">
              <PrimaryButton size="md">
                {t("nav.requestDemo")}
                <ArrowUpRight size={16} aria-hidden="true" />
              </PrimaryButton>
            </Link>
            <div className="mt-6 flex flex-col gap-2 text-sm text-muted">
              <span className="flex items-center gap-2">
                <Mail size={15} className="text-brand" aria-hidden="true" />
                ikkdijital@gmail.com
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={15} className="text-brand" aria-hidden="true" />
                İngiliz Kültür Kolejleri · Türkiye
              </span>
            </div>
          </div>

          {/* Bağlantı sütunları */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {COLUMNS.map((col) => (
              <div key={col.titleKey}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-content/80">
                  {t(col.titleKey)}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted transition-colors hover:text-brand"
                      >
                        {t(link.labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Alt bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-overlay/10 pt-6 text-xs text-muted/70 sm:flex-row">
          <p>
            © {year} {productName}. {t("footer.rights")}
          </p>
          <p className="flex items-center gap-2 font-mono uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {t("footer.badge")}
          </p>
        </div>
      </div>
    </footer>
  );
}
