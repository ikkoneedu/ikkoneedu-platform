import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * ESLint flat config (ESLint 9 / Next.js 15-16 uyumlu).
 *
 * `next lint` Next 16'da kaldırılıyor; bu yüzden lint doğrudan ESLint CLI ile
 * çalıştırılır (`npm run lint` → `eslint .`). Kurallar değişmedi: mevcut
 * `next/core-web-vitals` seti FlatCompat ile aynen taşınır.
 */
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;
