import { SectionHeader } from "@/components/shared/SectionHeader";
import { getServerT } from "@/lib/i18n/server";

/**
 * Executive Dashboard başlık bölümü.
 */
export async function ExecutiveHero() {
  const t = await getServerT();
  return (
    <SectionHeader
      eyebrow={t("panelExec.hero.eyebrow")}
      title={t("panelExec.hero.title")}
      description={t("panelExec.hero.desc")}
    />
  );
}
