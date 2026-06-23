# CODEX_CLAUDE_WORKFLOW.md — Çok Ajanlı Çalışma Düzeni

Bu projede birden fazla yapay zekâ ajanı çalışabilir. Karışıklığı önlemek için
roller ve kurallar nettir. **Tüm ajanlar önce `AGENTS.md` okur.**

## Ajan rolleri
- **ChatGPT (teknik lider / mimar):** mimari kararlar, faz planı, görev kırılımı.
- **Claude Code (ana uygulayıcı):** kod yazımı, refactor (kontrollü), uygulama.
- **Codex (GitHub bağlı reviewer / PR geliştirici):** PR inceleme, küçük
  düzeltmeler, CI ile uyum.

## Temel kural
- Aynı anda **iki ajan aynı branch üzerinde kontrolsüz çalışmaz.**
- Bir ajan **uygulama** yaptıysa, diğer ajan **review** için kullanılır.
- Her ajan değişiklik öncesi mevcut yapıyı anlar; rastgele refactor yapmaz.

## Branch yapısı (önerilen)
```
main                          # korumalı, her zaman deploy edilebilir
dev                           # entegrasyon
phase/01-foundation-audit
phase/02-routing-buttons
phase/03-firebase-security
phase/04-super-admin
phase/05-crm-appointments
phase/06-seo-production
```
- `main` korunur; doğrudan push yerine PR ile ilerlenir.
- Her faz **ayrı branch veya PR** ile ilerler.

## PR kuralları
Her PR açıklamasında **zorunlu** olarak şunlar bulunur:
1. **Değişen dosyalar** ve kısa amaç.
2. **Riskler** ve etkilenen alanlar.
3. **Test sonucu:** `npm run lint`, `npx tsc --noEmit`, `npm run build` çıktısı.
4. Geri alma (rollback) notu (gerekirse).

- **Build/lint geçmeden iş tamamlandı sayılmaz.**
- Codex review yaparken **`AGENTS.md` ve `DEVELOPMENT_RULES.md` dikkate alınır.**

## Büyük değişiklik akışı
1. Plan çıkar (etkilenen dosyalar, yaklaşım, riskler).
2. Plan onayı / netlik sağlanır.
3. Tek odaklı, küçük commit'lerle uygula.
4. lint + tsc + build → temiz.
5. PR aç, raporu doldur, review iste.

## Yasaklar (hatırlatma)
- Çalışan özelliği bozma, istenmeyen route/Firebase değişikliği, secret commit,
  gereksiz bağımlılık, hata gizleme (`ignoreBuildErrors`) — hepsi yasak.
