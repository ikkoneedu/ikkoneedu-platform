/**
 * Sinematik landing — "Education Network" düğüm verisi.
 * Çekirdeğin etrafında yörüngeye yerleşen okul modülleri (tek doğruluk kaynağı).
 */

import {
  UserPlus,
  Contact,
  Award,
  GraduationCap,
  Users,
  BookOpen,
  ClipboardPen,
  Wallet,
  BarChart3,
  MessageSquare,
  Bell,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type ModuleTone = "blue" | "red";

export interface NetworkModule {
  id: string;
  label: string;
  Icon: LucideIcon;
  tone: ModuleTone;
}

/** Çekirdeği saran 12 modül — kurumsal mavi ağırlıklı, seçili kırmızı vurgular. */
export const NETWORK_MODULES: NetworkModule[] = [
  { id: "admissions", label: "Kayıt Kabul", Icon: UserPlus, tone: "red" },
  { id: "crm", label: "CRM", Icon: Contact, tone: "blue" },
  { id: "scholarship", label: "Bursluluk", Icon: Award, tone: "blue" },
  { id: "students", label: "Öğrenciler", Icon: GraduationCap, tone: "blue" },
  { id: "parents", label: "Veliler", Icon: Users, tone: "blue" },
  { id: "teachers", label: "Öğretmenler", Icon: BookOpen, tone: "blue" },
  { id: "exams", label: "Sınavlar", Icon: ClipboardPen, tone: "blue" },
  { id: "finance", label: "Finans", Icon: Wallet, tone: "red" },
  { id: "reports", label: "Raporlar", Icon: BarChart3, tone: "blue" },
  { id: "messages", label: "Mesajlar", Icon: MessageSquare, tone: "blue" },
  { id: "notifications", label: "Bildirimler", Icon: Bell, tone: "red" },
  { id: "executive", label: "Yönetim", Icon: ShieldCheck, tone: "blue" },
];

/** Mavi (accent) ve kırmızı (brand) RGB üçlüleri — canvas çizimi için. */
export const TONE_RGB: Record<ModuleTone, [number, number, number]> = {
  blue: [178, 199, 239],
  red: [214, 40, 57],
};
