/**
 * Ayar veri modeli.
 * Platform geneli ve tenant bazlı yapılandırmalar.
 */

import type { AiProviderId } from "@/src/types/ai";

export interface PlatformSettings {
  name: string;
  fullName: string;
  slogan: string;
  defaultLanguage: string;
  defaultTheme: "dark" | "light";
  status: "active" | "maintenance";
}

export interface SecuritySettings {
  twoFactor: boolean;
  ipRestriction: boolean;
  passwordPolicy: boolean;
  sessionTimeoutMinutes: number;
}

export interface AiSettings {
  defaultProvider: AiProviderId;
  defaultModel: string;
  dailyQueryLimit: number | null;
  perSchoolLimit: number | null;
  safetyFilter: "standard" | "high" | "max";
}

export interface TenantSettings {
  tenantId: string;
  platform: PlatformSettings;
  security: SecuritySettings;
  ai: AiSettings;
}
