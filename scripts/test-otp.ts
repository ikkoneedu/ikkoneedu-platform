/**
 * Bağımsız (framework'süz) test — OTP kod üretimi/özet/doğrulama.
 *
 * Çalıştır: node --experimental-strip-types scripts/test-otp.ts
 */
import assert from "node:assert";
import {
  generateOtpCode,
  hashOtpCode,
  verifyOtpCode,
  OTP_LENGTH,
} from "../lib/auth/otp.ts";

let passed = 0;
function test(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log("otp.ts");

test("generateOtpCode 6 haneli sayısal kod üretir", () => {
  for (let i = 0; i < 500; i += 1) {
    const code = generateOtpCode();
    assert.strictEqual(code.length, OTP_LENGTH);
    assert.match(code, /^[0-9]{6}$/);
  }
});

test("hashOtpCode deterministik ve 64 hex karakter", () => {
  const h1 = hashOtpCode("123456");
  const h2 = hashOtpCode("123456");
  assert.strictEqual(h1, h2);
  assert.match(h1, /^[0-9a-f]{64}$/);
  assert.notStrictEqual(hashOtpCode("123456"), hashOtpCode("654321"));
});

test("verifyOtpCode doğru kodu kabul eder", () => {
  const code = "482910";
  assert.strictEqual(verifyOtpCode(code, hashOtpCode(code)), true);
});

test("verifyOtpCode yanlış kodu reddeder", () => {
  const hash = hashOtpCode("482910");
  assert.strictEqual(verifyOtpCode("000000", hash), false);
});

test("verifyOtpCode boş/bozuk girişte güvenli biçimde false döner", () => {
  const hash = hashOtpCode("482910");
  assert.strictEqual(verifyOtpCode("", hash), false);
  assert.strictEqual(verifyOtpCode("482910", ""), false);
  assert.strictEqual(verifyOtpCode("482910", "kısa-hash"), false);
});

console.log(`\n${passed} test geçti ✓`);
