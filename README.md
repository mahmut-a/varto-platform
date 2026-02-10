# 🏔️ Varto Platform

**Varto.com** — Türkiye'nin Muş ili Varto ilçesi için geliştirilmekte olan kapsamlı "süper uygulama" platformu.

## 📦 Monorepo Yapısı

```
varto-platform/
├── apps/
│   ├── backend/           # Medusa.js v2 Backend
│   ├── admin-web/         # Admin Web Arayüzü
│   ├── storefront-web/    # Müşteri Web
│   ├── vendor-web/        # Satıcı Web
│   └── courier-web/       # Kurye Web
├── packages/
│   └── shared/            # Paylaşılan tipler & utils
├── mobile/
│   ├── customer-app/      # Müşteri Mobil (Expo)
│   ├── vendor-app/        # Satıcı Mobil (Expo)
│   ├── courier-app/       # Kurye Mobil (Expo)
│   └── admin-app/         # Admin Mobil (Expo)
└── package.json           # Workspace Root
```

## 🚀 Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Backend'i çalıştır
npm run backend:dev
```

## 🛠️ Teknoloji Stack

- **Backend:** Medusa.js v2 (Node.js/TypeScript)
- **Database:** PostgreSQL
- **Cache:** Redis
- **Mobile:** Expo (React Native)
- **Web:** React

## 📄 Lisans

MIT
