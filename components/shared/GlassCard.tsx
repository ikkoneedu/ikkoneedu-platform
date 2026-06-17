import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Cam efektli (glassmorphism) yüzey bileşeni.
 * İçerik kartları için yarı saydam, sınırlı bir kapsayıcı sağlar.
 */
export function GlassCard({ children, className = "", ...props }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-surface/60 p-6 shadow-lg shadow-black/30 backdrop-blur-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
