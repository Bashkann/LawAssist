# Ünal Şener'in Mobil Frontend Görevleri

**Mobile Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

---

## Sorumlu Olduğu Dosyalar

| Klasör | Dosya |
|---|---|
| `src/api/` | `adminApi.js` |
| `src/navigation/` | `AdminStack.js`, `AppNavigator.js` |
| `src/screens/admin/` | `AdminLoginScreen.js`, `AdminDashboardScreen.js`, `AdminLawyersScreen.js`, `AdminLawyerDetailScreen.js`, `AdminListingsScreen.js` |

---

## 1. Uygulama Kök Navigasyonu (AppNavigator)

- **Dosya:** `src/navigation/AppNavigator.js`
- **Görev:** Uygulamanın en üst seviye navigasyon kontrolü — kullanıcı durumuna göre doğru ekran grubuna yönlendirme

### Navigasyon Akışı
| Koşul | Gösterilen Ekran Grubu |
|---|---|
| `user` var (avukat giriş yapmış) | `LawyerTabs` (alt tab bar ile ana uygulama) |
| `adminToken` var (admin giriş yapmış) | `AdminStack` (admin panel ekranları) |
| Hiçbiri yok | `AuthStack` (login, register ekranları) |

### Teknik Detaylar
- `NavigationContainer` ile React Navigation kök sarmalayıcısı
- `createNativeStackNavigator` ile üst seviye stack (headerShown: false)
- `AuthContext`'ten `user` ve `loading` state'i alınır
- `SecureStore.getItemAsync('adminToken')` ile admin token kontrolü
- Admin token'ı 1 saniye aralıklarla kontrol edilir (`setInterval`) — admin login/logout sonrası anlık geçiş sağlanır
- `loading` veya `checkingAdmin` durumunda `LoadingSpinner` gösterilir ("Uygulama yükleniyor...")
- Koşullu render ile navigasyon ağacı dinamik olarak değişir (React Navigation önerilen pattern)

---

## 2. Admin Navigasyon Yapısı (AdminStack)

- **Dosya:** `src/navigation/AdminStack.js`
- **Görev:** Admin panel ekranları arası navigasyon

### Yapı
- `createNativeStackNavigator` ile stack navigator
- Header stili: Koyu mavi arka plan (`#1e40af`), beyaz metin, bold başlık

### Ekranlar
| Ekran Adı | Bileşen | Header Başlığı |
|---|---|---|
| `AdminDashboard` | `AdminDashboardScreen` | Admin Panel |
| `AdminLawyers` | `AdminLawyersScreen` | Avukat Yönetimi |
| `AdminLawyerDetail` | `AdminLawyerDetailScreen` | Avukat Detay |
| `AdminListings` | `AdminListingsScreen` | İlan Yönetimi |

---

## 3. Admin Giriş Ekranı

- **API Endpoint:** `POST /api/admin/login`
- **Dosya:** `src/screens/admin/AdminLoginScreen.js`
- **Görev:** Sistem yöneticisinin admin paneline giriş yapması

### UI Bileşenleri
- Shield ikonu (40x40, mavi arka plan kutu içinde) ve "LawAssist" logosu
- "Admin Paneli" badge'i (mavi arka plan, mavi nokta ikonu ile)
- "Yönetici Girişi" başlığı (24px, bold)
- Email input alanı (`keyboardType: 'email-address'`, `autoCapitalize: 'none'`)
- Şifre input alanı (`secureTextEntry`)
- "Giriş Yap" butonu (tam genişlik, primary mavi)
- Ayırıcı çizgi
- "Avukat Girişi" butonu (outline stil, person ikonu) — `LoginScreen`'e yönlendirir
- `ErrorMessage` bileşeni

### Kullanıcı Deneyimi
- Input değiştiğinde hata mesajı otomatik temizlenir
- Loading durumunda buton metni "Giriş Yapılıyor..." olarak değişir
- Başarılı giriş sonrası token `SecureStore`'a kaydedilir (`adminToken` anahtarı)
- `AppNavigator`'daki periyodik kontrol mekanizması sayesinde token set edildikten sonra otomatik olarak `AdminStack`'e geçilir (ekstra navigasyon çağrısı gerekmez)

### Teknik Detaylar
- **API Çağrısı:** `adminApi.login(form)` → `POST /api/admin/login`
- **Token Saklama:** `SecureStore.setItemAsync('adminToken', token)` ve `SecureStore.setItemAsync('admin', JSON.stringify(admin))`
- **State Management:** `form` (`email`, `password`), `loading`, `error` state'leri

---

## 4. Admin Dashboard Ekranı

- **API Endpoint'leri:**
  - `GET /api/admin/lawyers?limit=1` (toplam avukat sayısı)
  - `GET /api/admin/lawyers?status=active&limit=1` (aktif avukat sayısı)
  - `GET /api/admin/lawyers?status=suspended&limit=1` (askıdaki avukat sayısı)
  - `GET /api/admin/listings?limit=1` (toplam ilan sayısı)
- **Dosya:** `src/screens/admin/AdminDashboardScreen.js`
- **Görev:** Sistem genel durumunun özet gösterimi ve yönetim menüsü

### UI Bileşenleri
- Üst bar: "Dashboard" başlığı, "Sistem genel durumu" alt başlığı, Çıkış ikonu (sağ üst)
- İstatistik kartları (2x2 grid, `flexWrap: 'wrap'`):
  - Toplam Avukat (people ikonu, gri arka plan, koyu metin)
  - Aktif (checkmark-circle ikonu, yeşil arka plan, yeşil sayı)
  - Askıda (warning ikonu, amber arka plan, amber sayı)
  - Toplam İlan (document-text ikonu, mavi arka plan, mavi sayı)
  - Her kartta: İkon (24px), Label (11px, gri), Sayı değeri (24px, bold)
- Menü kartları:
  - "Avukat Yönetimi" (başlık + açıklama + chevron-forward ikonu) → `AdminLawyers` ekranına
  - "İlan Yönetimi" (başlık + açıklama + chevron-forward ikonu) → `AdminListings` ekranına

### Kullanıcı Deneyimi
- Sayfa açıldığında 4 paralel API isteği ile istatistikler yüklenir (`Promise.all`)
- `LoadingSpinner` ile yükleme durumu
- Çıkış butonu tıklandığında `Alert.alert()` ile onay dialogu
- Çıkış onaylanınca `adminToken` ve `admin` `SecureStore`'dan silinir
- `AppNavigator` otomatik olarak `AuthStack`'e döner

### Teknik Detaylar
- **İstatistik Toplama:** `pagination.total` alanı kullanılır (gerçek veri çekilmez, yalnızca sayım alınır)
- **State Management:** `stats` objesi (`lawyers`, `active`, `suspended`, `listings`), `loading` state
- **Paralel İstekler:** `Promise.all([...])` ile 4 istek eş zamanlı gönderilir

---

## 5. Avukat Yönetimi Listeleme Ekranı

- **API Endpoint:** `GET /api/admin/lawyers?status={status}&page={page}&limit=20`
- **Dosya:** `src/screens/admin/AdminLawyersScreen.js`
- **Görev:** Sistemdeki tüm avukatların listelenmesi ve filtrelenmesi

### UI Bileşenleri
- Filtre butonları: Tümü / Aktif / Askıda / Silinmiş (seçili olan mavi arka plan)
- `FlatList` ile avukat listesi:
  - Her kartta:
    - Yuvarlak avatar (36x36, mavi arka plan, beyaz initials)
    - Ad Soyad (14px, bold) ve Email (12px, gri)
    - Durum badge'i (Aktif/Askıda/Silinmiş, renkli)
    - Alt bilgi: Baro adı ve kayıt tarihi
  - Karta tıklama → `AdminLawyerDetail` ekranına yönlendirme
- Sayfalama kontrolü (liste altında):
  - "Önceki" ve "Sonraki" butonları
  - Sayfa bilgisi: "{current} / {totalPages}"
  - İlk/son sayfada ilgili buton disabled
- Boş durum: "Avukat bulunamadı." mesajı

### Kullanıcı Deneyimi
- Filtre değiştirildiğinde sayfa 1'e sıfırlanır
- 20'şer avukat sayfalama ile gösterilir
- Karta tıklayarak avukat detayına geçiş

### Teknik Detaylar
- **API Çağrısı:** `adminApi.getLawyers({ status: filter, page, limit: 20 })`
- **State Management:** `lawyers`, `loading`, `filter`, `page`, `pagination` state'leri
- **Sayfalama:** Backend'den gelen `pagination.totalPages` ile kontrol

---

## 6. Avukat Detay ve Yönetim Ekranı

- **API Endpoint'leri:**
  - `GET /api/admin/lawyers/{id}` (avukat bilgileri + ilanları + başvuruları)
  - `PUT /api/admin/lawyers/{id}` (bilgi güncelleme)
  - `DELETE /api/admin/lawyers/{id}` (hesap silme)
  - `PATCH /api/admin/lawyers/{id}/suspend` (askıya alma)
- **Dosya:** `src/screens/admin/AdminLawyerDetailScreen.js`
- **Görev:** Belirli bir avukatın detaylı bilgilerini görme ve yönetim işlemleri

### UI Bileşenleri

#### Profil Kartı
- Mavi gradient üst bar (40px)
- Profil avatar (52x52, koyu mavi, beyaz border, gradient üzerine konumlandırılmış)
- Ad Soyad (16px, bold) + durum badge'i (yan yana)
- Email (12px, gri)
- Bilgi grid'i (2 sütun, `flexWrap: 'wrap'`): Telefon, Baro, Sicil No, Kayıt Tarihi

#### Yönetim İşlemleri Kartı (yalnızca silinmemiş avukatlar için)
- "Yönetim İşlemleri" başlığı
- Askıya alma satırı:
  - Tarih seçici butonu (calendar ikonu, `DateTimePicker` ile native tarih seçimi)
  - "Askıya Al" butonu (amber renk, outline)
  - iOS'ta spinner modu, Android'de takvim popup
  - iOS'ta "Tamam" butonu ile tarih onaylama
- Aksiyon butonları satırı:
  - "Düzenle" butonu (mavi outline) → `EditModal` açar
  - "Hesabı Sil" butonu (kırmızı outline) → Silme onay dialogu

#### İlanları Bölümü (varsa)
- "İlanları ({sayı})" başlığı
- Her ilan: Başlık (tek satır), Şehir — Tarih, durum badge'i

#### Başvuruları Bölümü (varsa)
- "Başvuruları ({sayı})" başlığı
- Her başvuru: İlan adı (tek satır), Şehir — Tarih, durum badge'i

#### Düzenleme Modalı
- Ortada açılan modal (`justifyContent: 'center'`)
- "Avukat Bilgilerini Düzenle" başlığı
- Ad, Soyad (yan yana), Email, Telefon input alanları
- "Kaydet" ve "İptal" butonları
- `ErrorMessage` bileşeni

### Kullanıcı Deneyimi
- Askıya alma için native tarih seçici (elle yazma yerine) — minimum tarih bugün
- Tarih seçilmeden "Askıya Al" butonuna basılırsa `Alert.alert()` ile uyarı
- Hesap silme işleminde çift onay: `Alert.alert()` ile "Bu avukatın hesabını silmek istediğinize emin misiniz?"
- Düzenleme modalı açıldığında mevcut veriler `useEffect` ile form'a doldurulur
- Tüm aksiyonlar sonrası `fetchLawyer()` tekrar çağrılarak ekran güncellenir
- `actionLoading` state ile butonlarda "..." gösterimi

### Teknik Detaylar
- **API Çağrıları:**
  - `adminApi.getLawyerById(id)` → Avukat bilgilerini getir
  - `adminApi.updateLawyer(id, editForm)` → Bilgileri güncelle
  - `adminApi.deleteLawyer(id)` → Hesabı sil (soft delete)
  - `adminApi.suspendLawyer(id, { suspendUntil: suspendDate })` → Askıya al
- **State Management:** `lawyer`, `loading`, `error`, `suspendDate`, `showSuspendDatePicker`, `selectedSuspendDate`, `actionLoading`, `editOpen`, `editForm`, `editLoading`, `editError`
- **Tarih Formatı:** `DateTimePicker` çıktısı `YYYY-MM-DD` formatına dönüştürülerek API'ye gönderilir

---

## 7. İlan Yönetimi Ekranı

- **API Endpoint:** `GET /api/admin/listings?status={status}&page={page}&limit=20`
- **Dosya:** `src/screens/admin/AdminListingsScreen.js`
- **Görev:** Sistemdeki tüm tevkil ilanlarının denetim amaçlı listelenmesi

### UI Bileşenleri
- Filtre butonları: Tümü / Aktif / Pasif / İptal (seçili olan mavi arka plan)
- `FlatList` ile ilan listesi:
  - Her kartta:
    - Başlık (14px, bold, tek satır) + durum badge'i
    - Meta bilgiler: Şehir (location ikonu), Adliye, Duruşma tarihi
    - İlan sahibi bilgisi: "İlan sahibi: Ad Soyad"
    - Açıklama (varsa, 2 satır)
    - "Avukat Detay" linki (mavi, chevron-forward ikonu) → `AdminLawyerDetail` ekranına yönlendirir
- Sayfalama kontrolü: "Önceki" / "{page} / {totalPages}" / "Sonraki"
- Boş durum: "İlan bulunamadı." mesajı

### Kullanıcı Deneyimi
- Filtre değiştirildiğinde sayfa 1'e sıfırlanır
- 20'şer ilan sayfalama ile gösterilir
- "Avukat Detay" linkine tıklayarak ilan sahibinin `AdminLawyerDetail` ekranına geçiş

### Teknik Detaylar
- **API Çağrısı:** `adminApi.getListings({ status: filter, page, limit: 20 })`
- **Parametre Geçişi:** `navigation.navigate('AdminLawyerDetail', { id: item.owner_id })` ile avukat ID'si aktarılır
- **State Management:** `listings`, `loading`, `filter`, `page`, `pagination` state'leri

---

## 8. API Servis Modülü

### adminApi.js
- **Dosya:** `src/api/adminApi.js`
- **Fonksiyonlar:**

| Fonksiyon | HTTP Metodu | Endpoint | Açıklama |
|---|---|---|---|
| `login(data)` | `POST` | `/admin/login` | Admin girişi |
| `getLawyers(params)` | `GET` | `/admin/lawyers` | Avukat listesi (filtre + sayfalama) |
| `getLawyerById(id)` | `GET` | `/admin/lawyers/{id}` | Avukat detay (ilanları + başvuruları dahil) |
| `updateLawyer(id, data)` | `PUT` | `/admin/lawyers/{id}` | Avukat bilgilerini güncelle |
| `deleteLawyer(id)` | `DELETE` | `/admin/lawyers/{id}` | Avukat hesabını sil (soft delete) |
| `suspendLawyer(id, data)` | `PATCH` | `/admin/lawyers/{id}/suspend` | Avukat hesabını askıya al |
| `getListings(params)` | `GET` | `/admin/listings` | İlan listesi (filtre + sayfalama) |