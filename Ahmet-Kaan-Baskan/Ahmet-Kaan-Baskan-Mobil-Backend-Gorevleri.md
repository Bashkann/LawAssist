# Ahmet Kaan Başkan'ın Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

---

## Sorumlu Olduğu API Servis Dosyaları

| Dosya | Açıklama |
|---|---|
| `src/api/listingsApi.js` | İlan servisleri (oluşturma, listeleme, güncelleme, silme, başvuru işlemleri) |
| `src/api/applicationsApi.js` | Başvuru onay/red servisleri |

---

## 1. Tevkil İlanı Oluşturma Servisi

- **API Endpoint:** `POST /api/listings`
- **Servis Dosyası:** `src/api/listingsApi.js` → `listingsApi.create(data)`
- **Görev:** Avukatın yeni bir tevkil ilanı oluşturması için mobil uygulamadan backend'e istek gönderme

### İşlevler
- İlan oluşturma formundan verileri toplama (`title`, `description`, `city`, `courthouse`, `hearing_date`)
- Client-side validasyon: Başlık, şehir, adliye ve duruşma tarihi zorunlu alan kontrolü
- Şehir seçimi `PickerModal` ile, adliye seçimi şehre bağlı `PickerModal` ile, tarih seçimi `DateTimePicker` ile yapılır
- `axiosInstance` üzerinden `POST /api/listings` isteği gönderme (Bearer Token otomatik eklenir)
- Başarılı yanıtta (`201 Created`) `Alert.alert()` ile bildirim ve `navigation.goBack()` ile geri dönüş
- Hata durumlarının yakalanması ve `ErrorMessage` bileşeni ile gösterimi

### Request/Response
- **Request Body:**
```json
{
  "title": "Başvurulacak Dava",
  "description": "Başvurulacak.",
  "city": "Adana",
  "courthouse": "Adana Adliyesi",
  "hearing_date": "2026-08-20"
}
```
- **Response (201 Created):**
```json
{
  "message": "İlan başarıyla oluşturuldu",
  "data": {
    "id": "02a6cd6e-54b9-4eb0-a008-8c2ce42fd06e",
    "owner_id": "a529b557-ef3e-46c6-8e33-6983f8d9a504",
    "title": "Başvurulacak Dava",
    "description": "Başvurulacak.",
    "city": "Adana",
    "courthouse": "Adana Adliyesi",
    "hearing_date": "2026-08-20T00:00:00.000Z",
    "status": "active",
    "created_at": "2026-04-05T18:07:41.336Z",
    "updated_at": "2026-04-05T18:07:41.336Z"
  }
}
```

### Teknik Detaylar
- **Token Ekleme:** `axiosInstance` request interceptor'ı `SecureStore`'dan `accessToken`'ı okuyup `Authorization: Bearer {token}` header'ına otomatik ekler
- **Tarih Formatı:** `DateTimePicker` çıktısı `YYYY-MM-DD` string formatına dönüştürülerek API'ye gönderilir
- **Adliye Bağımlılığı:** `constants.js`'deki `CITY_COURTHOUSES` objesinden `getCourthousesByCity(city)` ile şehre ait adliye listesi dinamik olarak alınır
- **Error Handling:** `err.response?.data?.message || 'İlan oluşturulamadı.'`

---

## 2. İlanları Filtreleme Servisi (Şehir / Tarih / Adliye)

- **API Endpoint:** `GET /api/listings?city={city}&courthouse={courthouse}&date={date}`
- **Servis Dosyası:** `src/api/listingsApi.js` → `listingsApi.getAll(params)`
- **Görev:** Mevcut tevkil ilanlarını şehir, adliye ve/veya tarihe göre filtreleyerek listeleme

### İşlevler
- Filtre bileşeninden seçilen parametreleri toplama (`city`, `courthouse`, `date`)
- Yalnızca dolu olan parametreleri `params` objesine ekleme (boş parametreler gönderilmez)
- `axiosInstance` üzerinden `GET /api/listings` isteği gönderme (query string olarak)
- Dönen ilan listesini `FlatList` ile `ListingCard` bileşenleri olarak gösterme
- Filtre temizleme ile tüm parametreleri sıfırlama

### Response
- **Response (200 OK):**
```json
{
  "message": "İlanlar başarıyla getirildi",
  "data": [
    {
      "id": "4ccb85c4-5682-445c-b01f-1a1b21a7fb66",
      "title": "Ankara İcra Hukuk Mahkemesi Duruşması",
      "description": "Dosya no: 2024/123. Sadece mazeret bildirilecektir.",
      "city": "Ankara",
      "courthouse": "Ankara Adliyesi",
      "hearing_date": "2026-04-13T00:00:00.000Z",
      "status": "active",
      "created_at": "2026-03-25T14:11:24.081Z",
      "updated_at": "2026-04-04T09:38:55.937Z",
      "owner": {
        "id": "4a33c18a-e0c6-4e20-bd30-3eb89c38751c",
        "first_name": "Elif",
        "last_name": "Arslan",
        "bar_association": "Bursa Barosu"
      }
    }
  ]
}
```

### Teknik Detaylar
- **Kombine Filtre:** Üç parametre AND koşulu ile birleştirilebilir: `GET /api/listings?city=Ankara&courthouse=Ankara Adliyesi&date=2026-04-13`
- **Boş Sonuç:** `data` boş dizi döndüğünde `ListEmptyComponent` ile "İlan Bulunamadı" mesajı gösterilir
- **Herkese Açık:** Bu endpoint giriş yapılmadan da erişilebilir, ancak mobil uygulamada token varsa otomatik eklenir

---

## 3. Tevkil İlanını Güncelleme Servisi

- **API Endpoint:** `PUT /api/listings/{listingId}`
- **Servis Dosyası:** `src/api/listingsApi.js` → `listingsApi.update(id, data)`
- **Görev:** Avukatın kendi oluşturduğu ilanı güncellemesi

### İşlevler
- `EditListingModal` içindeki formdan güncellenen verileri toplama
- Mevcut ilan verilerinin `useEffect` ile form alanlarına doldurulması
- `axiosInstance` üzerinden `PUT /api/listings/{id}` isteği gönderme
- Başarılı güncelleme sonrası `Alert.alert()` ile bildirim, modal kapatma ve ilan listesini yenileme

### Request/Response
- **Request Body:**
```json
{
  "title": "Başvurulacak Dava",
  "description": "Güncel: Dosya no 2024/123. Ek olarak bir evrak sunulacak.",
  "city": "Adana",
  "courthouse": "Adana Adliyesi",
  "hearing_date": "2026-05-16"
}
```
- **Response (200 OK):**
```json
{
  "message": "İlan başarıyla güncellendi",
  "data": {
    "id": "73844e96-8a35-482c-a307-2d5eacf1b64b",
    "owner_id": "a529b557-ef3e-46c6-8e33-6983f8d9a504",
    "title": "Başvurulacak Dava",
    "description": "Güncel: Dosya no 2024/123. Ek olarak bir evrak sunulacak.",
    "city": "Adana",
    "courthouse": "Adana Adliyesi",
    "hearing_date": "2026-05-16T00:00:00.000Z",
    "status": "active",
    "created_at": "2026-04-05T18:09:08.658Z",
    "updated_at": "2026-04-05T18:09:24.397Z"
  }
}
```

### Teknik Detaylar
- **Sahiplik Kontrolü:** Backend'de `requireLawyer` + sahiplik kontrolü yapılır; yalnızca ilan sahibi güncelleyebilir
- **Tarih Dönüşümü:** Mevcut `hearing_date` ISO formatından (`2026-08-20T00:00:00.000Z`) `YYYY-MM-DD` formatına dönüştürülerek form'a doldurulur (`.split('T')[0]`)
- **Modal İçi Picker:** Düzenleme modalı içinde şehir ve adliye picker modal'ları iç içe (`nested modal`) çalışır

---

## 4. Tevkil İlanını Silme (Yayından Kaldırma) Servisi

- **API Endpoint:** `DELETE /api/listings/{listingId}`
- **Servis Dosyası:** `src/api/listingsApi.js` → `listingsApi.remove(id)`
- **Görev:** Avukatın kendi ilanını yayından kaldırması

### İşlevler
- Kullanıcıya `Alert.alert()` ile silme onay dialogu gösterme ("Bu ilanı yayından kaldırmak istediğinize emin misiniz?")
- Onay verildiğinde `axiosInstance` üzerinden `DELETE /api/listings/{id}` isteği gönderme
- Başarılı kaldırma sonrası `fetchListings()` çağrılarak ilan listesinin güncellenmesi

### Response
- **Response (200 OK):**
```json
{
  "message": "İlan başarıyla yayından kaldırıldı",
  "data": {
    "id": "73844e96-8a35-482c-a307-2d5eacf1b64b",
    "owner_id": "a529b557-ef3e-46c6-8e33-6983f8d9a504",
    "title": "Başvurulacak Dava",
    "status": "passive",
    "updated_at": "2026-04-05T18:10:11.666Z"
  }
}
```

### Teknik Detaylar
- **İş Kuralı:** İlan silindiğinde `status → passive` yapılır; ilana bağlı tüm başvuruların `status` alanı `cancelled` olarak güncellenir
- **UI Kontrolü:** "Kaldır" butonu yalnızca `status === 'active'` olan ilanlarda gösterilir
- **Destructive Action:** Kırmızı renkli buton, `Alert.alert()` ile `destructive` stilde onay

---

## 5. Kendi İlanıma Yapılan Başvuruları Listeleme Servisi

- **API Endpoint:** `GET /api/listings/{listingId}/applications`
- **Servis Dosyası:** `src/api/listingsApi.js` → `listingsApi.getApplications(listingId)`
- **Görev:** İlan sahibinin kendi ilanına gelen başvuruları görüntülemesi

### İşlevler
- İlan ID'si ile `axiosInstance` üzerinden `GET /api/listings/{listingId}/applications` isteği gönderme
- Dönen başvuru listesini başvuran bilgileriyle birlikte gösterme
- `MyListingsScreen`'de inline olarak veya `ListingApplicationsScreen`'de ayrı sayfa olarak kullanılma
- `IncomingApplicationsScreen`'de tüm ilanların başvurularını topluca gösterme

### Response
- **Response (200 OK):**
```json
{
  "message": "Başvurular başarıyla getirildi",
  "data": [
    {
      "id": "976dec12-0050-4710-aac9-e890b80f043d",
      "listing_id": "db23b47d-5227-47c9-a50c-079b88208f3a",
      "note": "Merhaba. Bu dosyaya başvurabilirim.",
      "status": "cancelled",
      "created_at": "2026-04-05T11:17:57.640Z",
      "updated_at": "2026-04-05T11:35:55.598Z",
      "applicant": {
        "id": "794359a7-ea73-4d75-a372-264781da927b",
        "first_name": "asım sinan",
        "last_name": "yüksel",
        "email": "asim@gmail.com",
        "phone": "+9005011610225",
        "bar_association": "ısparta",
        "bar_number": "12345678"
      }
    }
  ]
}
```

### Teknik Detaylar
- **Sahiplik Kontrolü:** Backend'de `requireLawyer` + sahiplik kontrolü; yalnızca ilan sahibi başvuruları görebilir
- **Lazy Loading:** `MyListingsScreen`'de başvurular yalnızca "Başvurular" butonuna basıldığında yüklenir (`applications[listingId]` state objesi ile)
- **Toplu Yükleme:** `IncomingApplicationsScreen`'de `for...of` döngüsü ile her ilan için ayrı ayrı başvuru istekleri atılır ve tüm sonuçlar birleştirilir

---

## 6. Tevkil İlanına Başvurma Servisi

- **API Endpoint:** `POST /api/listings/{listingId}/applications`
- **Servis Dosyası:** `src/api/listingsApi.js` → `listingsApi.apply(listingId, data)`
- **Görev:** Avukatın başka bir avukatın tevkil ilanına başvurması

### İşlevler
- `ListingCard` bileşeninde "Başvur" butonuna tıklandığında başvuru formunu açma
- Opsiyonel not alanından veri toplama (max 500 karakter)
- `axiosInstance` üzerinden `POST /api/listings/{listingId}/applications` isteği gönderme
- Başarılı başvuru sonrası "Başvuruldu" badge'i gösterme ve formu kapatma
- Kendi ilanına başvurma denemesinde backend hata mesajını gösterme

### Request/Response
- **Request Body:**
```json
{
  "note": "Merhaba. Bu dosyaya başvurabilirim."
}
```
- **Response (201 Created):**
```json
{
  "message": "Başvuru başarıyla oluşturuldu",
  "data": {
    "id": "9bf0c08b-880d-49ad-a24a-bea6976dddce",
    "listing_id": "3be68c2b-bf73-4640-b95c-30cab8ecd6cf",
    "applicant_id": "794359a7-ea73-4d75-a372-264781da927b",
    "note": "Merhaba. Bu dosyaya başvurabilirim.",
    "status": "pending",
    "created_at": "2026-04-05T18:11:24.809Z",
    "updated_at": "2026-04-05T18:11:24.809Z"
  }
}
```

### Hata Durumları
| HTTP Kodu | Durum | Kullanıcıya Gösterilen Mesaj |
|---|---|---|
| 400 Bad Request | Kendi ilanına başvurma | "Kendi ilanınıza başvuramazsınız." |
| 400 Bad Request | Zaten başvurulmuş | "Bu ilana zaten başvuru yaptınız." |
| 400 Bad Request | İlan aktif değil | Backend'den gelen mesaj |

### Teknik Detaylar
- **İş Kuralı:** `applicant_id === owner_id` ise backend 400 hatası döner
- **Inline Form:** Başvuru formu ayrı bir sayfa değil, `ListingCard` içinde açılır/kapanır
- **State Yönetimi:** `showApply`, `note`, `applying`, `applied`, `error` state'leri kart bazında yönetilir

---

## 7. Yapılan Başvuruyu İptal Etme Servisi

- **API Endpoint:** `DELETE /api/listings/{listingId}/applications/{applicationId}`
- **Servis Dosyası:** `src/api/listingsApi.js` → `listingsApi.cancelApplication(listingId, applicationId)`
- **Görev:** Avukatın daha önce yaptığı bir başvuruyu iptal etmesi

### İşlevler
- `MyApplicationsScreen`'de "İptal Et" butonuna tıklandığında `Alert.alert()` ile onay dialogu gösterme
- Onay verildiğinde `axiosInstance` üzerinden `DELETE /api/listings/{listingId}/applications/{applicationId}` isteği gönderme
- Başarılı iptal sonrası `fetchData()` çağrılarak başvuru listesinin güncellenmesi

### Response
- **Response (200 OK):**
```json
{
  "message": "Başvuru başarıyla iptal edildi",
  "data": {
    "id": "36686b86-825d-4fec-ac13-75e46badda23",
    "listing_id": "5cce2f3c-9e39-4442-a43a-78b4b305facc",
    "applicant_id": "794359a7-ea73-4d75-a372-264781da927b",
    "note": "Merhaba. Bu dosyaya başvurabilirim.",
    "status": "cancelled",
    "created_at": "2026-04-05T18:12:06.539Z",
    "updated_at": "2026-04-05T18:13:15.334Z"
  }
}
```

### Teknik Detaylar
- **Sahiplik Kontrolü:** Backend'de yalnızca başvuru sahibi iptal edebilir
- **Durum Kontrolü:** "İptal Et" butonu yalnızca `status === 'pending'` olan başvurularda gösterilir
- **Loading State:** `cancellingId` state ile iptal edilen başvurunun ID'si tutularak butonun loading durumu yönetilir
- **Destructive Action:** `Alert.alert()` ile `destructive` stilde onay dialogu

---

## 8. Başvuru Onaylama Servisi

- **API Endpoint:** `PATCH /api/applications/{applicationId}/approve`
- **Servis Dosyası:** `src/api/applicationsApi.js` → `applicationsApi.approve(applicationId)`
- **Görev:** İlan sahibinin gelen başvurulardan birini onaylaması

### İşlevler
- `MyListingsScreen` inline başvurular veya `IncomingApplicationsScreen`'de "Onayla" butonuna tıklandığında `Alert.alert()` ile onay dialogu gösterme
- Uyarı mesajı: "Bu başvuruyu onaylamak istediğinize emin misiniz? İlan kapatılacak."
- Onay verildiğinde `axiosInstance` üzerinden `PATCH /api/applications/{applicationId}/approve` isteği gönderme
- Başarılı onaylama sonrası başvuru listesini ve ilan listesini yenileme

### Teknik Detaylar
- **İş Kuralları:**
  - Yalnızca ilan sahibi onaylayabilir
  - Yalnızca `pending` durumundaki başvurular onaylanabilir
  - Onaylama sonrası ilan otomatik kapatılır (`status → cancelled`)
  - `listings.accepted_application_id` güncellenir
  - Aynı ilana yapılan diğer bekleyen başvurular otomatik reddedilir
- **Kullanım Yerleri:** `MyListingsScreen` (inline), `ListingApplicationsScreen`, `IncomingApplicationsScreen`

---

## 9. Başvuru Reddetme Servisi

- **API Endpoint:** `PATCH /api/applications/{applicationId}/reject`
- **Servis Dosyası:** `src/api/applicationsApi.js` → `applicationsApi.reject(applicationId)`
- **Görev:** İlan sahibinin gelen başvurulardan birini reddetmesi

### İşlevler
- "Reddet" butonuna tıklandığında `Alert.alert()` ile onay dialogu gösterme ("Bu başvuruyu reddetmek istediğinize emin misiniz?")
- Onay verildiğinde `axiosInstance` üzerinden `PATCH /api/applications/{applicationId}/reject` isteği gönderme
- Başarılı reddetme sonrası başvuru listesini yenileme

### Teknik Detaylar
- **İş Kuralları:**
  - Yalnızca ilan sahibi reddedebilir
  - Yalnızca `pending` durumundaki başvurular reddedilebilir
- **Destructive Action:** `Alert.alert()` ile `destructive` stilde "Reddet" butonu
- **Kullanım Yerleri:** `MyListingsScreen` (inline), `ListingApplicationsScreen`, `IncomingApplicationsScreen`