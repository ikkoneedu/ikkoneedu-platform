/**
 * Akıllı Ders Programı Oluşturucu (demo-safe, çalışan) sözlüğü TR/EN.
 */

export const tr = {
  "sched.demo.title": "Çalışan demo · gerçek AI optimizasyonu sonraki faz",
  "sched.demo.body": "Bu program, çakışmasız kısıt-çözümü ile cihazınızda anında üretilir (bir öğretmen aynı saatte tek sınıfta). Gelişmiş yapay zekâ optimizasyonu (tercih, yük dengeleme, boşluk azaltma) sonraki fazda bağlanacaktır.",

  "sched.cfg.title": "Program ayarları",
  "sched.cfg.classes": "Sınıf sayısı",
  "sched.cfg.hours": "Günlük ders saati",
  "sched.cfg.sample": "Örnek doldur",
  "sched.cfg.lessons": "Dersler (her sınıfa uygulanır)",
  "sched.cfg.subject": "Ders",
  "sched.cfg.teacher": "Öğretmen",
  "sched.cfg.perWeek": "Saat/hafta",
  "sched.cfg.addLesson": "Ders ekle",
  "sched.cfg.removeLesson": "Dersi çıkar",
  "sched.generate": "Programı oluştur",

  "sched.result.empty": "Dersleri girip “Programı oluştur”a basın.",
  "sched.result.summary": "{placed} / {required} ders saati yerleşti",
  "sched.result.allPlaced": "Tüm dersler çakışmasız yerleştirildi.",
  "sched.result.unplaced": "Yerleştirilemeyen ({count})",
  "sched.result.unplacedRow": "{className} · {subject} ({teacher}): {missing} saat sığmadı",
  "sched.result.classLabel": "Sınıf",
  "sched.result.teacherLoad": "Öğretmen yükü",
  "sched.result.empty.cell": "—",
  "sched.err.noLessons": "Lütfen en az bir ders ekleyin.",
  "sched.hour": "{n}. saat",
  "sched.day.0": "Pzt",
  "sched.day.1": "Sal",
  "sched.day.2": "Çar",
  "sched.day.3": "Per",
  "sched.day.4": "Cum",
} as const;

export const en = {
  "sched.demo.title": "Working demo · real AI optimization next phase",
  "sched.demo.body": "This timetable is generated instantly on your device with conflict-free constraint solving (a teacher is in only one class per slot). Advanced AI optimization (preferences, load balancing, gap reduction) will be connected in the next phase.",

  "sched.cfg.title": "Timetable settings",
  "sched.cfg.classes": "Number of classes",
  "sched.cfg.hours": "Lessons per day",
  "sched.cfg.sample": "Fill sample",
  "sched.cfg.lessons": "Lessons (applied to each class)",
  "sched.cfg.subject": "Subject",
  "sched.cfg.teacher": "Teacher",
  "sched.cfg.perWeek": "Hrs/week",
  "sched.cfg.addLesson": "Add lesson",
  "sched.cfg.removeLesson": "Remove lesson",
  "sched.generate": "Generate timetable",

  "sched.result.empty": "Enter lessons and press “Generate timetable”.",
  "sched.result.summary": "{placed} / {required} lesson hours placed",
  "sched.result.allPlaced": "All lessons placed without conflicts.",
  "sched.result.unplaced": "Unplaced ({count})",
  "sched.result.unplacedRow": "{className} · {subject} ({teacher}): {missing} hours did not fit",
  "sched.result.classLabel": "Class",
  "sched.result.teacherLoad": "Teacher load",
  "sched.result.empty.cell": "—",
  "sched.err.noLessons": "Please add at least one lesson.",
  "sched.hour": "Hour {n}",
  "sched.day.0": "Mon",
  "sched.day.1": "Tue",
  "sched.day.2": "Wed",
  "sched.day.3": "Thu",
  "sched.day.4": "Fri",
} as const;
