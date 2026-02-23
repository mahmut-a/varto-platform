---
description: Build local Android APK from any Expo project
---

# Expo Local Android APK Build Workflow

## Ön Koşullar (Bir Kere Yapılır)

### 1. Android Studio Kurulumu
- Android Studio yüklü olmalı
- Android SDK, NDK, Build Tools kurulu olmalı
- SDK lokasyonu: `C:\Users\Evren\AppData\Local\Android\Sdk`

### 2. JAVA_HOME
- Android Studio'nun JBR'ı kullanılır: `C:\Program Files\Android\Android Studio\jbr`
- Bu her build komutunda set edilmeli (veya sistem env variable olarak ayarlanmalı)

### 3. Windows Long Path
- Admin PowerShell'de çalıştır:
```powershell
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1
```
- Bu bir kere yapılır, kalıcıdır

### 4. Proje Lokasyonu
- Proje `C:\App` altında olmalı (kısa path, 260 karakter limiti sorununu önler)
- Mobile uygulamalar: `C:\App\mobile\<app-name>`
- `newArchEnabled=true` tüm projelerde aktif

---

## APK Build Adımları

### Adım 1: Android klasörünü oluştur (yoksa)
```bash
npx expo prebuild --platform android
```
- Eğer android klasörü varsa ve temiz oluşturmak istiyorsan: `npx expo prebuild --clean --platform android`

### Adım 2: local.properties oluştur
// turbo
```
android/local.properties dosyasına yaz:
sdk.dir=C:\\Users\\Evren\\AppData\\Local\\Android\\Sdk
```

### Adım 3: buildFeatures ekle (gerekirse)
`android/app/build.gradle` dosyasındaki `android { }` bloğunun içine ekle:
```groovy
buildFeatures {
    buildConfig = true
}
```

### Adım 4: Package adlarını kontrol et
- `android/app/build.gradle` içindeki `namespace` değeri ile
- `android/app/src/main/java/.../MainActivity.kt` ve `MainApplication.kt` içindeki `package` satırı **aynı** olmalı

### Adım 5: Release APK Build
// turbo
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"; $env:ANDROID_HOME = "C:\Users\Evren\AppData\Local\Android\Sdk"; Set-Location "C:\App\mobile\<APP_NAME>\android"; .\gradlew.bat app:assembleRelease
```

### Adım 6: APK dosyasını bul
APK şurada oluşur:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## İlk Build vs Sonraki Build'ler

| | İlk Build | Sonraki Build'ler |
|---|---|---|
| Gradle indirme | ~15-30 dk (internet hızına göre) | 0 (cache'li) |
| Dependency indirme | ~10-20 dk | 0 (cache'li) |
| Kotlin/Java derleme | ~5-10 dk | ~2-5 dk (incremental) |
| JS bundle | ~1-2 dk | ~1-2 dk |
| **Toplam** | **30-60 dk** | **3-10 dk** |

---

## Sorun Giderme

### "Filename longer than 260 characters"
- Proje zaten `C:\App` altında olduğundan bu sorun oluşmamalı
- Long Path Registry ayarının yapıldığından emin ol

### "Unresolved reference 'R'" veya "'BuildConfig'"
- `buildFeatures { buildConfig = true }` ekle
- Package adlarını kontrol et (namespace ile eşleşmeli)

### Gradle Daemon sorunları
```powershell
.\gradlew.bat --stop
```

### Temiz build
```powershell
.\gradlew.bat clean
.\gradlew.bat app:assembleRelease
```
