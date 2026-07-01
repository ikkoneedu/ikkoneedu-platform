/**
 * Bağımsız (framework'süz) test — toplu içe aktarma ayrıştırma/doğrulama.
 *
 * Çalıştır: node --experimental-strip-types scripts/test-bulk-import.ts
 */
import assert from "node:assert";
import {
  parseStaffRows,
  parseStudentRows,
  splitName,
  normClass,
  LOWER_ROLES,
  MGMT_ROLES,
} from "../lib/admin/bulk-import.ts";
import { ROLES } from "../lib/auth/role-constants.ts";

let passed = 0;
function test(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log("bulk-import.ts");

test("splitName ad/soyadı ayırır", () => {
  assert.deepStrictEqual(splitName("Ayşe Yılmaz"), { firstName: "Ayşe", lastName: "Yılmaz" });
  assert.deepStrictEqual(splitName("Ayşe Nur Yılmaz"), { firstName: "Ayşe Nur", lastName: "Yılmaz" });
  assert.deepStrictEqual(splitName("Ayşe"), { firstName: "Ayşe", lastName: "" });
  assert.deepStrictEqual(splitName("  "), { firstName: "", lastName: "" });
});

test("normClass sınıf adını hoşgörülü normalize eder", () => {
  assert.strictEqual(normClass("1-A"), "1a");
  assert.strictEqual(normClass("1 A"), "1a");
  assert.strictEqual(normClass(" 1a "), "1a");
});

const allowedTop = [...LOWER_ROLES, ...MGMT_ROLES];

test("parseStaffRows: rol boşsa öğretmen varsayar", () => {
  const rows = parseStaffRows("ayse@okul.com, Ayşe Yılmaz", allowedTop);
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].role, ROLES.TEACHER);
  assert.strictEqual(rows[0].problem, null);
  assert.strictEqual(rows[0].displayName, "Ayşe Yılmaz");
});

test("parseStaffRows: rol eş anlamlısını çözer (TR)", () => {
  const rows = parseStaffRows("m@okul.com, Mehmet, Müdür Yardımcısı", allowedTop);
  assert.strictEqual(rows[0].role, ROLES.VICE_PRINCIPAL);
  assert.strictEqual(rows[0].problem, null);
});

test("parseStaffRows: ad boşsa e-posta yerel kısmından türetir", () => {
  const rows = parseStaffRows("veli.demir@okul.com", allowedTop);
  assert.strictEqual(rows[0].displayName, "veli.demir");
});

test("parseStaffRows: geçersiz e-posta işaretlenir", () => {
  const rows = parseStaffRows("gecersiz, Ad", allowedTop);
  assert.strictEqual(rows[0].problem, "Geçersiz e-posta");
});

test("parseStaffRows: tekrar eden e-posta işaretlenir", () => {
  const rows = parseStaffRows("a@x.com, A\na@x.com, B", allowedTop);
  assert.strictEqual(rows[0].problem, null);
  assert.strictEqual(rows[1].problem, "Listede tekrar eden e-posta");
});

test("parseStaffRows: bilinmeyen rol işaretlenir", () => {
  const rows = parseStaffRows("a@x.com, A, Kral", allowedTop);
  assert.match(rows[0].problem ?? "", /Bilinmeyen rol/);
});

test("parseStaffRows: yetki dışı rol (yükseltme) engellenir", () => {
  // Alt yönetici yalnız LOWER_ROLES açabilir → müdür yasak.
  const rows = parseStaffRows("a@x.com, A, Müdür", LOWER_ROLES);
  assert.match(rows[0].problem ?? "", /oluşturamazsınız/);
});

test("parseStaffRows: başlık satırını atlar", () => {
  const rows = parseStaffRows("e-posta, Ad, Rol\na@x.com, A", allowedTop);
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].email, "a@x.com");
});

const classMap = new Map<string, { id: string; name: string }>([
  ["1a", { id: "c1", name: "1-A" }],
  ["2b", { id: "c2", name: "2-B" }],
]);

test("parseStudentRows: sınıf adını eşleştirir (hoşgörülü)", () => {
  const rows = parseStudentRows("Ayşe Yılmaz, 1 A, Fatma Yılmaz, fatma@x.com", classMap);
  assert.strictEqual(rows[0].classId, "c1");
  assert.strictEqual(rows[0].className, "1-A");
  assert.strictEqual(rows[0].problem, null);
});

test("parseStudentRows: bilinmeyen sınıf işaretlenir", () => {
  const rows = parseStudentRows("Ayşe Yılmaz, 9-Z", classMap);
  assert.match(rows[0].problem ?? "", /Sınıf bulunamadı/);
});

test("parseStudentRows: geçersiz veli e-postası işaretlenir", () => {
  const rows = parseStudentRows("Ayşe Yılmaz, 1-A, Fatma, bozukmail", classMap);
  assert.strictEqual(rows[0].problem, "Geçersiz veli e-postası");
});

test("parseStudentRows: veli e-postası varsa veli adı zorunlu", () => {
  const rows = parseStudentRows("Ayşe Yılmaz, 1-A, , fatma@x.com", classMap);
  assert.match(rows[0].problem ?? "", /veli adı gerekli/);
});

test("parseStudentRows: öğrenci adı çok kısaysa işaretlenir", () => {
  const rows = parseStudentRows("A, 1-A", classMap);
  assert.strictEqual(rows[0].problem, "Öğrenci adı gerekli");
});

test("parseStudentRows: sınıfsız (boş) öğrenci geçerli sayılır", () => {
  const rows = parseStudentRows("Ayşe Yılmaz", classMap);
  assert.strictEqual(rows[0].problem, null);
  assert.strictEqual(rows[0].classId, "");
});

console.log(`\n${passed} test geçti ✓`);
