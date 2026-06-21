/**
 * Okul ayarları servisi — `tenants/{tenantId}/settings/{section}`.
 *
 * Tüm modüllerin TEK ayar kaynağı. Bölümler:
 *   - school      : okul kimliği (ad, logo, renkler, iletişim)
 *   - academic    : eğitim yılı, dönem, sınıf seviyeleri
 *   - scholarship : bursluluk sınav/başvuru tarihleri, kontenjan
 *   - timetable   : ders saatleri, teneffüs, gün yapısı
 *
 * Yetki: okuma tenant üyesi, yazma okul personeli (Firestore kuralları zorlar).
 * Mock modda (Firebase yok) null/no-op döner.
 */

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantSettings } from "@/lib/firebase/collections";

export type SettingsSection =
  | "school"
  | "academic"
  | "scholarship"
  | "timetable";

export interface SchoolSettings {
  name: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  phone: string;
  email: string;
  address: string;
  website: string;
}

export interface AcademicSettings {
  academicYear: string;
  term: string;
  gradeLevels: string;
}

export interface ScholarshipSettings {
  examDate: string;
  applicationDeadline: string;
  quota: string;
  applicationPrefix: string;
}

export interface TimetableSettings {
  lessonStart: string;
  lessonDuration: string;
  breakDuration: string;
  days: string;
}

export interface SettingsShape {
  school: SchoolSettings;
  academic: AcademicSettings;
  scholarship: ScholarshipSettings;
  timetable: TimetableSettings;
}

/** Bölüm için varsayılan (boş) değerler — belge yoksa form bunları gösterir. */
export const SETTINGS_DEFAULTS: SettingsShape = {
  school: {
    name: "",
    logoUrl: "",
    primaryColor: "#0A2342",
    accentColor: "#D62839",
    phone: "",
    email: "",
    address: "",
    website: "",
  },
  academic: { academicYear: "", term: "", gradeLevels: "" },
  scholarship: {
    examDate: "",
    applicationDeadline: "",
    quota: "",
    applicationPrefix: "",
  },
  timetable: { lessonStart: "09:00", lessonDuration: "40", breakDuration: "10", days: "Pazartesi-Cuma" },
};

const settingsDoc = (tenantId: string, section: SettingsSection): string =>
  `${tenantSettings(tenantId)}/${section}`;

/** Bir ayar bölümünü okur. Yoksa varsayılanı döner. */
export async function getSettings<S extends SettingsSection>(
  tenantId: string,
  section: S,
): Promise<SettingsShape[S]> {
  const fallback = SETTINGS_DEFAULTS[section];
  if (!isFirebaseConfigured() || !db || !tenantId) return fallback;
  try {
    const snap = await getDoc(doc(db, settingsDoc(tenantId, section)));
    if (!snap.exists()) return fallback;
    return { ...fallback, ...(snap.data() as object) } as SettingsShape[S];
  } catch {
    return fallback;
  }
}

/** Bir ayar bölümünü kaydeder (merge). Yalnızca okul personeli (kurallar). */
export async function saveSettings<S extends SettingsSection>(
  tenantId: string,
  section: S,
  data: SettingsShape[S],
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await setDoc(
    doc(db, settingsDoc(tenantId, section)),
    { ...data, section, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
