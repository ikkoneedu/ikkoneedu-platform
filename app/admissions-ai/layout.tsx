import type { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <RoleGuard>{children}</RoleGuard>;
}
