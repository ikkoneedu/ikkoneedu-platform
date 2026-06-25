import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema-duyarlı semantik renkler (CSS değişkeni + alpha desteği).
        // Değerler globals.css'te :root (koyu) ve .light (açık) altında tanımlı.
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        navy: "rgb(var(--color-navy) / <alpha-value>)",
        brand: "rgb(var(--color-brand) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        content: "rgb(var(--color-content) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        // Cam yüzey kaplaması: koyu temada beyaz, açık temada koyu (otomatik uyum).
        overlay: "rgb(var(--overlay) / <alpha-value>)",
      },
      borderColor: {
        DEFAULT: "rgb(var(--overlay) / 0.1)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
