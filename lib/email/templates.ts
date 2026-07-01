import "server-only";

import { productName, productFullName } from "@/lib/constants";

/**
 * Transactional e-posta şablonları (HTML). Marka renkleri gömülü, sade ve
 * e-posta istemcileriyle uyumlu (inline stil). `sendEmail` ile kullanılır.
 */

const NAVY = "#0A2342";
const BRAND = "#D62839";

function shell(inner: string): string {
  return `
  <div style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f4f6fa;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6eaf2;">
      <div style="background:${NAVY};padding:20px 24px;">
        <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.3px;">${productName}</span>
        <span style="color:#b2c7ef;font-size:12px;display:block;margin-top:2px;">${productFullName}</span>
      </div>
      <div style="padding:24px;color:#1f2937;font-size:14px;line-height:1.6;">
        ${inner}
      </div>
      <div style="padding:16px 24px;border-top:1px solid #eef1f6;color:#9aa4b2;font-size:12px;">
        Bu e-posta ${productName} tarafından otomatik gönderildi.
      </div>
    </div>
  </div>`;
}

export interface WelcomeEmailParams {
  displayName: string;
  email: string;
  tempPassword: string;
  roleLabel: string;
  /** Mutlak giriş adresi (ör. https://ikkoneedu.com/login). Boşsa link gösterilmez. */
  loginUrl?: string;
}

/** Yeni oluşturulan hesap için giriş bilgilerini içeren karşılama e-postası. */
export function welcomeEmail(p: WelcomeEmailParams): { subject: string; html: string } {
  const subject = `${productName} hesabınız oluşturuldu`;
  const loginButton = p.loginUrl
    ? `<a href="${p.loginUrl}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:600;padding:11px 22px;border-radius:10px;font-size:14px;">Giriş Yap</a>`
    : "";
  const html = shell(`
    <p style="margin:0 0 12px;">Merhaba <strong>${escapeHtml(p.displayName)}</strong>,</p>
    <p style="margin:0 0 16px;">${productName} sisteminde sizin için <strong>${escapeHtml(p.roleLabel)}</strong> yetkisiyle bir hesap oluşturuldu. Aşağıdaki geçici bilgilerle giriş yapabilirsiniz:</p>
    <div style="background:#f6f8fc;border:1px solid #e6eaf2;border-radius:12px;padding:14px 16px;margin:0 0 16px;">
      <p style="margin:0 0 6px;"><span style="color:#6b7280;">Kullanıcı adı (e-posta):</span><br><strong>${escapeHtml(p.email)}</strong></p>
      <p style="margin:0;"><span style="color:#6b7280;">Geçici şifre:</span><br><strong style="font-size:18px;letter-spacing:1px;color:${NAVY};">${escapeHtml(p.tempPassword)}</strong></p>
    </div>
    <p style="margin:0 0 16px;color:#6b7280;font-size:13px;">Güvenliğiniz için <strong>ilk girişte yeni bir şifre belirlemeniz istenecektir</strong>. Giriş sırasında e-posta adresinize gelen 6 haneli doğrulama kodunu da girmeniz gerekebilir.</p>
    ${loginButton}
  `);
  return { subject, html };
}

/** Basit HTML kaçışı — kullanıcı adları/e-postalar şablonda güvenli görünsün. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
