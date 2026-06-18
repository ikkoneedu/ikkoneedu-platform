# Tenant (Çoklu Okul) Modeli

Her okul bir **tenant**'tır. Platform, tek bir kod tabanından birden fazla okulu
izole biçimde yönetir.

## Alan Adı Yapısı

```
ingilizkultur.ikkoneedu.com  -> slug: ingilizkultur
atael.ikkoneedu.com          -> slug: atael
demookul.ikkoneedu.com       -> slug: demookul
```

## Çözümleme (Resolution)

`lib/tenant/tenant-resolver.ts` host adından tenant slug'ını çıkarır. İleride
Next.js `middleware.ts` içinde çalışıp `tenantId`'yi header/cookie olarak
isteklere ekleyecektir.

```
resolveTenantFromHost("atael.ikkoneedu.com") // { slug: "atael", source: "subdomain" }
```

## Bağlam (Context)

`lib/tenant/tenant-context.ts` aktif tenant'ı sağlar. Şimdilik varsayılan
tenant (`ingilizkultur`) döner; ileride oturumdan/host'tan çözülecektir.

## Veri İzolasyonu

Firestore'da her okul kendi alt koleksiyonunda tutulur:

```
tenants/{tenantId}/students/...
tenants/{tenantId}/announcements/...
```

Security Rules ile `request.auth.token.tenantId == tenantId` zorunlu kılınır;
böylece bir okul başka bir okulun verisine erişemez.
