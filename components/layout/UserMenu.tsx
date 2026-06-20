"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLE_LABELS } from "@/lib/auth/role-constants";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "IK";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Üst çubuk kullanıcı menüsü.
 * Giriş yapılmışsa gerçek kullanıcı (ad/rol) + çıkış; aksi halde nötr avatar
 * (Mock Mod / demo görünümü korunur).
 */
export function UserMenu() {
  const router = useRouter();
  const { profile, firebaseReady, signOut } = useAuth();

  if (!firebaseReady || !profile) {
    return (
      <div
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-navy text-xs font-semibold text-content"
      >
        IK
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="flex items-center gap-2">
      <Link href="/profile" className="flex items-center gap-2" aria-label="Profilim">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-content">
            {profile.displayName || "Kullanıcı"}
          </p>
          <p className="text-[11px] leading-tight text-muted">
            {ROLE_LABELS[profile.role] ?? profile.role}
          </p>
        </div>
        <div
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/20 bg-navy text-xs font-semibold text-accent transition-colors hover:border-accent/50"
        >
          {initials(profile.displayName || "")}
        </div>
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        aria-label="Çıkış yap"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted transition-colors hover:border-brand/40 hover:text-brand"
      >
        <LogOut size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
