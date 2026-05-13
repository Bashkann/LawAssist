# Ahmet Kaan Başkan'ın Mobil Frontend Görevleri

**Mobile Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

---

## Sorumlu Olduğu Dosyalar

| Klasör | Dosya |
|---|---|
| `src/api/` | `applicationsApi.js`, `listingsApi.js` |
| `src/screens/applications/` | `MyApplicationsScreen.js` |
| `src/screens/listings/` | `ListingsScreen.js`, `ListingDetailScreen.js`, `CreateListingScreen.js`, `MyListingsScreen.js`, `ListingApplicationsScreen.js`, `IncomingApplicationsScreen.js` |

---

## 1. Tevkil İlanları Listeleme ve Filtreleme Ekranı

- **API Endpoint:** `GET /api/listings?city={city}&courthouse={courthouse}&date={date}`
- **Dosya:** `src/screens/listings/ListingsScreen.js`
- **Görev:** Tüm aktif tevkil ilanlarının filtrelenerek listelenmesi

### UI Bileşenleri
- "Tevkil İlanları" başlığı (24px, bold) ve "Filtre kullanarak size uygun ilanları bulun" alt başlığı
- `ListingFilters` bileşeni (filtre kartı):
  - Şehir picker butonu (location ikonu, `PickerModal` ile seçim)
  - Adliye picker butonu (business ikonu, şehir seçimine bağımlı)
  - Tarih seçici butonu (calendar ikonu, `DateTimePicker` ile seçim)
  - "Ara" butonu (mavi, search ikonu)
  - "Temizle" butonu (outline stil, filtre aktifse görünür)
- `FlatList` ile ilan listesi (`ListingCard` bileşenleri)
- Boş durum kartı:
  - Arama yapılmamışsa: "Arama Yapın" mesajı
  - Sonuç yoksa: "İlan Bulunamadı" mesajı

### Kullanıcı Deneyimi
- Sayfa açıldığında otomatik ilan yüklenmez, kullanıcı filtre seçip "Ara" butonuna basmalıdır
- Şehir seçilmeden adliye picker'ı devre dışıdır (`opacity: 0.5`, `disabled`)
- Şehir değiştirildiğinde seçili adliye otomatik temizlenir
- `PickerModal`: Alttan yukarı açılan modal, arama alanı ile filtrelenebilir liste, "Tümü" seçeneği ile filtreyi kaldırma
- `DateTimePicker`: iOS'ta spinner, Android'de takvim popup; iOS'ta "Tamam" butonu ile kapatma
- `LoadingSpinner` ile yükleme durumu gösterimi

### Teknik Detaylar
- **API Çağrısı:** `listingsApi.getAll(params)` → `GET /api/listings?city=&courthouse=&date=`
- **State Management:** `listings`, `loading`, `searched`, `city`, `date`, `courthouse` state'leri
- **Performans:** `FlatList` ile lazy rendering, `keyExtractor` ile benzersiz key ataması
- **Bileşen Yapısı:** `ListingFilters` ve `ListingCard` ortak bileşenler olarak import edilir

---

## 2. İlan Kartı Bileşeni (Başvuru Özellikli)

- **API Endpoint:** `POST /api/listings/{listingId}/applications`
- **Dosya:** `src/components/ListingCard.js` (ortak bileşen)
- **Görev:** İlan bilgilerini gösterme ve başvuru yapma işlevi

### UI Bileşenleri
- İlan başlığı (15px, bold) ve durum badge'i (Aktif/Pasif/İptal, renkli yuvarlak etiket)
- Bilgi satırı: Şehir (location ikonu), Adliye (business ikonu), Duruşma Tarihi (calendar ikonu)
- Açıklama metni (2 satıra sınırlı, `numberOfLines={2}`)
- İlan sahibi bilgisi: Yuvarlak avatar (24x24, initials), Ad Soyad, Baro bilgisi
- "Başvur" butonu (mavi, `TouchableOpacity`)
- Başvuru formu (açılır/kapanır):
  - Not alanı (`TextInput`, multiline, max 500 karakter, opsiyonel)
  - "Başvuruyu Gönder" butonu (yeşil)
  - "Vazgeç" butonu (outline)
  - Hata mesajı (varsa)
- Başvuru yapıldıysa: Yeşil "Başvuruldu" badge'i (checkmark-circle ikonu)

### Kullanıcı Deneyimi
- "Başvur" butonuna tıklanınca aynı kart içinde not formu açılır (sayfa değişmez)
- Başvuru sırasında buton metni "Gönderiliyor..." olarak değişir
- Başarılı başvuru sonrası "Başvuruldu" badge'i gösterilir, form kapanır
- Kendi ilanına başvurma denemesinde backend'den gelen hata mesajı gösterilir

### Teknik Detaylar
- **API Çağrısı:** `listingsApi.apply(listing.id, { note })` → `POST /api/listings/{id}/applications`
- **State Management:** `showApply`, `note`, `applying`, `applied`, `error` state'leri
- **Callback:** `onApplied` prop'u ile üst bileşene başvuru bildirimi

---

## 3. Yeni İlan Oluşturma Ekranı

- **API Endpoint:** `POST /api/listings`
- **Dosya:** `src/screens/listings/CreateListingScreen.js`
- **Görev:** Yeni tevkil ilanı oluşturma formu

### UI Bileşenleri
- Üst bar: Geri ok butonu, "Yeni İlan Oluştur" başlığı
- Başlık input alanı (zorunlu, `*` işaretli)
- Açıklama input alanı (opsiyonel, multiline, 80px minimum yükseklik)
- Şehir picker butonu (zorunlu, `PickerModal` ile 81 il listesi)
- Adliye picker butonu (zorunlu, şehir seçimine bağımlı, `getCourthousesByCity()` ile filtreleme)
- Duruşma Tarihi seçici (zorunlu, `DateTimePicker`, calendar ikonu)
- "İlan Oluştur" butonu (yeşil, tam genişlik)
- `ErrorMessage` bileşeni

### Form Validasyonu
- Başlık, şehir, adliye ve duruşma tarihi zorunlu alan kontrolü
- Şehir seçilmeden adliye seçilemez
- Tarih seçicide minimum tarih bugünün tarihi (`minimumDate={new Date()}`)
- Backend hataları form üstünde gösterilir

### Kullanıcı Deneyimi
- Şehir değiştirildiğinde seçili adliye otomatik sıfırlanır
- Tarih seçici ile tarih `YYYY-MM-DD` formatına otomatik dönüştürülür
- Başarılı oluşturma sonrası `Alert.alert()` ile bildirim ve `navigation.goBack()` ile geri dönüş
- `ScrollView` ile form kaydırma ve `keyboardShouldPersistTaps="handled"` desteği

### Teknik Detaylar
- **API Çağrısı:** `listingsApi.create(form)` → `POST /api/listings`
- **State Management:** `form` (5 alan: `title`, `description`, `city`, `courthouse`, `hearing_date`), `loading`, `error`, `showCityPicker`, `showCourthousePicker`, `showDatePicker`, `selectedDate`
- **Bağımlı Picker:** Adliye listesi `constants.js`'deki `CITY_COURTHOUSES` objesinden `getCourthousesByCity(city)` ile alınır

---

## 4. İlanlarım Ekranı (Düzenleme + Başvuru Yönetimi)

- **API Endpoint'leri:**
  - `GET /api/lawyers/{id}/listings` (ilanları listele)
  - `PUT /api/listings/{id}` (ilan güncelle)
  - `DELETE /api/listings/{id}` (ilan kaldır)
  - `GET /api/listings/{id}/applications` (gelen başvuruları getir)
  - `PATCH /api/applications/{id}/approve` (başvuru onayla)
  - `PATCH /api/applications/{id}/reject` (başvuru reddet)
- **Dosya:** `src/screens/listings/MyListingsScreen.js`
- **Görev:** Avukatın kendi ilanlarını yönetmesi, düzenlemesi ve gelen başvuruları değerlendirmesi

### UI Bileşenleri
- Üst bar:
  - "İlanlarım" başlığı ve "Tevkil ilanlarınızı yönetin" alt başlığı
  - "Gelen Başvurular" butonu (outline, mavi metin, `IncomingApplicationsScreen`'e yönlendirir)
  - "+ Yeni İlan" butonu (mavi, `CreateListingScreen`'e yönlendirir)
- Filtre butonları: Tümü / Aktif / Pasif / İptal (seçili olan mavi arka plan)
- İlan kartları:
  - Başlık + durum badge'i
  - Şehir — Adliye — Tarih bilgisi
  - Açıklama (varsa, 2 satır)
  - Aksiyon butonları:
    - "Düzenle" (mavi, create-outline ikonu) → `EditListingModal` açar
    - "Başvurular" (mavi, people-outline ikonu) → Kart altında inline başvuru listesi açar/kapatır
    - "Kaldır" (kırmızı, trash-outline ikonu, yalnızca aktif ilanlarda) → Silme onay dialogu
- Inline gelen başvurular bölümü (kart altında açılır):
  - "Gelen Başvurular" başlığı
  - Başvuran avatar + Ad Soyad + Baro bilgisi
  - Başvuru notu (varsa, italik)
  - Durum badge'i + tarih bilgisi
  - "Onayla" (yeşil) ve "Reddet" (kırmızı) butonları (yalnızca `pending` durumda)

### EditListingModal (Düzenleme Modalı)
- Alttan açılan modal (`animationType: 'slide'`, `maxHeight: '85%'`)
- "İlanı Düzenle" başlığı ve kapatma butonu
- Başlık, Açıklama, Şehir (picker), Adliye (picker), Duruşma Tarihi (date picker) alanları
- Mevcut ilan verileri `useEffect` ile form'a doldurulur
- "Kaydet" ve "İptal" butonları
- İç içe `PickerModal` bileşenleri (şehir ve adliye seçimi)

### Kullanıcı Deneyimi
- Ekran odaklandığında (`focus` listener) ilan listesi yenilenir
- Filtre değiştirme ile anlık filtreleme (`useCallback` + `useEffect`)
- Silme işleminde `Alert.alert()` ile onay dialogu ("Emin misiniz?")
- Onaylama işleminde uyarı: "İlan kapatılacak."
- Başvurular yalnızca "Başvurular" butonuna basıldığında yüklenir (lazy loading)
- `expandedId` state ile aynı anda yalnızca bir ilanın başvuruları açık olur
- Boş liste durumunda "Henüz bir ilan oluşturmadınız." mesajı

### Teknik Detaylar
- **API Çağrıları:**
  - `lawyersApi.getListings(user.id, filter)` → İlanları getir
  - `listingsApi.update(listing.id, form)` → İlan güncelle
  - `listingsApi.remove(id)` → İlan kaldır
  - `listingsApi.getApplications(listingId)` → Gelen başvuruları getir
  - `applicationsApi.approve(app.id)` → Başvuru onayla
  - `applicationsApi.reject(app.id)` → Başvuru reddet
- **State Management:** `listings`, `loading`, `error`, `filter`, `expandedId`, `applications` (obje, listing ID'ye göre), `editListing`

---

## 5. İlanlarıma Gelen Başvurular Ekranı

- **API Endpoint'leri:**
  - `GET /api/lawyers/{id}/listings` (kendi ilanlarını getir)
  - `GET /api/listings/{id}/applications` (her ilana gelen başvuruları getir)
  - `PATCH /api/applications/{id}/approve` (onayla)
  - `PATCH /api/applications/{id}/reject` (reddet)
- **Dosya:** `src/screens/listings/IncomingApplicationsScreen.js`
- **Görev:** Tüm ilanlarına gelen başvuruları tek bir sayfada topluca görme ve yönetme

### UI Bileşenleri
- Üst bar: Geri ok butonu, "İlanlarıma Gelen Başvurular" başlığı, açıklama metni
- İstatistik kartları (4 adet, yatay sıra):
  - Toplam (gri), Beklemede (mavi), Onaylanan (yeşil), Reddedilen (kırmızı)
  - Her kartta label (10px) ve büyük sayı (18px, bold)
- Filtre tab'ları: Tümü / Beklemede / Onaylanan / Reddedilen / İptal (sayılarıyla birlikte)
- Başvuru kartları:
  - İlan adı badge'i (mavi arka plan, yuvarlak)
  - Durum badge'i (renkli)
  - Başvuran bilgisi: Avatar (initials), Ad Soyad, Baro — Sicil No
  - Başvuru notu (varsa, italik tırnak içinde)
  - Meta bilgiler: Şehir (location ikonu), Duruşma tarihi (calendar ikonu), Başvuru tarihi
  - "Onayla" ve "Reddet" butonları (yalnızca `pending` durumda)

### Kullanıcı Deneyimi
- Tüm ilanların başvuruları tek sayfada toplanır (web'deki ile aynı yapı)
- İstatistik kartları anlık özet sunar
- Filtre tab'ları ile duruma göre filtreleme
- Onaylama dialogunda uyarı: "İlan kapatılacak ve diğer başvurular reddedilecektir."
- Boş durumda filtreye özel mesaj: "Bu filtreye uygun başvuru yok." veya "İlanlarınıza henüz başvuru yapılmamış."
- Aksiyon sonrası (`approve`/`reject`) tüm veriler yenilenir

### Teknik Detaylar
- **Veri Toplama Akışı:** Önce `lawyersApi.getListings()` ile kullanıcının tüm ilanları çekilir, ardından her ilan için `listingsApi.getApplications()` çağrılır ve tüm başvurular tek bir dizide birleştirilir
- **State Management:** `applications`, `loading`, `filter` state'leri
- **İstatistik Hesaplama:** `.filter()` ile duruma göre sayım

---

## 6. Tek İlan Başvuruları Ekranı

- **API Endpoint:** `GET /api/listings/{listingId}/applications`
- **Dosya:** `src/screens/listings/ListingApplicationsScreen.js`
- **Görev:** Belirli bir ilana gelen başvuruları listeleme ve yönetme

### UI Bileşenleri
- Üst bar: Geri ok butonu, "Gelen Başvurular" başlığı, ilan adı (alt başlık)
- `FlatList` ile başvuru listesi (`ApplicationCard` bileşeni)
- Her başvuru kartında onayla/reddet butonları
- Boş durum: "Bu ilana henüz başvuru yapılmamış."

### Teknik Detaylar
- **Parametreler:** `route.params` üzerinden `listingId` ve `listingTitle` alınır
- **API Çağrıları:**
  - `listingsApi.getApplications(listingId)` → Başvuruları getir
  - `applicationsApi.approve(app.id)` → Onayla
  - `applicationsApi.reject(app.id)` → Reddet
- **Aksiyon Sonrası:** `fetchApplications()` tekrar çağrılarak liste güncellenir

---

## 7. Başvurularım Ekranı

- **API Endpoint:** `GET /api/lawyers/{id}/applications`
- **Dosya:** `src/screens/applications/MyApplicationsScreen.js`
- **Görev:** Avukatın diğer avukatların ilanlarına yaptığı başvuruları görüntüleme ve yönetme

### UI Bileşenleri
- "Başvurularım" başlığı ve "Diğer avukatların ilanlarına yaptığınız başvurular" alt başlığı
- İstatistik kartları (4 adet, yatay sıra):
  - Toplam (gri), Beklemede (mavi), Onaylanan (yeşil), Reddedilen (kırmızı)
- Filtre tab'ları: Tümü / Beklemede / Onaylanan / Reddedilen (sayılarıyla birlikte)
- Başvuru kartları (`ApplicationCard` bileşeni):
  - İlan adı badge'i, durum badge'i
  - İlan sahibi bilgisi (varsa)
  - Başvuru notu
  - Meta bilgiler: Şehir, duruşma tarihi, başvuru tarihi
  - "İptal Et" butonu (yalnızca `pending` durumda, kırmızı outline)

### Kullanıcı Deneyimi
- İptal işleminde `Alert.alert()` ile onay dialogu
- İptal sırasında `cancellingId` state ile buton loading durumu
- Filtre tab'ları ile duruma göre anlık filtreleme
- Boş durumda filtreye özel mesaj gösterimi

### Teknik Detaylar
- **API Çağrıları:**
  - `lawyersApi.getApplications(user.id)` → Başvuruları getir
  - `listingsApi.cancelApplication(app.listing_id, app.id)` → `DELETE /api/listings/{listingId}/applications/{applicationId}`
- **State Management:** `applications`, `loading`, `filter`, `cancellingId` state'leri
- **İstatistik:** `applications.filter()` ile duruma göre sayım

---

## 8. API Servis Modülleri

### listingsApi.js
- **Dosya:** `src/api/listingsApi.js`
- **Fonksiyonlar:**

| Fonksiyon | HTTP Metodu | Endpoint | Açıklama |
|---|---|---|---|
| `getAll(params)` | `GET` | `/listings?city=&courthouse=&date=` | Filtrelenmiş ilan listesi |
| `create(data)` | `POST` | `/listings` | Yeni ilan oluştur |
| `update(id, data)` | `PUT` | `/listings/{id}` | İlan güncelle |
| `remove(id)` | `DELETE` | `/listings/{id}` | İlan kaldır |
| `getApplications(listingId)` | `GET` | `/listings/{listingId}/applications` | İlana gelen başvurular |
| `apply(listingId, data)` | `POST` | `/listings/{listingId}/applications` | İlana başvur |
| `cancelApplication(listingId, appId)` | `DELETE` | `/listings/{listingId}/applications/{appId}` | Başvuru iptal |

### applicationsApi.js
- **Dosya:** `src/api/applicationsApi.js`
- **Fonksiyonlar:**

| Fonksiyon | HTTP Metodu | Endpoint | Açıklama |
|---|---|---|---|
| `approve(applicationId)` | `PATCH` | `/applications/{applicationId}/approve` | Başvuruyu onayla |
| `reject(applicationId)` | `PATCH` | `/applications/{applicationId}/reject` | Başvuruyu reddet |