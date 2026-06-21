/**
 * İndirme / dışa aktarma motoru (istemci tarafı, bağımlılıksız).
 *
 * Tüm "İndir / Dışa Aktar / PDF / XML / CSV / JSON" butonları bu yardımcıları
 * kullanır; gerçek dosya üretir. PDF için tarayıcının yazdırma diyaloğu kullanılır
 * (harici kütüphane yok) — kullanıcı "PDF olarak kaydet" seçer.
 *
 * Sunucuda çağrılırsa sessizce no-op (window yok).
 */

const isBrowser = () => typeof window !== "undefined";

/** Bir Blob'u indirir (ortak yardımcı). */
export function downloadBlob(blob: Blob, filename: string): void {
  if (!isBrowser()) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Düz metin / herhangi bir MIME indirir. */
export function downloadText(
  filename: string,
  text: string,
  mime = "text/plain;charset=utf-8",
): void {
  // UTF-8 BOM — Excel/editörlerde Türkçe karakter uyumu.
  downloadBlob(new Blob(["﻿" + text], { type: mime }), filename);
}

const csvEscape = (v: unknown): string =>
  `"${String(v ?? "").replace(/"/g, '""')}"`;

/**
 * CSV indirir. `columns` başlık/erişim eşlemesi; `rows` veri dizisi.
 * Örn. downloadCSV("rapor.csv", [{key:"name",label:"Ad"}], data)
 */
export function downloadCSV<T extends Record<string, unknown>>(
  filename: string,
  columns: { key: keyof T | string; label: string }[],
  rows: T[],
): void {
  const header = columns.map((c) => csvEscape(c.label)).join(",");
  const body = rows
    .map((r) => columns.map((c) => csvEscape(r[c.key as string])).join(","))
    .join("\r\n");
  downloadText(filename, `${header}\r\n${body}`, "text/csv;charset=utf-8");
}

/** JSON indirir (okunabilir biçimli). */
export function downloadJSON(filename: string, data: unknown): void {
  downloadText(
    filename,
    JSON.stringify(data, null, 2),
    "application/json;charset=utf-8",
  );
}

const xmlEscape = (v: unknown): string =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const xmlTag = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, "_");

/**
 * XML indirir. Her öğe `<item>` (veya verilen ad), alanlar alt etiket olur.
 * Örn. downloadXML("kayitlar.xml","ogrenciler","ogrenci", rows)
 */
export function downloadXML(
  filename: string,
  rootName: string,
  itemName: string,
  items: Record<string, unknown>[],
): void {
  const root = xmlTag(rootName);
  const item = xmlTag(itemName);
  const body = items
    .map((obj) => {
      const fields = Object.entries(obj)
        .map(
          ([k, v]) =>
            `    <${xmlTag(k)}>${xmlEscape(v)}</${xmlTag(k)}>`,
        )
        .join("\n");
      return `  <${item}>\n${fields}\n  </${item}>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${root}>\n${body}\n</${root}>`;
  downloadText(filename, xml, "application/xml;charset=utf-8");
}

/**
 * Yazdırılabilir bir HTML belgesini yeni pencerede açar ve yazdırma diyaloğunu
 * tetikler — kullanıcı "PDF olarak kaydet" ile indirir. Premium koyu/temiz stil.
 */
export function printToPDF(title: string, bodyHtml: string): void {
  if (!isBrowser()) return;
  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8" />
<title>${xmlEscape(title)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Inter,system-ui,Segoe UI,sans-serif;color:#0A2342;margin:0;padding:40px;background:#fff}
  .doc-head{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #D62839;padding-bottom:16px;margin-bottom:24px}
  .brand{font-size:20px;font-weight:800;letter-spacing:-.02em;color:#0A2342}
  .brand span{color:#D62839}
  h1{font-size:22px;margin:0 0 4px}
  .meta{color:#667;font-size:12px}
  table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}
  th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e5e7eb}
  th{background:#0A2342;color:#fff;font-weight:600}
  tr:nth-child(even) td{background:#f7f8fa}
  .foot{margin-top:32px;border-top:1px solid #e5e7eb;padding-top:12px;color:#889;font-size:11px;display:flex;justify-content:space-between}
  @media print{ body{padding:24px} .no-print{display:none} }
</style></head><body>
<div class="doc-head">
  <div class="brand">ikko<span>needu</span></div>
  <div class="meta">${new Date().toLocaleString("tr-TR")}</div>
</div>
${bodyHtml}
<div class="foot"><span>ikkoneedu — Eğitim İşletim Sistemi</span><span>${xmlEscape(title)}</span></div>
<script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script>
</body></html>`);
  win.document.close();
}

/** Basit tablo HTML'i üretir (printToPDF için). */
export function htmlTable(
  columns: { label: string }[],
  rows: (string | number)[][],
): string {
  const head = `<tr>${columns.map((c) => `<th>${xmlEscape(c.label)}</th>`).join("")}</tr>`;
  const body = rows
    .map((r) => `<tr>${r.map((c) => `<td>${xmlEscape(c)}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead>${head}</thead><tbody>${body}</tbody></table>`;
}
