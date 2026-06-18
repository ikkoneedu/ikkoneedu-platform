# Yapay Zeka Entegrasyon Planı

> Durum: **Hazırlık.** Gerçek API çağrısı yok; sağlayıcıdan bağımsız sözleşme
> ve mock servis tanımlandı.

## Desteklenecek Sağlayıcılar

| Sağlayıcı | Env Anahtarı | Örnek Model |
|-----------|--------------|-------------|
| OpenAI | `OPENAI_API_KEY` | `gpt-4o` |
| Anthropic Claude | `ANTHROPIC_API_KEY` | `claude-opus-4-8` |
| Google Gemini | `GEMINI_API_KEY` | `gemini-1.5-pro` |

## Soyutlama

- `lib/ai/provider.ts` — sağlayıcı kaydı ve durumları
- `lib/ai/models.ts` — model kataloğu
- `lib/ai/prompts.ts` — rol bazlı sistem promptları
- `lib/ai/usage.ts` — tenant kotası ve token kullanımı
- `lib/ai/service.ts` — `sendChat(req)` sözleşmesi (mock)

## Çağrı Akışı (ileride)

```
UI -> sendChat({ provider, model, tenantId, role, messages })
   -> [server] kota kontrolü (lib/ai/usage)
   -> [server] sağlayıcı SDK (OpenAI / Anthropic / Gemini)
   -> kullanım kaydı (Firestore) + KVKK log
   -> AiChatResponse
```

## Güvenlik

- Anahtarlar **yalnızca sunucu** ortam değişkenlerinde; istemciye sızdırılmaz.
- Rol bazlı yetki (`lib/auth`) ile model/limit erişimi kontrol edilir.
- İçerik güvenlik filtresi prompt/moderation katmanında uygulanır.
