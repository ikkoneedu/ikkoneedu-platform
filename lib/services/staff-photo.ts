/**
 * Personel kimlik kartı fotoğrafı yükleme (Firebase Storage).
 *
 * Yol: staffPhotos/{uid}/photo_<ts>.<ext>. Storage kuralları (storage.rules)
 * yalnızca sahibinin yazmasına, herkesin okumasına izin verir. Yüklenen
 * görselin indirilebilir URL'i döner; bu URL profile (photoURL) kaydedilir.
 */

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadStaffPhoto(uid: string, file: File): Promise<string> {
  if (!storage) throw new Error("Depolama yapılandırılmamış.");
  if (!file.type.startsWith("image/")) throw new Error("Yalnızca görsel yükleyebilirsiniz.");
  if (file.size > MAX_BYTES) throw new Error("Görsel en fazla 5 MB olabilir.");
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `staffPhotos/${uid}/photo_${file.lastModified}.${ext || "jpg"}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
