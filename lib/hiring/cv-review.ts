/**
 * Öğretmen CV / başvuru "AI inceleme" — SAF MANTIK, demo-safe.
 *
 * Gerçek yapay zekâ YOK: anahtar-kelime sezgiselleri ile cihazda anında bir
 * değerlendirme üretir (özet skor, güçlü yön, eksik, branş eşleşmesi, öneri).
 * Gerçek LLM değerlendirmesi sonraki fazda bağlanacaktır. Hiçbir şey yazmaz.
 */

export interface CvReviewInput {
  /** Hedef branş / pozisyon (serbest metin: "Matematik", "İngilizce", ...). */
  branch: string;
  /** CV / başvuru metni. */
  text: string;
  /** Deneyim yılı (opsiyonel). */
  years?: number;
}

export type CvRecommendation = "invite" | "consider" | "reject";

export interface CvReviewSignal {
  /** i18n kodu: hiring.signal.<key> */
  key: string;
  found: boolean;
  /** Skora katkı (pozitif). */
  weight: number;
  /** Eksikse boşluk (gap) olarak gösterilsin mi? */
  critical: boolean;
}

export interface CvReviewResult {
  score: number; // 0-100
  recommendation: CvRecommendation;
  branchMatch: boolean;
  /** Bulunan olumlu sinyallerin i18n kodları. */
  strengths: string[];
  /** Beklenip bulunamayan (kritik) sinyallerin i18n kodları. */
  gaps: string[];
  /** Tüm sinyallerin şeffaf dökümü. */
  signals: CvReviewSignal[];
}

/** TR-uyumlu küçük harfe çevirme (İ/I kenar durumları dahil). */
function lower(s: string): string {
  return s.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
}

interface SignalDef {
  key: string;
  weight: number;
  critical: boolean;
  variants: string[];
}

// Sinyal sözlüğü — TR + bazı EN varyantları. Skorlar sezgiseldir (demo).
const SIGNALS: SignalDef[] = [
  { key: "formasyon", weight: 15, critical: true, variants: ["pedagojik formasyon", "formasyon", "pedagogical formation"] },
  { key: "lisans", weight: 10, critical: true, variants: ["lisans", "bachelor", "fakülte", "üniversite mezun", "eğitim fakültesi"] },
  { key: "yuksekLisans", weight: 10, critical: false, variants: ["yüksek lisans", "master", "msc", "tezli"] },
  { key: "doktora", weight: 8, critical: false, variants: ["doktora", "phd", "dr."] },
  { key: "experience", weight: 12, critical: true, variants: ["yıl deneyim", "yıllık deneyim", "tecrübe", "deneyim", "experience", "kıdem"] },
  { key: "languages", weight: 6, critical: false, variants: ["ingilizce", "english", "yabancı dil", "toefl", "ielts", "b2", "c1", "celta", "tömer"] },
  { key: "digital", weight: 6, critical: false, variants: ["dijital", "teknoloji", "eba", "akıllı tahta", "online", "z-kuşağı", "lms", "uzaktan eğitim"] },
  { key: "certification", weight: 6, critical: false, variants: ["sertifika", "certificate", "eğitim sertifikası", "hizmet içi"] },
  { key: "achievements", weight: 5, critical: false, variants: ["ödül", "proje", "olimpiyat", "başarı", "yayın", "makale", "award", "project"] },
  { key: "classroom", weight: 4, critical: false, variants: ["sınıf yönetimi", "rehberlik", "veli ileti", "ölçme değerlendirme", "müfredat"] },
];

const BASE_SCORE = 10;

/** Branş hedef metninin CV içinde geçip geçmediğini kontrol eder. */
function detectBranchMatch(branch: string, text: string): boolean {
  const b = lower(branch).trim();
  if (!b) return false;
  const t = lower(text);
  // Branş adını ve ilk kelimesini dene (örn. "Sınıf Öğretmenliği" → "sınıf").
  if (t.includes(b)) return true;
  const first = b.split(/\s+/)[0];
  return first.length >= 3 && t.includes(first);
}

/**
 * CV metnini sezgisel olarak değerlendirir. Saf, deterministik (aynı girdi →
 * aynı sonuç). Skor 0-100 arasına kırpılır.
 */
export function reviewCv(input: CvReviewInput): CvReviewResult {
  const text = lower(input.text);
  const signals: CvReviewSignal[] = SIGNALS.map((def) => ({
    key: def.key,
    weight: def.weight,
    critical: def.critical,
    found: def.variants.some((v) => text.includes(lower(v))),
  }));

  // Deneyim yılı verildiyse "experience" sinyalini güçlendir.
  const years = input.years ?? 0;
  if (years >= 3) {
    const exp = signals.find((s) => s.key === "experience");
    if (exp) exp.found = true;
  }

  const branchMatch = detectBranchMatch(input.branch, input.text);

  let score = BASE_SCORE;
  for (const s of signals) if (s.found) score += s.weight;
  if (branchMatch) score += 20;
  if (years > 0) score += Math.min(years, 10) * 1.2;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const strengths = signals.filter((s) => s.found).map((s) => s.key);
  if (branchMatch) strengths.unshift("branchMatch");

  const gaps = signals.filter((s) => !s.found && s.critical).map((s) => s.key);
  if (!branchMatch && input.branch.trim()) gaps.unshift("branchMatch");

  const recommendation: CvRecommendation =
    score >= 70 ? "invite" : score >= 45 ? "consider" : "reject";

  return { score, recommendation, branchMatch, strengths, gaps, signals };
}

/** Sık kullanılan branşlar (öneri listesi; serbest metin de girilebilir). */
export const COMMON_BRANCHES = [
  "Sınıf Öğretmenliği",
  "Matematik",
  "Türkçe",
  "İngilizce",
  "Fen Bilimleri",
  "Sosyal Bilgiler",
  "Okul Öncesi",
  "Rehberlik (PDR)",
  "Beden Eğitimi",
  "Müzik",
  "Görsel Sanatlar",
  "Bilişim Teknolojileri",
] as const;
