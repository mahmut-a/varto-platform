---
description: Varto Platform - Critical project notes and common pitfalls
---
# Varto Platform - Proje Kritik Noktaları

Bu dosya projenin kritik noktalarını, sık karşılaşılan sorunları ve çözümlerini içerir.
Her yeni sohbette bu dosya referans alınmalıdır.

## 🏗️ Proje Yapısı

```
c:\App\
├── apps/
│   └── backend/          # Medusa v2 backend (2.13.1)
│       ├── src/
│       │   ├── api/      # Custom API routes (store/ & admin/)
│       │   └── modules/  # Custom modules (vendor, courier, customer, etc.)
│       ├── medusa-config.ts
│       ├── ecosystem.config.js  # PM2 config for VPS
│       └── .medusa/server/      # Build output (standalone app)
├── mobile/
│   ├── customer-app/     # Expo/React Native customer app
│   └── courier-app/      # Expo/React Native courier app
└── .agent/workflows/     # Deploy & build workflows
```

## 🔑 Kritik Bilgiler

### VPS
- **IP**: 173.212.246.83
- **User**: root
- **Şifre**: VartoAdmin4949
- **Backend Path**: /var/www/varto-platform
- **Domain**: api.vartoyazilim.com (HTTPS, Caddy reverse proxy)
- **PM2 Process**: `varto-backend`
- **Log Files**: /var/log/varto/out.log, /var/log/varto/error.log

### API Keys
- **Publishable API Key**: `pk_3e6b05a597fd3200651f1fc61bf7551c1b7070556a6d238be6ae8fef5fdf5c1d`
- Store routes require `x-publishable-api-key` header

### Database
- **VPS DB**: postgres://varto:VartoDb2026!@localhost:5432/varto_medusa
- **Local DB**: postgres://postgres:login@localhost:5432/vartomedusa

## ⚠️ Sık Karşılaşılan Sorunlar ve Çözümleri

### 1. MedusaService Auto-Generated Methods TypeScript Hatası
**Sorun**: `Property 'updateCustomers' does not exist on type 'CustomerModuleService'`
**Neden**: MedusaService dinamik olarak CRUD metotları üretir ama TypeScript bunları tanımıyamaz:
- `createCustomers`, `updateCustomers`, `retrieveCustomer`, `listCustomers`, `deleteCustomers`
- Format: `{operation}{ModelName}` (plural, sadece retrieve tekil)
**Çözüm**: Route dosyalarında `(service as any).updateCustomers(...)` kullanılır
**Referans**: https://docs.medusajs.com/resources/service-factory-reference

### 2. Backend ts-node Hatası (VPS)
**Sorun**: `Cannot find module 'ts-node'` → PM2 process errored
**Neden**: `medusa build` ve `medusa db:migrate` komutları `ts-node` gerektirir (config dosyası .ts)
**Çözüm**: `pnpm install --no-frozen-lockfile` ile ts-node'u yükle, sonra rebuild
**Önemli**: Build ve migrate MUTLAKA `NODE_ENV=development` ile çalıştırılmalı

### 3. Local IDE "Cannot find module" Hataları
**Sorun**: `Cannot find module '@medusajs/framework/http'` vb.
**Neden**: Backend node_modules local'de değil, sadece VPS'te yüklü (monorepo yapısı)
**Etki**: Sadece IDE uyarısı, build ve deploy etkilenmez
**Çözüm**: Görmezden gel veya local'de `pnpm install` çalıştır

### 4. PowerShell SSH Sorunları
**Sorun**: SSH üzerinden complex komutlar (&&, nested quotes, pipe) PowerShell'de bozuluyor
**Çözüm**: Complex debug komutları için bir .js dosyası oluştur, SCP ile VPS'e at, `node` ile çalıştır
```powershell
scp -o StrictHostKeyChecking=no dosya.js root@173.212.246.83:/tmp/dosya.js
ssh -o StrictHostKeyChecking=no root@173.212.246.83 "node /tmp/dosya.js"
```

### 5. npm install .medusa/server'da Takılıyor
**Sorun**: `.medusa/server/` dizininde `npm install` çok yavaş veya takılıyor
**Neden**: package.json'da `"packageManager": "pnpm"` var, büyük node_modules (718MB+)
**Çözüm**: Genelde node_modules zaten mevcut, rebuild yeterli. Gerekirse `npm install --legacy-peer-deps`

### 6. Store API "unknown_error" 
**Sorun**: Store endpoint'leri `{"code":"unknown_error","type":"unknown_error"}` döner
**Neden**: `x-publishable-api-key` header'ı eksik
**Çözüm**: İsteğe header ekle: `x-publishable-api-key: pk_3e6b05...`

### 7. Customer Auth (OTP)
**Durum**: Gerçek SMS/OTP henüz implemente edilmedi
**Sabit OTP**: `123456` (seed mode)
**Flow**: sendOtp (phone) → verifyOtp (phone, "123456") → JWT token döner

## 📱 Mobil Uygulama Notları

### Customer App
- **API Base**: `https://api.vartoyazilim.com` (USE_LOCAL_BACKEND=false)
- **Auth**: Telefon + OTP (seed: 123456)
- **Design**: shadcn kullan (Medusa UI değil)

### Courier App  
- **API Base**: `https://api.vartoyazilim.com`
- **Auth**: Email + Password (Medusa admin auth: `/auth/user/emailpass`)
- **Design**: shadcn kullan (Medusa UI değil)

### Design Kuralları (memory'den)
- **Mobil**: shadcn kullan (Medusa UI Kit mobilde kullanılmaz)
- **Web/Admin**: Medusa UI Kit kullan

## 🔄 Deploy Checklist
1. `git push origin main`
2. VPS'te `git pull`
3. `pnpm install --no-frozen-lockfile`
4. `NODE_ENV=development npx medusa db:migrate`
5. `NODE_ENV=development npx medusa build`
6. `.env` dosyalarını `.medusa/server/` dizinine kopyala
7. `pm2 delete varto-backend && pm2 start ecosystem.config.js && pm2 save`
8. `curl http://localhost:9000/health` → "OK" beklenir

## 📦 Medusa v2 Modüller
| Modül | Key | Tablo |
|-------|-----|-------|
| vendor | vendorModule | varto_vendor |
| courier | courierModule | varto_courier |
| customer | customerModule | varto_customer |
| listing | listingModule | varto_listing |
| appointment | appointmentModule | varto_appointment |
| order-extension | orderExtensionModule | varto_order / varto_order_item |
| varto-notification | vartoNotificationModule | varto_notification |
| vendor-product | vendorProductModule | varto_vendor_product |
