/**
 * Uygulama çalışma modu (tek doğruluk kaynağı).
 *
 * SINGLE_SCHOOL_MODE açıkken platform tek okula (İngiliz Kültür Koleji) aitmiş
 * gibi davranır: çoklu okul satış/yönetim yüzeyleri (okul ekleme, okul listesi,
 * tenant seçici, okul seçim ekranı) gizlenir/pasifleşir. Demo talebi açık kalır.
 *
 * GERİ ALINABİLİR: ileride çoklu okul satışı aktifleştirmek için bu bayrağı
 * `false` yapmak yeterlidir; kod silinmez, yalnızca koşullu gizlenir.
 */
export const SINGLE_SCHOOL_MODE = true;

/** Tek-okul modunda sahibi olan kurumun adı (görsel/branding amaçlı). */
export const FOUNDER_SCHOOL_NAME = "İngiliz Kültür Koleji";

/**
 * Kurucu okulun tenant kimliği. Veri işlemlerinde öncelik daima oturumdaki
 * `profile.tenantId`'dedir; bu sabit yalnızca tek-okul modunda makul bir
 * varsayılan/yedek olarak kullanılır.
 */
export const FOUNDER_TENANT_ID = "ingiliz-kultur";

/** Tek-okul modunda navigasyondan ve menülerden gizlenecek rota önekleri. */
export const SINGLE_SCHOOL_HIDDEN_ROUTES: string[] = ["/school-select"];
