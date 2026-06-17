/**
 * ikkoneedu — Geliştirme aşaması için statik örnek veriler.
 * Backend bağlanana kadar arayüzü beslemek amacıyla kullanılır.
 */

export interface Feature {
  id: string;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    id: "okul-yonetimi",
    title: "Okul Yönetimi",
    description:
      "Sınıf, ders ve personel süreçlerini tek panelden yönetin.",
  },
  {
    id: "veli-iletisimi",
    title: "Veli İletişimi",
    description:
      "Velilerle anlık, şeffaf ve düzenli iletişim kurun.",
  },
  {
    id: "ogrenci-deneyimi",
    title: "Öğrenci Deneyimi",
    description:
      "Öğrencilere kişiselleştirilmiş bir öğrenme yolculuğu sunun.",
  },
  {
    id: "yapay-zeka",
    title: "Yapay Zeka",
    description:
      "Eğitim süreçlerini yapay zeka ile akıllı hale getirin.",
  },
];
