# Ünal Şener'in Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

---

## Sorumlu Olduğu API Servis Dosyaları

| Dosya | Açıklama |
|---|---|
| `src/api/adminApi.js` | Admin yönetim servisleri (giriş, avukat yönetimi, ilan denetimi) |
| `src/navigation/AppNavigator.js` | Kök navigasyon — auth/admin/lawyer state kontrolü |

---

## 1. Admin Giriş Servisi

- **API Endpoint:** `POST /api/admin/login`
- **Servis Dosyası:** `src/api/adminApi.js` → `adminApi.login(data)`
- **Görev:** Sistem yöneticisinin admin paneline giriş yapması için mobil uygulamadan backend'e kimlik doğrulama isteği gönderme

### İşlevler
- Admin giriş formundan email ve şifre bilgilerini toplama
- Client-side validasyon: Email ve şifre alanlarının boş olmadığı kontrolü
- `axiosInstance` üzerinden `POST /api/admin/login` isteği gönderme (token eklenmez — auth endpoint)
- Başarılı yanıtta dönen `token` ve `admin` bilgisini `SecureStore`'a kaydetme
- `AppNavigator`'daki periyodik kontrol mekanizması sayesinde otomatik olarak `AdminStack`'e geçiş
- Hata durumlarının yakalanması ve `ErrorMessage` bileşeni ile gösterimi

### Request/Response
- **Request Body:**
```json
{
  "email": "admin1@lawassist.com",
  "password": "law1234"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Admin girişi başarılı.",
  "data": {
    "admin": {
      "id": "...",
      "email": "admin1@lawassist.com"
    },
    "token": "<jwt_token>"
  }
}
```

### Hata Durumları
| HTTP Kodu | Durum | Kullanıcıya Gösterilen Mesaj |
|---|---|---|
| 401 Unauthorized | Yanlış email veya şifre | "Email veya şifre hatalı." |

### Teknik Detaylar
- **Auth Endpoint Kontrolü:** `isAuthEndpoint('/admin/login')` koşulu ile bu endpoint'in URL'si doğrudan kontrol edilir — admin login isteğine token eklenmez
- **Token Saklama:** `SecureStore.setItemAsync('adminToken', token)` ve `SecureStore.setItemAsync('admin', JSON.stringify(admin))` — avukat token'ından (`accessToken`) ayrı anahtarda saklanır
- **Navigasyon Geçişi:** `AppNavigator`'da `setInterval` ile 1 saniye aralıklarla `adminToken` varlığı kontrol edilir; token set edildikten sonra otomatik olarak `AdminStack`'e geçilir (ekstra navigasyon çağrısı gerekmez)
- **Avukat/Admin Ayrımı:** `axiosInstance` request interceptor'ı URL'ye göre uygun token'ı seçer: `/admin/*` endpoint'lerinde `adminToken`, diğerlerinde `accessToken`

---

## 2. Tüm Avukatları Listeleme Servisi

- **API Endpoint:** `GET /api/admin/lawyers?status={status}&page={page}&limit={limit}`
- **Servis Dosyası:** `src/api/adminApi.js` → `adminApi.getLawyers(params)`
- **Görev:** Sistemdeki tüm kayıtlı avukatların admin panelinde listelenmesi

### İşlevler
- Filtre parametreleriyle (durum, sayfa, limit) `axiosInstance` üzerinden `GET /api/admin/lawyers` isteği gönderme
- Dönen avukat listesini `FlatList` ile ekranda gösterme
- Durum filtreleme: Tümü / Aktif / Askıda / Silinmiş
- Sayfalama kontrolü: Önceki / Sonraki butonları ile sayfa geçişi
- `AdminDashboardScreen`'de istatistik toplama için de kullanılır (`limit: 1` ile yalnızca `pagination.total` alınır)

### Response
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "6c181a42-7d6b-4ba6-86c0-9eb774ff04dc",
      "first_name": "DENEME1234",
      "last_name": "ornek",
      "email": "deneme1234@email.com",
      "phone": "05122348955",
      "bar_association": "İzmir Barosu",
      "bar_number": "IZM-2026-167",
      "status": "active",
      "created_at": "2026-04-05T11:44:58.919Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Teknik Detaylar
- **Query Parametreleri:** `status` (`all`, `active`, `suspended`, `deleted`), `page` (varsayılan: 1), `limit` (varsayılan: 20)
- **Sayfalama Kontrolü:** `pagination.totalPages` ile "Önceki"/"Sonraki" butonlarının `disabled` durumu yönetilir
- **Filtre Değişikliği:** Filtre seçildiğinde `page` otomatik olarak 1'e sıfırlanır
- **Dashboard Kullanımı:** `Promise.all([getLawyers({limit:1}), getLawyers({status:'active',limit:1}), ...])` ile paralel istatistik toplama

---

## 3. Avukat Detay Bilgilerini Görüntüleme Servisi

- **API Endpoint:** `GET /api/admin/lawyers/{lawyerId}`
- **Servis Dosyası:** `src/api/adminApi.js` → `adminApi.getLawyerById(id)`
- **Görev:** Belirli bir avukatın tüm detaylarını, ilanlarını ve başvurularını getirme

### İşlevler
- `route.params.id` üzerinden avukat ID'sini alma
- `axiosInstance` üzerinden `GET /api/admin/lawyers/{id}` isteği gönderme
- Dönen kapsamlı veriyi ekranda gösterme: profil bilgileri, ilanlar listesi, başvurular listesi
- Düzenleme modalının açılmasında mevcut verilerin form'a doldurulması

### Response
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "6c181a42-7d6b-4ba6-86c0-9eb774ff04dc",
    "first_name": "DENEME1234",
    "last_name": "ornek",
    "email": "deneme1234@email.com",
    "phone": "05122348955",
    "bar_association": "İzmir Barosu",
    "bar_number": "IZM-2026-167",
    "status": "active",
    "created_at": "2026-04-05T11:44:58.919Z",
    "updated_at": "2026-04-05T11:46:20.692Z",
    "listings": [
      {
        "id": "...",
        "title": "Başvurulacak Dava",
        "city": "Adana",
        "hearing_date": "2026-08-20T00:00:00.000Z",
        "status": "active"
      }
    ],
    "applications": [
      {
        "id": "...",
        "listing_title": "Ankara Duruşması",
        "listing_city": "Ankara",
        "listing_hearing_date": "2026-04-13T00:00:00.000Z",
        "status": "pending"
      }
    ]
  }
}
```

### Teknik Detaylar
- **Kapsamlı Veri:** Tek API çağrısında avukat bilgileri + ilanları + başvuruları birlikte döner
- **Veri Kullanımı:** Profil kartı, İlanları bölümü ve Başvuruları bölümü aynı response'tan render edilir
- **Edit Form Ön Yükleme:** `setEditForm({ firstName: data.first_name, ... })` ile düzenleme formu hazırlanır

---

## 4. Avukat Bilgilerini Güncelleme Servisi

- **API Endpoint:** `PUT /api/admin/lawyers/{lawyerId}`
- **Servis Dosyası:** `src/api/adminApi.js` → `adminApi.updateLawyer(id, data)`
- **Görev:** Admin tarafından avukat profil bilgilerinin güncellenmesi

### İşlevler
- `EditModal` içindeki formdan güncellenen verileri toplama (`firstName`, `lastName`, `email`, `phone`)
- `axiosInstance` üzerinden `PUT /api/admin/lawyers/{id}` isteği gönderme
- Başarılı güncelleme sonrası modalı kapatma ve `fetchLawyer()` ile ekranı yenileme

### Request/Response
- **Request Body:**
```json
{
  "firstName": "AhmetGüncellendi",
  "phone": "5559998879"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Avukat bilgileri başarıyla güncellendi.",
  "data": {
    "id": "6c181a42-7d6b-4ba6-86c0-9eb774ff04dc",
    "first_name": "AhmetGüncellendi",
    "last_name": "ornek",
    "email": "deneme1234@email.com",
    "phone": "5559998879"
  }
}
```

### Teknik Detaylar
- **Modal İçi Form:** Düzenleme ortada açılan modal (`justifyContent: 'center'`) içinde yapılır
- **Partial Update:** Yalnızca değişen alanlar gönderilebilir; backend tüm alanları zorunlu tutmaz
- **Error Handling:** `setEditError(err.response?.data?.message || 'Güncelleme başarısız.')`

---

## 5. Avukat Hesabını Askıya Alma Servisi

- **API Endpoint:** `PATCH /api/admin/lawyers/{lawyerId}/suspend`
- **Servis Dosyası:** `src/api/adminApi.js` → `adminApi.suspendLawyer(id, data)`
- **Görev:** Avukat hesabını belirli bir süre için askıya alma

### İşlevler
- `DateTimePicker` ile askı bitiş tarihini seçme (native tarih seçici)
- Tarih seçilmeden "Askıya Al" butonuna basılırsa `Alert.alert()` ile uyarı
- `axiosInstance` üzerinden `PATCH /api/admin/lawyers/{id}/suspend` isteği gönderme
- Başarılı askıya alma sonrası `fetchLawyer()` ile ekranı yenileme ve tarih alanını sıfırlama

### Request/Response
- **Request Body:**
```json
{
  "suspendUntil": "2026-06-01"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Avukat hesabı başarıyla askıya alındı.",
  "data": {
    "id": "...",
    "status": "suspended",
    "suspended_until": "2026-06-01T00:00:00.000Z"
  }
}
```

### Hata Durumları
| HTTP Kodu | Durum | Kullanıcıya Gösterilen Mesaj |
|---|---|---|
| 400 Bad Request | Geçmiş tarih | Backend'den gelen mesaj |
| 400 Bad Request | Silinmiş hesap | "Silinmiş hesaplar askıya alınamaz." |

### Teknik Detaylar
- **İş Kuralları:**
  - Askı bitiş tarihi gelecekte bir tarih olmalıdır (`minimumDate={new Date()}`)
  - Silinmiş (`status: 'deleted'`) hesaplar askıya alınamaz
  - Askı süresi dolduğunda hesap `authenticate` middleware'inde otomatik aktif sayılır
- **Native Tarih Seçici:** `DateTimePicker` ile iOS'ta spinner, Android'de takvim popup
- **Tarih Formatı:** Seçilen tarih `YYYY-MM-DD` formatına dönüştürülerek `suspendUntil` olarak gönderilir
- **State Yönetimi:** `suspendDate`, `showSuspendDatePicker`, `selectedSuspendDate` state'leri

---

## 6. Avukat Hesabını Silme Servisi

- **API Endpoint:** `DELETE /api/admin/lawyers/{lawyerId}`
- **Servis Dosyası:** `src/api/adminApi.js` → `adminApi.deleteLawyer(id)`
- **Görev:** Admin tarafından avukat hesabının kalıcı olarak silinmesi (soft delete)

### İşlevler
- Kullanıcıya `Alert.alert()` ile silme onay dialogu gösterme ("Bu avukatın hesabını silmek istediğinize emin misiniz?")
- Onay verildiğinde `axiosInstance` üzerinden `DELETE /api/admin/lawyers/{id}` isteği gönderme
- Başarılı silme sonrası `fetchLawyer()` ile ekranı yenileme (durum "Silinmiş" olarak güncellenir)

### Response
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Avukat hesabı başarıyla silindi."
}
```

### Hata Durumları
| HTTP Kodu | Durum | Kullanıcıya Gösterilen Mesaj |
|---|---|---|
| 400 Bad Request | Zaten silinmiş | "Bu hesap zaten silinmiş durumda." |

### Teknik Detaylar
- **Soft Delete:** Backend'de `lawyers.status → 'deleted'` yapılır; fiziksel silme gerçekleşmez
- **İş Kuralı:** Zaten silinmiş hesaplar tekrar silinemez
- **UI Kontrolü:** Silinmiş avukatlarda "Yönetim İşlemleri" kartı gösterilmez (`lawyer.status !== 'deleted'` koşulu)
- **Destructive Action:** `Alert.alert()` ile `destructive` stilde "Sil" butonu

---

## 7. Tüm İlanları Listeleme Servisi (Admin Denetimi)

- **API Endpoint:** `GET /api/admin/listings?status={status}&page={page}&limit={limit}`
- **Servis Dosyası:** `src/api/adminApi.js` → `adminApi.getListings(params)`
- **Görev:** Sistemdeki tüm tevkil ilanlarının denetim amaçlı listelenmesi

### İşlevler
- Filtre parametreleriyle (durum, sayfa, limit) `axiosInstance` üzerinden `GET /api/admin/listings` isteği gönderme
- Dönen ilan listesini `FlatList` ile ekranda gösterme
- Durum filtreleme: Tümü / Aktif / Pasif / İptal
- Sayfalama kontrolü: Önceki / Sonraki butonları
- Her ilanda "Avukat Detay" linki ile ilan sahibinin `AdminLawyerDetail` ekranına geçiş
- `AdminDashboardScreen`'de istatistik toplama için de kullanılır (`limit: 1` ile `pagination.total` alınır)

### Response
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "02a6cd6e-54b9-4eb0-a008-8c2ce42fd06e",
      "title": "Başvurulacak Dava",
      "description": "Başvurulacak.",
      "city": "Adana",
      "courthouse": "Adana Adliyesi",
      "hearing_date": "2026-08-20T00:00:00.000Z",
      "status": "active",
      "owner_id": "a529b557-ef3e-46c6-8e33-6983f8d9a504",
      "owner_first_name": "Fatma",
      "owner_last_name": "Öztürk",
      "created_at": "2026-04-05T18:07:41.336Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

### Teknik Detaylar
- **Query Parametreleri:** `status` (`all`, `active`, `passive`, `cancelled`), `page`, `limit`
- **İlan Sahibi Bilgisi:** Response'ta `owner_first_name` ve `owner_last_name` alanları ile ilan sahibi bilgisi döner
- **Navigasyon:** `navigation.navigate('AdminLawyerDetail', { id: item.owner_id })` ile ilan sahibinin detay ekranına geçiş
- **Dashboard Kullanımı:** `getListings({ limit: 1 })` ile yalnızca toplam ilan sayısı alınır

---

## 8. Admin Çıkış ve Navigasyon Yönetimi Servisi

- **Dosya:** `src/navigation/AppNavigator.js`
- **Görev:** Admin oturum durumuna göre navigasyon kontrolü ve çıkış işlemi

### İşlevler
- `SecureStore.getItemAsync('adminToken')` ile admin token varlığını kontrol etme
- 1 saniye aralıklarla periyodik token kontrolü (`setInterval`) — login/logout sonrası anlık geçiş
- Admin çıkış işleminde `SecureStore`'dan `adminToken` ve `admin` verilerinin silinmesi
- Token silindiğinde `isAdmin` state'i `false` olur ve `AppNavigator` otomatik olarak `AuthStack`'e döner

### Admin Çıkış Akışı
1. `AdminDashboardScreen`'de çıkış ikonuna tıklanır
2. `Alert.alert()` ile onay dialogu gösterilir ("Admin panelinden çıkmak istediğinize emin misiniz?")
3. Onay verildiğinde `SecureStore.deleteItemAsync('adminToken')` ve `SecureStore.deleteItemAsync('admin')` çağrılır
4. `AppNavigator`'daki `setInterval` kontrolü `adminToken`'ın silindiğini tespit eder
5. `isAdmin` state'i `false` olur, navigasyon ağacı `AuthStack`'e geçer

### Navigasyon Karar Ağacı
```
AppNavigator başlatılır
    ├── AuthContext.loading === true → LoadingSpinner göster
    ├── user !== null → LawyerTabs göster (avukat giriş yapmış)
    ├── adminToken var → AdminStack göster (admin giriş yapmış)
    └── Hiçbiri yok → AuthStack göster (giriş ekranı)
```

### Teknik Detaylar
- **Avukat/Admin Ayrımı:** Avukat state'i `AuthContext` üzerinden `user` objesi ile, admin state'i `SecureStore`'daki `adminToken` anahtarı ile yönetilir
- **Polling Mekanizması:** `setInterval(1000)` ile her saniye `adminToken` kontrol edilir; `useEffect` cleanup'ında `clearInterval` ile temizlenir
- **Öncelik Sırası:** `user` kontrolü `isAdmin` kontrolünden önce yapılır; bir kullanıcı hem avukat hem admin olamaz
- **State Değişim Tespiti:** `newVal !== isAdmin` kontrolü ile yalnızca değişiklik olduğunda state güncellenir (gereksiz render önlenir)