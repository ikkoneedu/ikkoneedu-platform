/**
 * Firebase ile ilgili yardımcı tipler (hazırlık).
 */

/** Firestore belgesi için ortak meta alanları. */
export interface FirestoreDocument {
  id: string;
  tenantId: string;
  createdAt: string;
  updatedAt?: string;
}

/** Firebase Auth custom claims yapısı (ileride). */
export interface AuthClaims {
  tenantId: string;
  role: string;
}
