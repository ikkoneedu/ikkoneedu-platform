"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LogOut,
  CircleUser,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Building2,
  FlaskConical,
  Users,
  Globe,
  Award,
} from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { productName } from "@/lib/constants";
import { tenantFeatures } from "@/lib/mock-data";
import { useT } from "@/components/i18n/LocaleProvider";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/** Okul seçim kartları (mock — tenant slug ile halka açık sayfalara bağlı). */
const selectCards = [
  { id: "ikk", name: "İngiliz Kültür Kolejleri", slug: "ingiliz-kultur", roleKey: "schoolSelect.card.role.admin", users: "1.248", href: "/admin", icon: GraduationCap, isSuper: false },
  { id: "atael", name: "Atael Koleji", slug: "atael", roleKey: "schoolSelect.card.role.admin", users: "842", href: "/admin", icon: Building2, isSuper: false },
  { id: "demo", name: "Demo Okul", slug: "demo-okul", roleKey: "schoolSelect.card.role.admin", users: "120", href: "/admin", icon: FlaskConical, isSuper: false },
  { id: "super", name: "Super Admin", slug: null, roleKey: "schoolSelect.card.role.platformOwner", users: "—", href: "/super-admin", icon: ShieldCheck, isSuper: true },
] as const;

export default function SchoolSelectPage() {
  const router = useRouter();
  const t = useT();

  return (
    <div className="mesh-bg min-h-screen w-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Üst bar — marka + profil/çıkış */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="text-lg font-semibold tracking-tight text-content">
              {productName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-full border border-overlay/10 bg-overlay/[0.04] py-1.5 pl-1.5 pr-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-accent">
                <CircleUser size={20} aria-hidden="true" />
              </span>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-tight text-content">
                  {t("schoolSelect.role")}
                </p>
                <p className="text-xs leading-tight text-muted">
                  ikkdijital@gmail.com
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-overlay/[0.08] hover:text-content"
            >
              <LogOut size={16} aria-hidden="true" />
              <span className="hidden sm:inline">{t("schoolSelect.logout")}</span>
            </button>
          </div>
        </header>

        {/* Başlık */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-12"
        >
          <SectionHeader
            align="center"
            title={t("schoolSelect.title")}
            description={t("schoolSelect.description")}
          />
        </motion.div>

        {/* Okul kartları */}
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {selectCards.map((card) => {
            const Icon = card.icon;
            return (
              <GlassCard
                key={card.id}
                tone="navy"
                interactive
                className={[
                  "flex h-full flex-col",
                  card.isSuper ? "border-accent/40" : "",
                ].join(" ")}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-navy/50 text-accent">
                  <Icon size={26} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-content">
                  {card.name}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-accent">
                  <span>{t(card.roleKey)}</span>
                  {card.slug && (
                    <span className="font-mono text-xs text-muted">
                      {card.slug}.ikkoneedu.com
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted">
                  <Users size={16} aria-hidden="true" />
                  <span>{t("schoolSelect.card.users", { count: card.users })}</span>
                </div>

                <PrimaryButton
                  type="button"
                  variant={card.isSuper ? "secondary" : "primary"}
                  size="md"
                  className="mt-6 w-full"
                  onClick={() => router.push(card.href)}
                >
                  {t("schoolSelect.card.continue")}
                  <ArrowRight size={15} aria-hidden="true" />
                </PrimaryButton>

                {card.slug && (
                  <div className="mt-4 flex flex-col gap-2 border-t border-overlay/5 pt-4">
                    <Link
                      href={`/school/${card.slug}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-accent"
                    >
                      <Globe size={13} aria-hidden="true" />
                      {t("schoolSelect.card.publicPage")}
                    </Link>
                    <Link
                      href={`/school/${card.slug}/scholarship/apply`}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-accent"
                    >
                      <Award size={13} aria-hidden="true" />
                      {t("schoolSelect.card.scholarship")}
                    </Link>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </motion.section>

        {/* Alt bölüm — tenant altyapısı açıklama kartları */}
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="mt-16"
        >
          <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted">
            {t("schoolSelect.infra.heading")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tenantFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <GlassCard key={feature.id} className="p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-overlay/10 bg-navy/40 text-accent">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-content">
                    {t(`schoolSelect.feature.${feature.id}.title`)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {t(`schoolSelect.feature.${feature.id}.description`)}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
