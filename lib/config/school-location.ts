/**
 * Okul konumu (geofence) yapılandırması — personel giriş-çıkış doğrulaması.
 *
 * ⚠️ DOLDURULACAK: Aşağıdaki koordinatlar PLACEHOLDER'dır (İstanbul merkez).
 * İngiliz Kültür Koleji'nin GERÇEK Google Maps koordinatını (enlem/boylam) ve
 * makul bir yarıçapı (metre) buraya yazın. Yanlış koordinat → tüm girişler
 * reddedilir. Koordinatı Google Maps'te sağ tık → "Buradaki konum" ile alın.
 */
export const SCHOOL_LOCATION = {
  /** Enlem (latitude) — PLACEHOLDER, gerçeğiyle değiştirin. */
  lat: 41.0082,
  /** Boylam (longitude) — PLACEHOLDER, gerçeğiyle değiştirin. */
  lng: 28.9784,
  /** İzin verilen yarıçap (metre). Okul kampüsünü kapsayacak şekilde ayarlayın. */
  radiusMeters: 200,
};

/**
 * Geofence zorunlu mu? true ise tarama yalnızca okul konumunda kabul edilir.
 * Gerçek koordinat girilene kadar test için geçici olarak false yapılabilir,
 * ancak ÜRETİMDE true olmalıdır (sahte/uzaktan giriş engeli).
 */
export const ATTENDANCE_GEOFENCE_ENABLED = true;

/** Giriş-çıkış kayıtlarının saklanma süresi (gün). ~1 ay. */
export const ATTENDANCE_RETENTION_DAYS = 31;
