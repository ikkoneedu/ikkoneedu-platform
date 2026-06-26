/**
 * Sınav / quiz üretici (SAF MANTIK, demo-safe).
 *
 * Gerçek LLM YOK. Matematik soruları seed'li PRNG ile PROSEDÜREL üretilir
 * (her seed yeni ama deterministik sorular); diğer dersler küratörlü bankadan
 * seçilir. Deterministiktir (aynı seed → aynı quiz). Hiçbir şey yazmaz.
 */

export const EXAM_SUBJECTS = ["math", "turkish", "english", "science", "social"] as const;
export type ExamSubject = (typeof EXAM_SUBJECTS)[number];

export const EXAM_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type ExamDifficulty = (typeof EXAM_DIFFICULTIES)[number];

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  difficulty: ExamDifficulty;
}

export interface QuizInput {
  subject: ExamSubject;
  count: number;
  difficulty: ExamDifficulty;
  /** Deterministik tohum; değiştikçe yeni varyasyon üretir. */
  seed: number;
}

/** mulberry32 — küçük, deterministik PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rnd: () => number, min: number, max: number): number {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

/** Diziyi tohuma göre deterministik karıştırır (Fisher-Yates). */
function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DIFF_RANGE: Record<ExamDifficulty, [number, number]> = {
  easy: [2, 20],
  medium: [10, 99],
  hard: [25, 499],
};

/** Tek bir matematik sorusu prosedürel üretir (4 şıklı). */
function makeMathQuestion(rnd: () => number, difficulty: ExamDifficulty, idx: number): QuizQuestion {
  const [lo, hi] = DIFF_RANGE[difficulty];
  const ops = difficulty === "easy" ? ["+", "-"] : difficulty === "medium" ? ["+", "-", "×"] : ["+", "-", "×"];
  const op = ops[randInt(rnd, 0, ops.length - 1)];
  let a = randInt(rnd, lo, hi);
  let b = randInt(rnd, lo, hi);
  if (op === "-" && b > a) [a, b] = [b, a];
  if (op === "×") {
    a = randInt(rnd, 2, difficulty === "hard" ? 25 : 12);
    b = randInt(rnd, 2, difficulty === "hard" ? 25 : 12);
  }
  const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;

  const distractors = new Set<number>();
  let guard = 0;
  while (distractors.size < 3 && guard < 50) {
    guard++;
    const delta = randInt(rnd, 1, Math.max(3, Math.round(Math.abs(answer) * 0.15) + 2));
    const sign = rnd() < 0.5 ? -1 : 1;
    const cand = answer + sign * delta;
    if (cand !== answer && cand >= 0) distractors.add(cand);
  }
  const optionValues = shuffle([answer, ...distractors], rnd);
  return {
    id: `math-${idx}`,
    prompt: `${a} ${op} ${b} = ?`,
    options: optionValues.map((v) => String(v)),
    correctIndex: optionValues.indexOf(answer),
    difficulty,
  };
}

interface BankQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  difficulty: ExamDifficulty;
}

// Küratörlü soru bankaları (demo). İçerik dersin doğal dilindedir.
const BANK: Record<Exclude<ExamSubject, "math">, BankQuestion[]> = {
  turkish: [
    { prompt: "Aşağıdakilerden hangisi sıfattır?", options: ["koşmak", "kırmızı", "hızlıca", "kitap"], correctIndex: 1, difficulty: "easy" },
    { prompt: "“Göz” kelimesi aşağıdaki cümlelerin hangisinde mecaz anlamda kullanılmıştır?", options: ["Gözüm ağrıyor.", "Çeşmenin gözünden su akıyor.", "Gözlük taktı.", "Gözünü kapattı."], correctIndex: 1, difficulty: "medium" },
    { prompt: "Aşağıdaki sözcüklerden hangisi yapım eki almıştır?", options: ["evler", "kitabı", "gözlükçü", "okula"], correctIndex: 2, difficulty: "medium" },
    { prompt: "“Çabuk” sözcüğünün türü nedir?", options: ["İsim", "Zarf", "Bağlaç", "Edat"], correctIndex: 1, difficulty: "easy" },
    { prompt: "Hangi cümlede yazım yanlışı vardır?", options: ["Yarın geleceğim.", "Herkez geldi.", "Bugün hava güzel.", "Kitabı okudum."], correctIndex: 1, difficulty: "easy" },
    { prompt: "“Ses bayrağım” tamlaması hangi söz sanatına örnektir?", options: ["Benzetme", "Kişileştirme", "İstiare", "Abartma"], correctIndex: 2, difficulty: "hard" },
  ],
  english: [
    { prompt: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], correctIndex: 1, difficulty: "easy" },
    { prompt: "Choose the correct past tense: I ___ a book yesterday.", options: ["read", "reads", "reading", "to read"], correctIndex: 0, difficulty: "easy" },
    { prompt: "Which word is a synonym of 'happy'?", options: ["sad", "joyful", "angry", "tired"], correctIndex: 1, difficulty: "easy" },
    { prompt: "They have lived here ___ 2010.", options: ["for", "since", "from", "at"], correctIndex: 1, difficulty: "medium" },
    { prompt: "If I ___ rich, I would travel the world.", options: ["am", "was", "were", "be"], correctIndex: 2, difficulty: "hard" },
    { prompt: "Pick the correct plural: one child, two ___.", options: ["childs", "childes", "children", "child"], correctIndex: 2, difficulty: "easy" },
  ],
  science: [
    { prompt: "Suyun kimyasal formülü nedir?", options: ["CO₂", "H₂O", "O₂", "NaCl"], correctIndex: 1, difficulty: "easy" },
    { prompt: "Bitkiler besinlerini hangi olayla üretir?", options: ["Solunum", "Fotosentez", "Terleme", "Sindirim"], correctIndex: 1, difficulty: "easy" },
    { prompt: "Aşağıdakilerden hangisi bir kuvvet birimidir?", options: ["Joule", "Newton", "Watt", "Volt"], correctIndex: 1, difficulty: "medium" },
    { prompt: "Dünya'nın doğal uydusu hangisidir?", options: ["Güneş", "Mars", "Ay", "Venüs"], correctIndex: 2, difficulty: "easy" },
    { prompt: "Maddenin hâl değiştirmesinde sıcaklık sabitken katıdan sıvıya geçişe ne denir?", options: ["Donma", "Erime", "Buharlaşma", "Yoğuşma"], correctIndex: 1, difficulty: "medium" },
    { prompt: "İnsan vücudunda kanı pompalayan organ hangisidir?", options: ["Akciğer", "Böbrek", "Kalp", "Karaciğer"], correctIndex: 2, difficulty: "easy" },
  ],
  social: [
    { prompt: "Türkiye Cumhuriyeti hangi yıl kurulmuştur?", options: ["1920", "1923", "1919", "1938"], correctIndex: 1, difficulty: "easy" },
    { prompt: "Aşağıdakilerden hangisi bir kıta değildir?", options: ["Asya", "Avrupa", "Atlas", "Afrika"], correctIndex: 2, difficulty: "easy" },
    { prompt: "İstanbul'u fetheden Osmanlı padişahı kimdir?", options: ["Yavuz Selim", "Fatih Sultan Mehmet", "Kanuni", "Orhan Bey"], correctIndex: 1, difficulty: "medium" },
    { prompt: "Bir yerin yeryüzü şekillerini gösteren haritalara ne denir?", options: ["Siyasi harita", "Fiziki harita", "Dilsiz harita", "Nüfus haritası"], correctIndex: 1, difficulty: "medium" },
    { prompt: "Demokraside egemenlik kime aittir?", options: ["Krala", "Millete", "Orduya", "Meclis başkanına"], correctIndex: 1, difficulty: "easy" },
    { prompt: "Türkiye hangi iki kıtada toprağa sahiptir?", options: ["Asya-Afrika", "Avrupa-Asya", "Avrupa-Afrika", "Asya-Amerika"], correctIndex: 1, difficulty: "easy" },
  ],
};

/**
 * İstenen ders/zorluk/sayıya göre deterministik quiz üretir.
 * Matematik prosedüreldir; diğerleri bankadan zorluk önceliğiyle seçilir.
 */
export function generateQuiz(input: QuizInput): QuizQuestion[] {
  const count = Math.max(1, Math.min(20, Math.floor(input.count)));
  const rnd = mulberry32(input.seed * 2654435761 + input.subject.length * 97 + input.difficulty.length);

  if (input.subject === "math") {
    return Array.from({ length: count }, (_, i) => makeMathQuestion(rnd, input.difficulty, i + 1));
  }

  const pool = BANK[input.subject];
  // Zorluk önce; yetmezse diğer zorluklardan tamamla. Tohuma göre karıştır.
  const preferred = shuffle(pool.filter((q) => q.difficulty === input.difficulty), rnd);
  const rest = shuffle(pool.filter((q) => q.difficulty !== input.difficulty), rnd);
  const ordered = [...preferred, ...rest];
  const picked: QuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const src = ordered[i % ordered.length];
    // Şıkları da karıştır (doğru cevabı yeniden konumla).
    const correctText = src.options[src.correctIndex];
    const shuffledOpts = shuffle(src.options, rnd);
    picked.push({
      id: `${input.subject}-${i + 1}`,
      prompt: src.prompt,
      options: shuffledOpts,
      correctIndex: shuffledOpts.indexOf(correctText),
      difficulty: src.difficulty,
    });
  }
  return picked;
}
