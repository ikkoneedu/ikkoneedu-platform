# AI Entegrasyon Planı

> Durum: **Hazırlık.** Gerçek AI API çağrısı yok; sağlayıcıdan bağımsız
> sözleşme ve mock servis hazır (`lib/ai/*`).

## Desteklenecek Sağlayıcılar

| Sağlayıcı | Env Anahtarı | Örnek Model |
|-----------|--------------|-------------|
| OpenAI | `OPENAI_API_KEY` | `gpt-4o` |
| Anthropic Claude | `ANTHROPIC_API_KEY` | `claude-opus-4-8` |
| Google Gemini | `GEMINI_API_KEY` | `gemini-1.5-pro` |

## Soyutlama (`lib/ai`)

- `provider.ts` — sağlayıcı kaydı/durumu
- `models.ts` — model kataloğu
- `prompts.ts` — rol bazlı sistem promptları
- `usage.ts` — tenant kotası ve token kullanımı
- `service.ts` — `sendChat(req)` sözleşmesi (mock)

İlgili tipler: `AiMessage`, `AiChatRequest/Response`, `AiUsage`, `AiInsight`.

## AI Modülleri ↔ Sayfa

| Modül | Sayfa | Görev |
|-------|-------|-------|
| AI Brain | `/ai-brain` | Kurumsal asistan/sohbet |
| AI Sınav | `/exam-ai` | Sınav/quiz/çalışma kağıdı |
| AI Ders Programı | `/scheduler-ai` | Çakışmasız program |
| AI Karne | `/report-card-ai` | Karne yorumu üretimi |
| AI Kayıt Danışmanı | `/admissions-ai` | Aday veli danışmanlığı |
| AI Finans | `/finance` | Finansal öngörü |
| AI Rehberlik | `/counseling` | Rehberlik önerileri |

## Çağrı Akışı (ileride)

```
UI -> sendChat({ provider, model, tenantId, role, messages })
   -> [server] kota kontrolü (lib/ai/usage)
   -> [server] sağlayıcı SDK (OpenAI / Anthropic / Gemini)
   -> kullanım kaydı (aiUsage) + KVKK log
   -> AiChatResponse
```

## Güvenlik

- Anahtarlar **yalnızca sunucu** ortam değişkenlerinde; istemciye sızdırılmaz.
- Rol bazlı yetki (`lib/auth`) model/limit erişimini kontrol eder.
- İçerik güvenlik filtresi prompt/moderation katmanında.
