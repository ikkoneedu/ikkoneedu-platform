/**
 * Firebase Auth hata kodlarını kullanıcı dostu Türkçe mesajlara çevirir.
 */

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Geçersiz e-posta adresi.",
  "auth/user-disabled": "Bu hesap devre dışı bırakılmış.",
  "auth/user-not-found": "Bu e-posta ile kayıtlı bir kullanıcı bulunamadı.",
  "auth/wrong-password": "E-posta veya şifre hatalı.",
  "auth/invalid-credential": "E-posta veya şifre hatalı.",
  "auth/invalid-login-credentials": "E-posta veya şifre hatalı.",
  "auth/too-many-requests":
    "Çok fazla başarısız deneme. Lütfen biraz sonra tekrar deneyin.",
  "auth/network-request-failed":
    "Ağ hatası. İnternet bağlantınızı kontrol edin.",
  "auth/email-already-in-use": "Bu e-posta zaten kullanımda.",
  "auth/weak-password": "Şifre çok zayıf (en az 6 karakter).",
  "auth/operation-not-allowed":
    "E-posta/şifre girişi Firebase Console'da etkinleştirilmemiş.",
};

interface FirebaseLikeError {
  code?: string;
  message?: string;
}

/** Bir hatayı Türkçe, kullanıcıya gösterilebilir bir mesaja çevirir. */
export function getAuthErrorMessage(error: unknown): string {
  const code = (error as FirebaseLikeError)?.code ?? "";
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }
  return "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.";
}
