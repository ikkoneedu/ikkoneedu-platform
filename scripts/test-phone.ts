/**
 * Bağımsız (framework'süz) test — Türkiye telefon numarası E.164 normalizasyonu.
 *
 * Proje test runner'ı (jest/vitest) içermediğinden yeni bağımlılık eklemek
 * yerine Node'un yerleşik `node:assert`i + `--experimental-strip-types`
 * bayrağıyla çalıştırılır.
 *
 * Çalıştır: node --experimental-strip-types scripts/test-phone.ts
 */
import assert from "node:assert";
import { toE164Turkey } from "../lib/auth/phone.ts";

let passed = 0;
function test(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log("phone.ts — toE164Turkey");

test("zaten E.164 olan numarayı korur", () => {
  assert.strictEqual(toE164Turkey("+905321234567"), "+905321234567");
});

test("0 ile başlayan 11 haneli numarayı çevirir", () => {
  assert.strictEqual(toE164Turkey("05321234567"), "+905321234567");
  assert.strictEqual(toE164Turkey("0532 123 45 67"), "+905321234567");
});

test("90 ile başlayan 12 haneli numarayı çevirir", () => {
  assert.strictEqual(toE164Turkey("905321234567"), "+905321234567");
  assert.strictEqual(toE164Turkey("90 532 123 45 67"), "+905321234567");
});

test("önalanı düşmüş 10 haneli cep numarasını çevirir", () => {
  assert.strictEqual(toE164Turkey("5321234567"), "+905321234567");
  assert.strictEqual(toE164Turkey("532 123 45 67"), "+905321234567");
});

test("uluslararası + numarayı biçimlendirir", () => {
  assert.strictEqual(toE164Turkey("+1 (415) 555-2671"), "+14155552671");
});

test("geçersiz/eksik girişte null döner", () => {
  assert.strictEqual(toE164Turkey(""), null);
  assert.strictEqual(toE164Turkey("abc"), null);
  assert.strictEqual(toE164Turkey("12345"), null);
  assert.strictEqual(toE164Turkey("+123"), null); // çok kısa
});

console.log(`\n${passed} test geçti ✓`);
