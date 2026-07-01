/**
 * Toplu içe aktarma (personel + öğrenci/veli) için SAF ayrıştırma/doğrulama.
 *
 * UI'dan bağımsız, yan etkisiz → birim test edilebilir (bkz.
 * `scripts/test-bulk-import.ts`). Bileşenler (BulkStaffImport /
 * BulkStudentImport) yalnızca bu fonksiyonların sonucunu render eder ve
 * geçerli satırları oluşturur.
 */

// NOT: göreli import (bilinçli) — bu modül `node --experimental-strip-types`
// ile birim testlerde de çalışır (bkz. scripts/test-bulk-import.ts); Node,
// tsconfig'in `@/` yol takma adını çözemez. role-constants kendi başına yeter.
import { ROLES, ROLE_LABELS, type Role } from "../auth/role-constants.ts";

export const BULK_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Alt kadro (herkesin açabildiği) + üst kadro (yalnız üst yönetim). */
export const LOWER_ROLES: Role[] = [ROLES.TEACHER, ROLES.PR, ROLES.SALES, ROLES.DRIVER];
export const MGMT_ROLES: Role[] = [ROLES.COORDINATOR, ROLES.VICE_PRINCIPAL, ROLES.PRINCIPAL];

/** Serbest girilen rol metnini role koduna çevirir (TR/İng eş anlamlılar). */
export const ROLE_ALIASES: Record<string, Role> = {
  teacher: ROLES.TEACHER, ogretmen: ROLES.TEACHER, "öğretmen": ROLES.TEACHER,
  pr: ROLES.PR, "halkla ilişkiler": ROLES.PR, "halkla iliskiler": ROLES.PR,
  sales: ROLES.SALES, "satış": ROLES.SALES, satis: ROLES.SALES, "satış ekibi": ROLES.SALES,
  driver: ROLES.DRIVER, "şoför": ROLES.DRIVER, sofor: ROLES.DRIVER, "servis şoförü": ROLES.DRIVER,
  coordinator: ROLES.COORDINATOR, "koordinatör": ROLES.COORDINATOR, koordinator: ROLES.COORDINATOR,
  vice_principal: ROLES.VICE_PRINCIPAL, "müdür yardımcısı": ROLES.VICE_PRINCIPAL,
  "mudur yardimcisi": ROLES.VICE_PRINCIPAL, vice: ROLES.VICE_PRINCIPAL,
  principal: ROLES.PRINCIPAL, "müdür": ROLES.PRINCIPAL, mudur: ROLES.PRINCIPAL,
};

/** "Ayşe Nur Yılmaz" → { firstName: "Ayşe Nur", lastName: "Yılmaz" } */
export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

/** Sınıf adını hoşgörülü eşleştir: "1-A" = "1 A" = "1a". */
export const normClass = (s: string) =>
  s.trim().toLocaleLowerCase("tr-TR").replace(/[\s-]/g, "");

function splitCells(line: string): string[] {
  return line.split(/[,;\t]/).map((p) => p.trim());
}

/* ----------------------------- Personel ---------------------------------- */

export interface ParsedStaffRow {
  line: number;
  email: string;
  displayName: string;
  role: Role;
  /** Geçersizse hata sebebi; geçerliyse null. */
  problem: string | null;
}

/**
 * "e-posta, Ad Soyad, Rol" satırlarını ayrıştırır. Rol boşsa Öğretmen.
 * `allowedRoles` dışındaki roller (yetki yükseltme) hata olarak işaretlenir.
 */
export function parseStaffRows(raw: string, allowedRoles: Role[]): ParsedStaffRow[] {
  const seen = new Set<string>();
  const out: ParsedStaffRow[] = [];
  raw.split(/\r?\n/).forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const parts = splitCells(trimmed);
    const email = (parts[0] ?? "").toLowerCase();
    if (i === 0 && (email === "email" || email === "e-posta" || email === "eposta")) return;
    const displayName = parts[1] || email.split("@")[0];
    const roleRaw = (parts[2] ?? "").toLocaleLowerCase("tr-TR");
    const role = roleRaw ? ROLE_ALIASES[roleRaw] : ROLES.TEACHER;

    let problem: string | null = null;
    if (!BULK_EMAIL_RE.test(email)) problem = "Geçersiz e-posta";
    else if (seen.has(email)) problem = "Listede tekrar eden e-posta";
    else if (roleRaw && !role) problem = `Bilinmeyen rol: "${parts[2]}"`;
    else if (role && !allowedRoles.includes(role)) problem = `Bu rolü oluşturamazsınız: ${ROLE_LABELS[role]}`;
    seen.add(email);

    out.push({ line: i + 1, email, displayName, role: role ?? ROLES.TEACHER, problem });
  });
  return out;
}

/* -------------------------- Öğrenci / Veli ------------------------------- */

export interface ParsedStudentRow {
  line: number;
  studentName: string;
  classId: string;
  className: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  problem: string | null;
}

/**
 * "Öğrenci Adı, Sınıf, Veli Adı, Veli E-posta, Veli Telefon" satırlarını
 * ayrıştırır. `classMap` normalize sınıf adı → {id,name} eşlemesidir.
 */
export function parseStudentRows(
  raw: string,
  classMap: Map<string, { id: string; name: string }>,
): ParsedStudentRow[] {
  const out: ParsedStudentRow[] = [];
  raw.split(/\r?\n/).forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const parts = splitCells(trimmed);
    const studentName = parts[0] ?? "";
    if (i === 0 && normClass(studentName).startsWith("öğrenci")) return;
    const classRaw = parts[1] ?? "";
    const parentName = parts[2] ?? "";
    const parentEmail = (parts[3] ?? "").toLowerCase();
    const parentPhone = parts[4] ?? "";

    const matched = classRaw ? classMap.get(normClass(classRaw)) : undefined;
    let problem: string | null = null;
    if (studentName.trim().length < 2) problem = "Öğrenci adı gerekli";
    else if (classRaw && !matched) problem = `Sınıf bulunamadı: "${classRaw}"`;
    else if (parentEmail && !BULK_EMAIL_RE.test(parentEmail)) problem = "Geçersiz veli e-postası";
    else if (parentEmail && !parentName) problem = "Veli e-postası için veli adı gerekli";

    out.push({
      line: i + 1,
      studentName,
      classId: matched?.id ?? "",
      className: matched?.name ?? (classRaw || "—"),
      parentName,
      parentEmail,
      parentPhone,
      problem,
    });
  });
  return out;
}
