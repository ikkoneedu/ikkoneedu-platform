/**
 * Ortak form doğrulama parçaları (Zod).
 * Türkçe hata mesajları; demo ve bursluluk formları tarafından paylaşılır.
 */

import { z } from "zod";

/** Ad soyad: en az 2 kelime gibi katı kural yerine makul minimum. */
export const fullNameSchema = z
  .string()
  .trim()
  .min(3, "Ad soyad en az 3 karakter olmalıdır.")
  .max(80, "Ad soyad çok uzun.");

export const emailSchema = z
  .string()
  .trim()
  .min(1, "E-posta zorunludur.")
  .email("Geçerli bir e-posta adresi girin.");

/**
 * Türkiye telefon numarası — esnek: boşluk, parantez, tire ve +90 kabul edilir.
 * En az 10 rakam (alan kodu + numara) aranır.
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Telefon zorunludur.")
  .refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 13;
  }, "Geçerli bir telefon numarası girin.");

export const schoolNameSchema = z
  .string()
  .trim()
  .min(2, "Okul/kurum adı en az 2 karakter olmalıdır.")
  .max(120, "Okul/kurum adı çok uzun.");

/** 11 haneli TC Kimlik No (yalnızca uzunluk/rakam kontrolü — mock seviyesi). */
export const tcNoSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{11}$/.test(value),
    "TC Kimlik No 11 haneli olmalıdır.",
  );

/**
 * Honeypot alanı: gerçek kullanıcılar bu gizli alanı doldurmaz.
 * Doluysa bot kabul edilir.
 */
export const honeypotSchema = z
  .string()
  .max(0, "Spam tespit edildi.")
  .optional()
  .or(z.literal(""));
