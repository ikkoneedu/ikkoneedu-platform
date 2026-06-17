import type { Metadata } from "next";
import type { ReactNode } from "react";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Yönetim Paneli — ${productName}`,
  description: "Sistem genel görünümü ve stratejik performans metrikleri.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
