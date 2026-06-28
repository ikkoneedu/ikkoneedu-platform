/**
 * Okul konumu (geofence) yapılandırması — personel giriş-çıkış doğrulaması.
 *
 * İngiliz Kültür Koleji'nin gerçek Google Maps koordinatı. Tarama yalnızca bu
 * noktanın `radiusMeters` yarıçapı içinde kabul edilir. Kampüs sınırını
 * değiştirmek için yalnızca yarıçapı güncelleyin.
 */
export const SCHOOL_LOCATION = {
  /** Enlem (latitude) — İngiliz Kültür Koleji. */
  lat: 39.98668852119746,
  /** Boylam (longitude) — İngiliz Kültür Koleji. */
  lng: 32.71039317714647,
  /** İzin verilen yarıçap (metre). Okul kampüsünü kapsar. */
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
