/**
 * Bağımsız (framework'süz) test — kiosk klavye arabelleği + debounce mantığı.
 *
 * Proje test runner'ı (jest/vitest) içermediğinden yeni bir bağımlılık
 * eklemek yerine Node'un yerleşik `node:assert`i + `--experimental-strip-types`
 * bayrağıyla doğrudan çalıştırılabilir bir doğrulama betiği kullanılır.
 *
 * Çalıştır: node --experimental-strip-types scripts/test-scanner-buffer.ts
 */
import assert from "node:assert";
import { ScanKeyBuffer, isDuplicateScan } from "../lib/attendance/scanner-buffer.ts";

let passed = 0;
function test(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log("scanner-buffer.ts");

test("hızlı karakterler + Enter ile tamamlanır", () => {
  const buf = new ScanKeyBuffer();
  const t0 = 1000;
  let result = null;
  const text = "IKK-ATT|uid1|2026-07-01|in|abcdef";
  for (let i = 0; i < text.length; i += 1) {
    result = buf.push(text[i], t0 + i * 5); // ~5ms/karakter → fiziksel okuyucu hızı
  }
  result = buf.push("Enter", t0 + text.length * 5);
  assert.ok(result);
  assert.strictEqual(result!.value, text);
  assert.strictEqual(result!.likelyScanner, true);
});

test("Tab da sonlandırıcı olarak kabul edilir", () => {
  const buf = new ScanKeyBuffer();
  buf.push("A", 0);
  buf.push("B", 5);
  const result = buf.push("Tab", 10);
  assert.ok(result);
  assert.strictEqual(result!.value, "AB");
});

test("yavaş (insan hızında) yazım likelyScanner=false döner", () => {
  const buf = new ScanKeyBuffer();
  const text = "abc";
  let t = 0;
  for (const ch of text) {
    buf.push(ch, t);
    t += 300; // ~300ms/karakter → insan yazım hızı
  }
  const result = buf.push("Enter", t);
  assert.ok(result);
  assert.strictEqual(result!.likelyScanner, false);
});

test("boş arabellekte Enter hiçbir şey döndürmez", () => {
  const buf = new ScanKeyBuffer();
  const result = buf.push("Enter", 0);
  assert.strictEqual(result, null);
});

test("kontrol tuşları (Shift, ArrowLeft) yok sayılır", () => {
  const buf = new ScanKeyBuffer();
  buf.push("Shift", 0);
  buf.push("A", 1);
  buf.push("ArrowLeft", 2);
  buf.push("B", 3);
  const result = buf.push("Enter", 4);
  assert.strictEqual(result!.value, "AB");
});

test("uzun süre sessizlikten sonra arabellek otomatik sıfırlanır", () => {
  const buf = new ScanKeyBuffer({ staleAfterMs: 500 });
  buf.push("A", 0);
  buf.push("B", 100); // hâlâ taze
  assert.strictEqual(buf.length, 2);
  buf.push("C", 5000); // 500ms eşiğini aştı → sıfırlanıp yeniden başlar
  assert.strictEqual(buf.length, 1);
  assert.strictEqual(buf.currentValue, "C");
});

test("clearIfStale yarım kalmış taramayı temizler", () => {
  const buf = new ScanKeyBuffer({ staleAfterMs: 500 });
  buf.push("A", 0);
  assert.strictEqual(buf.clearIfStale(100), false);
  assert.strictEqual(buf.clearIfStale(700), true);
  assert.strictEqual(buf.length, 0);
});

test("isDuplicateScan: aynı değer pencere içinde tekrar edilirse true", () => {
  assert.strictEqual(isDuplicateScan("X", 1000, "X", 1500, 4000), true);
});

test("isDuplicateScan: pencere dışındaysa false", () => {
  assert.strictEqual(isDuplicateScan("X", 1000, "X", 6000, 4000), false);
});

test("isDuplicateScan: farklı değerse false", () => {
  assert.strictEqual(isDuplicateScan("X", 1000, "Y", 1500, 4000), false);
});

test("isDuplicateScan: önceki tarama yoksa false", () => {
  assert.strictEqual(isDuplicateScan(null, null, "X", 1500, 4000), false);
});

console.log(`\n${passed} test geçti.`);
