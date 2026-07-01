# Kimlik Doğrulama & Onboarding Kurulum Rehberi

Bu belge, IKK ONE EDU giriş sistemini (e-posta + doğrulama kodu, telefonla
giriş, kullanıcı oluşturma/silme) üretimde çalışır hâle getirmek için gereken
tüm ayarları tek yerde toplar. Sırasıyla uygulayın.

> Özet: Kod tarafı hazırdır. Aşağıdaki adımların çoğu **Firebase Console**,
> **Resend** ve **Vercel ortam değişkenleri** üzerinde yapılır.

---

## 1. Ortam değişkenleri (Vercel → Settings → Environment Variables)

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Önerilir | Uygulamanın kök adresi (ör. `https://ikkoneedu.com`). Hoş geldin e-postasındaki "Giriş Yap" bağlantısı bunu kullanır. |
| `NEXT_PUBLIC_FIREBASE_*` | Evet | Firebase web yapılandırması (API key, authDomain, projectId, storageBucket, messagingSenderId, appId). |
| `FIREBASE_ADMIN_*` | Evet | Admin SDK service account (kullanıcı oluşturma/silme, OTP, claim'ler için). |
| `ATTENDANCE_QR_SECRET` | Evet | QR yoklama token imzalama anahtarı (HMAC). |
| `RESEND_API_KEY` | Evet (e-posta) | Resend API anahtarı — doğrulama kodu ve hoş geldin e-postaları için. |
| `RESEND_FROM_EMAIL` | Evet (e-posta) | Gönderen adresi, ör. `IKK ONE EDU <dogrulama@ikkoneedu.com>`. **Doğrulanmış alan adıyla aynı olmalı.** |
| `CRON_SECRET` | Evet (cron) | Günlük cron ucu koruması. |

> ⚠️ Ortam değişkeni ekledikten/değiştirdikten sonra **yeniden deploy** almanız
> gerekir (Vercel değişkenleri yalnızca yeni deploy'da etkin olur).

---

## 2. Firebase — Auth & Firestore

1. **Authentication → Sign-in method → Email/Password**: etkin olmalı.
2. **Firestore Security Rules** dağıtımı: bu repodaki `firestore.rules` her
   güncellendiğinde deploy edilmeli:
   ```bash
   firebase deploy --only firestore:rules
   ```
   (Yeni koleksiyonlar: `permissionGrants`, `studentAttendanceLogs`,
   `attendanceDevices`, `attendanceScanLogs`, `deletedUsers`, `otpCodes` ve
   `users` üzerindeki `phoneVerified` izni.)
3. **Admin SDK**: Firebase Console → Project Settings → Service accounts →
   "Generate new private key". JSON içindeki değerleri `FIREBASE_ADMIN_*`
   ortam değişkenlerine girin.

---

## 3. E-posta doğrulama kodu (Resend alan adı doğrulama)

E-posta ile giriş yapan **her** kullanıcıya 6 haneli kod gönderilir. Kodun
herkese ulaşması için Resend'de bir alan adı doğrulanmalıdır — aksi hâlde
Resend "sandbox" modunda yalnız **kendi hesap e-postanıza** gönderim yapar.

1. https://resend.com/domains → **Add Domain** → `ikkoneedu.com`.
2. Resend'in verdiği DNS kayıtlarını (DKIM/SPF, gerekirse MX) alan adının DNS
   yönetim panelinize **birebir** ekleyin.
3. Resend'de **Verify** → durum yeşile dönene kadar bekleyin (DNS yayılımı,
   birkaç dakika–saat).
4. Vercel'de `RESEND_FROM_EMAIL = IKK ONE EDU <dogrulama@ikkoneedu.com>`
   (gönderen alan adı, doğruladığınız alan adıyla aynı olmalı) → **redeploy**.
5. Test: farklı bir e-postayla test kullanıcısı oluşturup giriş yapın; kod o
   adrese ulaşmalı.

> Doğrulama tamamlanana kadar yeni kullanıcılar giriş kodunu alamaz; onboarding
> yaparken bunu göz önünde bulundurun.

---

## 4. Telefonla giriş (Firebase Phone Auth — SMS)

Telefon sekmesi ancak aşağıdaki ayarlar yapıldığında çalışır:

1. Firebase projesinde **Blaze (kullandıkça öde) planı** aktif olmalı (SMS
   ücretlidir).
2. **Authentication → Sign-in method → Phone** → *Enable*.
3. **Authentication → Settings → Authorized domains**: production alan adınızı
   ekleyin (reCAPTCHA doğrulaması için).

**Kullanım akışı:**
- Kullanıcı önce e-posta ile giriş yapar → **Profil** sayfasından "Telefonu
  doğrula" ile numarasını kendi hesabına bağlar (SMS kodu girer).
- Sonraki girişlerde `/login` → **Telefon** sekmesi → numara → SMS kodu ile
  girebilir. (Telefonla girişte e-posta kodu istenmez; SMS kodu ikinci
  faktördür.)

---

## 5. Süper admin hesabı

İlk süper admin, Firebase Console'dan elle oluşturulur:
1. **Authentication → Users → Add user** (e-posta + geçici şifre).
2. **Firestore → `users/{uid}`** belgesi oluşturun:
   ```json
   {
     "uid": "<AUTH_UID>",
     "email": "ikkoneedu@gmail.com",
     "displayName": "Sistem Yöneticisi",
     "role": "SUPER_ADMIN",
     "tenantId": "platform",
     "schoolId": "platform",
     "status": "ACTIVE"
   }
   ```
Sonraki tüm hesaplar Süper Admin/okul yönetimi panellerinden oluşturulabilir.

---

## 6. Kullanıcı oluşturma / silme / geri yükleme

- **Oluşturma:** Süper Admin konsolu veya okul yönetimi "Personel" ekranından.
  Geçici şifre üretilir, ekranda gösterilir **ve** (e-posta servisi hazırsa)
  kullanıcıya "hoş geldin" e-postasıyla gönderilir. Kullanıcı ilk girişte
  şifresini değiştirmek zorundadır (`mustChangePassword`).
- **Rol hiyerarşisi (kim kimi oluşturabilir):**
  - Süper Admin: her rol, her okul.
  - Kurucu / Genel Müdür (`SCHOOL_ADMIN`) / Müdür: öğrenci/veli + tüm personel.
  - Müdür Yrd. / Koordinatör: öğrenci/veli + alt kadro (üst yönetim hariç).
  - Öğretmen / Halkla İlişkiler / Satış: yalnız öğrenci/veli.
- **Silme (yalnız Süper Admin):** kullanıcı `deletedUsers` koleksiyonuna
  yedeklenip Auth + `users` belgesinden silinir. Süper admin kendini veya son
  aktif süper admini silemez.
- **Geri yükleme:** Süper Admin konsolundaki "Silinen Kullanıcılar"
  bölümünden; aynı `uid` ile hesap yeniden açılır ve yeni geçici şifre üretilir.

---

## 7. Giriş akışı (özet)

**E-posta:** e-posta + şifre → doğru ise e-postaya 6 haneli kod → kod doğru ise
panele yönlendirme. (Kod, tarayıcı sekmesi/oturumu bazında `sessionStorage`
ile takip edilir; `RoleGuard` kodu tamamlamayanları `/login?step=otp`e yollar.)

**Telefon:** numara → SMS kodu → panel. (Numara önceden profil sayfasından
doğrulanmış/bağlanmış olmalı.)

> Güvenlik notu: İstemci tarafı `RoleGuard`/rol kontrolleri UX içindir; asıl
> güvenlik **Firestore Security Rules** ile sağlanır (bkz. `firestore.rules`).
