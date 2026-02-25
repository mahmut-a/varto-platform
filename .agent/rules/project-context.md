---
description: Critical project context to load at start of every conversation
---

# 🔴 Her Yeni Sohbetin Başında Bu Dosyayı Oku

Bu proje hakkında kritik bilgiler `.agent/project-notes.md` dosyasında bulunur.
Her yeni sohbette bu dosyayı oku ve referans al.

## Hızlı Referanslar
- **Proje Notları**: `.agent/project-notes.md` — Proje yapısı, API keys, sık sorunlar, çözümleri
- **Deploy Workflow**: `.agent/workflows/deploy.md` — VPS deploy adımları ve troubleshooting
- **APK Build**: `.agent/workflows/build-apk.md` — Android APK build adımları
- **Design Kuralı**: Mobil = shadcn, Web = Medusa UI Kit

## En Kritik Hatırlanması Gerekenler
1. **pnpm** kullan (npm değil) — root level
2. **NODE_ENV=development** ile build/migrate yap
3. **MedusaService** metotları runtime'da üretilir, TS tanımaz → `as any` cast
4. **.env** dosyalarını `.medusa/server/` altına **2 kere** kopyala (.env + .env.production)
5. **PowerShell SSH** complex komutlarda bozulur → .js dosyası SCP ile at
6. **Store routes** `x-publishable-api-key` header gerektirir
7. **OTP seed mode**: Sabit kod `123456`
