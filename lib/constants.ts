/**
 * ikkoneedu — Uygulama genelinde kullanılan sabitler.
 * Tasarım sistemi renkleri tek kaynaktan yönetilir.
 */

export const SITE = {
  name: "ikkoneedu",
  title: "ikkoneedu",
  tagline: "Türkiye'nin Yapay Zeka Destekli Eğitim İşletim Sistemi",
  description:
    "Okul yönetimi, veli iletişimi, öğrenci deneyimi ve yapay zekayı tek platformda birleştiren yeni nesil eğitim teknolojileri ekosistemi.",
} as const;

/** Tasarım sistemi renk paleti (referans amaçlı; Tailwind config ile senkron). */
export const COLORS = {
  background: "#050C16",
  surface: "#121316",
  navy: "#0A2342",
  brand: "#D62839",
  accent: "#B2C7EF",
  text: "#E3E2E5",
  mutedText: "#C4C6CF",
  border: "rgba(255, 255, 255, 0.1)",
} as const;
