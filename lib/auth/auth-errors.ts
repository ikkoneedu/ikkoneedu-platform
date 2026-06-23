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
  "auth/unauthorized-domain":
    "Bu domain Firebase Authentication > Authorized domains listesinde değil. Vercel domainini Firebase Console'a ekleyip yeniden deneyin.",
  "auth/api-key-not-valid":
    "Firebase API anahtarı geçersiz görünüyor. Vercel NEXT_PUBLIC_FIREBASE_* ortam değişkenlerini kontrol edin.",
  "auth/invalid-api-key":
    "Firebase API anahtarı geçersiz görünüyor. Vercel NEXT_PUBLIC_FIREBASE_* ortam değişkenlerini kontrol edin.",
  "auth/project-not-found":
    "Firebase projesi bulunamadı. Vercel NEXT_PUBLIC_FIREBASE_PROJECT_ID değerini kontrol edin.",
  "auth/configuration-not-found":
    "Firebase Authentication yapılandırması bulunamadı. Firebase Console'da Email/Password girişinin açık olduğundan ve doğru projeye bağlı olduğunuzdan emin olun.",
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
