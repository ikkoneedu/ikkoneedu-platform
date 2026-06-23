# DEPLOY.md — Firestore Rules Deploy & Custom Claims (Codespaces)

> Bu işlemler **gerçek Firebase kimlik bilgisi** gerektirir; CI/sandbox/ajan
> ortamından yapılamaz. GitHub Codespaces veya yerel makinede yapılır.

## 0. Ön koşullar
- GitHub Codespaces içinde bu repo açık.
- Firebase projesine erişim (Owner/Editor).
- Service account anahtarı (custom claims için): Firebase Console →
  **Project Settings → Service accounts → Generate new private key**.

## 1. Firebase CLI kurulumu (Codespaces)
```bash
npm install -g firebase-tools
firebase --version
```

## 2. Giriş ve proje seçimi
Codespaces tarayıcı tabanlı olduğu için **headless** giriş kullanın:
```bash
firebase login --no-localhost
# Çıkan URL'yi tarayıcıda açın, kodu terminale yapıştırın.

# Projeyi bu repoya bağla (.firebaserc oluşturur):
firebase use --add
# Listeden projeyi seç, alias olarak "default" ver.
```
> `.firebaserc` commit edilebilir (gizli değildir, yalnız proje id içerir).
> Alternatif: her komutta `--project <PROJECT_ID>` geç.

## 3. Firestore Security Rules deploy
```bash
# Önce kuralları doğrula (söz dizimi/derleme):
firebase deploy --only firestore:rules --dry-run

# Sorun yoksa yayınla:
firebase deploy --only firestore:rules
```
> Yalnız `firestore.rules` deploy edilir (`firebase.json` bunu işaret eder).
> İndeksler için: `firebase deploy --only firestore:indexes`.

## 4. İlk SUPER_ADMIN için custom claims (bootstrap)
İlk yönetici Firestore profiline sahip olsa da token'ında `role/tenantId`
**claim'i yoktur**. Bunu bir kez bootstrap script ile atarsınız.

```bash
# .env.local içinde FIREBASE_ADMIN_* dolu olmalı (service account).
# cp .env.local.example .env.local  → değerleri doldur.

npm run firebase:set-claims -- <UID> SUPER_ADMIN system system
#                               │      │           │      └ schoolId (ops.)
#                               │      │           └ tenantId
#                               │      └ role
#                               └ Auth kullanıcı UID'si (Firebase Console > Authentication)
```
Çıktı `✅ Claim atandı` ise tamamdır. Kullanıcı **çıkış/yeniden giriş** yapınca
(veya token yenilenince) claim etkin olur.

## 5. Sonraki kullanıcılarda claim akışı (otomatik)
- **Yeni yönetilen hesaplar** (`/api/admin/create-user`) oluşturulurken
  `role/tenantId/schoolId` claim'i **otomatik** atanır (kod tarafında halledildi).
- **Mevcut kullanıcıya** runtime'da claim atamak için: bir SUPER_ADMIN
  `POST /api/admin/set-claims` çağırır
  (`{ idToken, targetUid, role, tenantId, schoolId? }`). Yetki sunucuda doğrulanır.

## 6. Doğrulama
```bash
# Kuralların yayınlandığını Console > Firestore > Rules sekmesinden görün.
npm run firebase:check   # .env.local bağlantısını test eder
```
Uygulamada bir hesapla giriş yapıp yetkili/yetkisiz ekranların doğru
davrandığını kontrol edin. Token claim'lerini tarayıcı konsolunda
`firebase.auth().currentUser.getIdTokenResult()` ile inceleyebilirsiniz.

## Notlar / güvenlik
- Güvenlik kuralları **kaynak doğruluk** olarak Firestore `users/{uid}` profilini
  kullanır; claim'ler ek/optimizasyon katmanıdır. Bu yüzden claim atanmamış
  kullanıcılar kilitlenmez (geriye dönük uyumlu).
- `.env.local` ve service account anahtarı **ASLA commit edilmez**
  (bkz. `SECURITY_CHECKLIST.md`).
- Production'a kural deploy etmeden canlıya çıkılmaz.
