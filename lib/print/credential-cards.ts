import { productName } from "@/lib/constants";

/**
 * Yeni oluşturulan hesapların giriş bilgilerini yazdırılabilir kartlar olarak
 * üretir ve ayrı bir pencerede yazdırma diyaloğunu açar.
 *
 * Uygulamanın kendi print stilleriyle çakışmamak için kendi kendine yeten bir
 * HTML belgesi `window.open` ile açılır (kullanıcı jesti sonrası → popup engeli
 * genelde devreye girmez). Salt istemci.
 */

export interface CredentialCard {
  displayName: string;
  email: string;
  password: string;
  roleLabel: string;
}

export interface PrintCredentialOptions {
  /** Kart üstünde gösterilecek kurum/okul adı (yoksa ürün adı). */
  schoolName?: string;
  /** Giriş adresi (ör. https://ikkoneedu.com/login). */
  loginUrl?: string;
}

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function printCredentialCards(
  cards: CredentialCard[],
  opts: PrintCredentialOptions = {},
): void {
  if (cards.length === 0) return;
  const brand = esc(opts.schoolName || productName);
  const loginUrl = opts.loginUrl ? esc(opts.loginUrl) : "";

  const cardHtml = cards
    .map(
      (c) => `
    <div class="card">
      <div class="brand">${brand}</div>
      <div class="title">Giriş Bilgileri</div>
      <div class="row"><span class="k">Ad Soyad</span><span class="v">${esc(c.displayName)}</span></div>
      <div class="row"><span class="k">Yetki</span><span class="v">${esc(c.roleLabel)}</span></div>
      <div class="row"><span class="k">Kullanıcı adı</span><span class="v mono">${esc(c.email)}</span></div>
      <div class="row"><span class="k">Geçici şifre</span><span class="v pw">${esc(c.password)}</span></div>
      ${loginUrl ? `<div class="url">Giriş: ${loginUrl}</div>` : ""}
      <div class="note">İlk girişte yeni bir şifre belirlemeniz istenecektir. Giriş sırasında e-postanıza gelen 6 haneli doğrulama kodunu da girmeniz gerekebilir.</div>
    </div>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<title>Giriş Bilgileri — ${brand}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 14px; color: #0f172a; background: #fff; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .card { border: 1px dashed #94a3b8; border-radius: 12px; padding: 14px 16px; page-break-inside: avoid; }
  .brand { font-size: 13px; font-weight: 700; color: #0A2342; }
  .title { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: #64748b; margin: 2px 0 10px; }
  .row { display: flex; justify-content: space-between; gap: 12px; padding: 3px 0; font-size: 13px; }
  .k { color: #64748b; }
  .v { font-weight: 600; text-align: right; word-break: break-all; }
  .mono { font-family: ui-monospace, Menlo, Consolas, monospace; font-weight: 500; }
  .pw { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 16px; letter-spacing: 1px; color: #0A2342; }
  .url { margin-top: 8px; font-size: 12px; color: #334155; }
  .note { margin-top: 8px; font-size: 10.5px; color: #94a3b8; line-height: 1.4; }
  @media print { body { padding: 0; } @page { margin: 12mm; } }
</style></head>
<body>
  <div class="grid">${cardHtml}</div>
  <script>window.onload = function(){ window.focus(); window.print(); };</script>
</body></html>`;

  const w = window.open("", "_blank", "width=880,height=680");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
