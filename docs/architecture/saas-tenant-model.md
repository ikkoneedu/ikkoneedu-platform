# SaaS Multi-Tenant Modeli

> Durum: **Hazırlık.** `lib/tenant/*` ile mock çalışır.

## Tenant = Okul

Her okul bir **tenant**'tır. Tek kod tabanı, izole veri. Platform yüzlerce
okulu merkezi olarak yönetir.

## Alan Adı Yapısı

```
ingilizkultur.ikkoneedu.com  -> slug: ingilizkultur
atael.ikkoneedu.com          -> slug: atael
demookul.ikkoneedu.com       -> slug: demookul
```

Çözümleme: `lib/tenant/tenant-resolver.ts` (host → slug). İleride
`middleware.ts` içinde `tenantId` header/cookie olarak isteklere eklenir.

## İzolasyon

- Tüm veriler `tenants/{tenantId}/...` alt koleksiyonlarında.
- Security Rules: `request.auth.token.tenantId == tenantId`.
- `SUPER_ADMIN` global (`platform/*`) verilere erişir.

## Abonelik & Paketler

| Paket | Aylık | Kapsam |
|-------|-------|--------|
| Starter | ₺9.900 | Tek kampüs, temel modüller |
| Professional | ₺14.900 | Çoklu sınıf, AI modülleri |
| Enterprise | ₺29.900 | Sınırsız, özel marka, gelişmiş AI |

Plan/lisans `tenants/{tenantId}/subscriptions`; ödeme `payments`. Gelir
paylaşımı modeli: %70 platform geliştiricisi / %30 İngiliz Kültür Kolejleri.

## Branding & Ayarlar

- `tenants/{tenantId}.branding` — logo, renk.
- `tenants/{tenantId}/settings/{section}` — platform | security | ai.

## Yol Haritası

1. Subdomain middleware çözümlemesi.
2. Tenant bazlı branding/ayar yükleme.
3. Abonelik/ödeme (Stripe Billing / iyzico) + webhook.
4. Tenant bazlı AI kotası ve kullanım faturalama.
