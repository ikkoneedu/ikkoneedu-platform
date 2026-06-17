import type { Metadata } from "next";
import type { ReactNode } from "react";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Okul Seçimi — ${productName}`,
  description: "Bağlı olduğunuz kampüs veya kurumu seçerek devam edin.",
};

export default function SchoolSelectLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
