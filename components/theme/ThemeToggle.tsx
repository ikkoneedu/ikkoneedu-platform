"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * Koyu/açık tema anahtarı — güneş/ay ikonu. Her yere (Topbar, açılış navı,
 * okul kabuğu) yerleştirilebilir. `className` ile çevre stiline uyum sağlar.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      title={isDark ? "Açık tema" : "Koyu tema"}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-overlay/10 bg-overlay/[0.04] text-muted transition-colors hover:text-content ${className}`}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
