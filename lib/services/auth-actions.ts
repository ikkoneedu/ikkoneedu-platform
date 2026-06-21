/**
 * Auth yardımcı işlemleri (istemci tarafı).
 *
 * - sendPasswordReset: kullanıcıya şifre sıfırlama/belirleme e-postası gönderir.
 *   Yeni oluşturulan kurucu/personel hesaplarının geçici şifre yerine kendi
 *   şifresini belirlemesi için kullanılır.
 *
 * Mock modda (Firebase env yok) gerçek e-posta gönderilmez; başarı döner.
 */

import { sendPasswordResetEmail } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

export interface AuthActionResult {
  ok: boolean;
  mock: boolean;
  error?: string;
}

export async function sendPasswordReset(email: string): Promise<AuthActionResult> {
  const target = email.trim().toLowerCase();
  if (!isFirebaseConfigured() || !auth) {
    return { ok: true, mock: true };
  }
  try {
    await sendPasswordResetEmail(auth, target);
    return { ok: true, mock: false };
  } catch (error) {
    return {
      ok: false,
      mock: false,
      error: error instanceof Error ? error.message : "E-posta gönderilemedi.",
    };
  }
}
