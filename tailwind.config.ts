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
        background: "#050C16",
        surface: "#121316",
        navy: "#0A2342",
        brand: "#D62839",
        accent: "#B2C7EF",
        content: "#E3E2E5",
        muted: "#C4C6CF",
      },
      borderColor: {
        DEFAULT: "rgba(255, 255, 255, 0.1)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
