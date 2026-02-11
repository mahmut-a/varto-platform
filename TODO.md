# Varto Platform — Proje Durumu & Yapılacaklar

## 📊 Mevcut Durum Özeti

### ✅ Tamamlanan Bileşenler
| Bileşen | Durum | Notlar |
|---------|-------|--------|
| **Backend — Medusa v2** | ✅ Çalışıyor | Lokal + VPS (173.212.246.83:9000) |
| **Custom Modüller** | ✅ 7 modül | vendor, courier, listing, appointment, order-extension, varto-notification, customer |
| **Admin Web Panel** | ✅ Temel | routes: vendors, couriers, listings, appointments, orders, admin-users |
| **Store API** | ✅ Temel | vendors, listings, orders, appointments, customer-auth |
| **Admin API** | ✅ Temel | CRUD endpoints tüm modüller için |
| **Customer App** | ✅ Temel | Auth (OTP), Home, VendorDetail, Cart, Orders, Listings, Profile |
| **Admin App** | ✅ Temel | Login, Dashboard, Vendors, Couriers, Listings, Orders, Appointments |
| **VPS Deployment** | ✅ | PM2, PostgreSQL, Redis, Firewall |
| **EAS Build** | ✅ | Customer App için eas.json hazır |

### ⚠️ Eksik / Boş Bileşenler
| Bileşen | Durum | 
|---------|-------|
| **Vendor App** | ❌ Boş klasör — hiç kod yok |
| **Courier App** | ❌ Boş klasör — hiç kod yok |
| **Workflows** | ❌ Sadece README — sipariş akışı yok |
| **Subscribers** | ❌ Sadece README — event dinleyici yok |
| **Links** | ❌ Sadece README — modüller arası bağlantı yok |
| **Jobs** | ❌ Sadece README — zamanlanmış iş yok |

---

## 🔴 Öncelik 1: Kritik Eksikler

### 1.1 · VPS Deploy Script Güncelleme
- [ ] `deploy.sh` → `admin.disable: true` ekle (medusa-config.ts VPS'te farklı)
- [ ] `ecosystem.config.js` kaldır, `pm2 start "npx medusa start"` kullan
- [ ] `.env` şifrelerini güçlendir (JWT_SECRET, COOKIE_SECRET)
- [ ] Nginx reverse proxy kur (port 9000 yerine 80/443 üzerinden eriş)
- [ ] SSL sertifikası (Let's Encrypt + domain adı)

### 1.2 · Vendor App (İşletme Uygulaması)
Bu uygulama olmadan işletmeler sipariş alamaz:
- [ ] Proje iskeletini oluştur (Expo + React Native)
- [ ] Vendor Login (email/şifre veya telefon)
- [ ] Dashboard — bugünkü siparişler, gelir
- [ ] Sipariş listesi — pending → confirmed → preparing → ready
- [ ] Sipariş detayı — ürünler, müşteri bilgisi, adres
- [ ] Sipariş durumu güncelleme (onayla/hazırla/hazır)
- [ ] Menü/ürün yönetimi (listing CRUD)
- [ ] Çalışma saatleri güncelleme
- [ ] Push notification alımı
- [ ] EAS build config

### 1.3 · Courier App (Kurye Uygulaması)
Bu uygulama olmadan teslimat yapılamaz:
- [ ] Proje iskeletini oluştur (Expo + React Native)
- [ ] Courier Login
- [ ] Aktif teslimatlar — assigned/accepted/delivering
- [ ] Teslimat detayı — adres, müşteri tel, vendor bilgisi
- [ ] Teslimat durumu güncelleme (kabul et/teslimatta/teslim edildi)
- [ ] Müsaitlik toggle (is_available)
- [ ] Harita entegrasyonu (Google Maps)
- [ ] Push notification alımı
- [ ] EAS build config

---

## 🟡 Öncelik 2: Backend İyileştirmeler

### 2.1 · Sipariş Akışı (Workflows)
- [ ] `create-varto-order` workflow: sipariş oluştur → vendor'a bildirim → courier ata
- [ ] `update-order-status` workflow: durum değişikliğinde ilgili taraflara bildirim
- [ ] `assign-courier` workflow: uygun kurye bul ve ata
- [ ] `cancel-order` workflow: iptal → stok geri al → müşteriye bildirim

### 2.2 · Event Subscribers
- [ ] `order.created` → vendor'a bildirim gönder
- [ ] `order.status_changed` → müşteriye bildirim gönder
- [ ] `order.assigned` → kurye'ye bildirim gönder
- [ ] `appointment.created` → vendor'a bildirim gönder
- [ ] `listing.approved` → müşteriye bildirim gönder

### 2.3 · Links (Modüller Arası Bağlantı)
- [ ] VartoOrder ↔ Vendor bağlantısı
- [ ] VartoOrder ↔ Customer bağlantısı
- [ ] VartoOrder ↔ Courier bağlantısı
- [ ] Appointment ↔ Vendor bağlantısı
- [ ] Listing ↔ Customer bağlantısı

### 2.4 · Push Notification Altyapısı
- [ ] Expo Push Notification servisi entegrasyonu
- [ ] Device token kayıt endpoint'i (`/store/notifications/register-device`)
- [ ] Bildirim gönderme utility fonksiyonu
- [ ] Vendor/Courier/Customer ayrı token yönetimi

### 2.5 · Vendor Ürün/Menü Sistemi
Şu an vendor'ların ürün/menü listesi yok:
- [ ] `VendorProduct` (veya `MenuItem`) modülü oluştur
- [ ] Store API: vendor'ın menüsünü listele
- [ ] Admin API: menü CRUD
- [ ] Customer App: vendor menüsünden ürün seç → sepete ekle

---

## 🟢 Öncelik 3: Customer App İyileştirmeler

### 3.1 · Eksik Özellikler
- [ ] Vendor menü/ürün listesi ekranı (VendorDetail'de)
- [ ] Sepetten sipariş oluşturma akışını tamamla (adres, ödeme yöntemi seçimi)
- [ ] Gerçek zamanlı sipariş takibi (polling veya WebSocket)
- [ ] Pull-to-refresh tüm listelerde
- [ ] Favorilere işletme ekleme (AsyncStorage)
- [ ] Arama geçmişi

### 3.2 · UX İyileştirmeler
- [ ] Splash screen tasarımı ve app icon
- [ ] Boş state'ler için güzel görseller
- [ ] Skeleton loading (shimmer effect)
- [ ] Error boundary ve hata mesajları Türkçe
- [ ] Offline mod desteği
- [ ] Haptic feedback

### 3.3 · Randevu Sistemi
- [ ] Randevu oluşturma ekranı (tarih/saat seçici, hizmet seçimi)
- [ ] Randevularım listesi
- [ ] Randevu iptal etme

---

## 🔵 Öncelik 4: Admin App & Web Panel

### 4.1 · Admin App
- [ ] Dashboard'a gerçek istatistikler (günlük sipariş, gelir, aktif kurye)
- [ ] Sipariş detay ekranı
- [ ] Kurye atama fonksiyonu
- [ ] Bildirim gönderme (tüm kullanıcılara veya belirli gruplara)
- [ ] Raporlama (günlük/haftalık/aylık satış)

### 4.2 · Admin Web Panel (Medusa Dashboard)
- [ ] Özel widget'lar geliştir (varto-stats widget mevcut, genişlet)
- [ ] İşletme onay/red workflow'u
- [ ] İlan onay/red workflow'u
- [ ] Sistem ayarları sayfası

---

## 🟣 Öncelik 5: Altyapı & DevOps

### 5.1 · Production Hazırlığı
- [ ] Domain adı al ve DNS ayarla (api.varto.app)
- [ ] Nginx kurulumu + SSL (HTTPS)
- [ ] Redis şifresi ayarla
- [ ] PostgreSQL backup cron job'u
- [ ] PM2 log rotation
- [ ] Rate limiting middleware
- [ ] CORS ayarlarını daralt (wildcard * yerine spesifik domain'ler)

### 5.2 · Güvenlik
- [ ] OTP doğrulama → gerçek SMS servisi entegre et (Netgsm, İleti Merkezi, vs.)
- [ ] JWT token süresini ayarla (refresh token mekanizması)
- [ ] API rate limiting
- [ ] Input validation (zod/yup schema'ları)
- [ ] SQL injection koruması (parameterized queries — Medusa bunu yapıyor)

### 5.3 · CI/CD
- [ ] GitHub Actions: push → test → build → deploy
- [ ] EAS auto-build on push (preview channel)
- [ ] Staging ortamı

---

## 📋 Hızlı Başlangıç Sıralaması

Projeyi kullanılabilir hale getirmek için önerilen sıralama:

1. **Vendor ürün/menü sistemi** — müşteriler bir şey sipariş edebilsin
2. **Vendor App** — işletmeler sipariş yönetebilsin
3. **Sipariş akışı (workflows + subscribers)** — otomatik bildirim/durum
4. **Push notification** — gerçek zamanlı bildirim
5. **Courier App** — teslimat sistemi
6. **SMS OTP** — gerçek telefon doğrulaması
7. **Domain + SSL** — production URL
8. **CI/CD** — otomatik deployment

---

*Son güncelleme: 11 Şubat 2026*
