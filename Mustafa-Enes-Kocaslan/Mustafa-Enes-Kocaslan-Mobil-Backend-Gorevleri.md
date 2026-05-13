# Mustafa Enes Koçaslan'ın Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

---

## Sorumlu Olduğu API Servis Dosyaları

| Dosya | Açıklama |
|---|---|
| `src/api/authApi.js` | Kimlik doğrulama servisleri (kayıt, giriş, şifre sıfırlama) |
| `src/api/lawyersApi.js` | Avukat profil servisleri (görüntüleme, güncelleme, silme, ilanlar) |
| `src/api/axiosInstance.js` | Merkezi HTTP istemci yapılandırması (ortak) |
| `src/context/AuthContext.js` | Kimlik doğrulama state yönetimi ve token operasyonları |

---

## 1. Kullanıcı Kayıt Servisi

- **API Endpoint:** `POST /api/auth/register`
- **Servis Dosyası:** `src/api/authApi.js` → `authApi.register(data)`
- **Görev:** Yeni avukatın sisteme kayıt olması için mobil uygulamadan backend'e kayıt isteği gönderme

### İşlevler
- Kayıt formundan gelen kullanıcı bilgilerini toplama (`first_name`, `last_name`, `email`, `password`, `phone`, `bar_association`, `bar_number`)
- Client-side validasyon: Tüm alanların dolu olması, şifre minimum 8 karakter, şifre tekrar eşleşmesi
- `axiosInstance` üzerinden `POST /api/auth/register` isteği gönderme
- Başarılı yanıtta (`201 Created`) dönen `lawyer` objesi ve `accessToken` ile `AuthContext.login()` çağrılarak otomatik giriş yapılma
- Token'ın `SecureStore`'a kaydedilmesi ve kullanıcının `LawyerTabs`'a yönlendirilmesi
- Hata durumlarının yakalanması ve kullanıcıya gösterilmesi

### Request/Response
- **Request Body:**
```json
{
  "first_name": "DENEME1234",
  "last_name": "ornek",
  "email": "deneme1234@email.com",
  "password": "12345678",
  "phone": "05122348955",
  "bar_association": "İzmir Barosu",
  "bar_number": "IZM-2026-167"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Hesabınız başarıyla oluşturuldu.",
  "data": {
    "lawyer": {
      "id": "6c181a42-7d6b-4ba6-86c0-9eb774ff04dc",
      "first_name": "DENEME1234",
      "last_name": "ornek",
      "email": "deneme1234@email.com",
      "phone": "05122348955",
      "bar_association": "İzmir Barosu",
      "bar_number": "IZM-2026-167",
      "status": "active",
      "created_at": "2026-04-05T11:44:58.919Z"
    },
    "accessToken": "<jwt_token>"
  }
}
```

### Hata Durumları
| HTTP Kodu | Durum | Kullanıcıya Gösterilen Mesaj |
|---|---|---|
| 409 Conflict | Email zaten kayıtlı | "Bu email adresi zaten kullanılmaktadır." |
| 400 Bad Request | Eksik veya geçersiz alan | Backend'den gelen validasyon mesajı |

### Teknik Detaylar
- **HTTP Client:** `axios` — `axiosInstance.post('/auth/register', data)`
- **Auth Endpoint Kontrolü:** `isAuthEndpoint()` fonksiyonu ile bu endpoint'e token eklenmez (henüz giriş yapılmamış kullanıcı)
- **Token Saklama:** Başarılı kayıt sonrası `SecureStore.setItemAsync('accessToken', token)` ve `SecureStore.setItemAsync('user', JSON.stringify(lawyer))`
- **State Güncellemesi:** `AuthContext.login(lawyer, accessToken)` ile global state güncellenir, `AppNavigator` otomatik olarak `LawyerTabs`'a geçer
- **Error Handling:** `catch (err) { setError(err.response?.data?.message || 'Kayıt yapılamadı.') }`

---

## 2. Kullanıcı Giriş Servisi

- **API Endpoint:** `POST /api/auth/login`
- **Servis Dosyası:** `src/api/authApi.js` → `authApi.login(data)`
- **Görev:** Kayıtlı avukatın email ve şifre ile sisteme giriş yapması

### İşlevler
- Giriş formundan email ve şifre bilgilerini toplama
- Client-side validasyon: Email ve şifre alanlarının boş olmadığı kontrolü
- `axiosInstance` üzerinden `POST /api/auth/login` isteği gönderme
- Başarılı yanıtta dönen `lawyer` objesi ve `accessToken` ile `AuthContext.login()` çağrılması
- Token ve kullanıcı bilgisinin `SecureStore`'a kaydedilmesi
- Hata durumlarının yakalanması ve ekranda gösterilmesi

### Request/Response
- **Request Body:**
```json
{
  "email": "deneme1234@email.com",
  "password": "12345678"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Giriş başarılı.",
  "data": {
    "lawyer": {
      "id": "6c181a42-7d6b-4ba6-86c0-9eb774ff04dc",
      "first_name": "DENEME1234",
      "last_name": "ornek",
      "email": "deneme1234@email.com",
      "phone": "05122348955",
      "bar_association": "İzmir Barosu",
      "bar_number": "IZM-2026-167",
      "status": "active",
      "suspended_until": null
    },
    "accessToken": "<jwt_token>"
  }
}
```

### Hata Durumları
| HTTP Kodu | Durum | Kullanıcıya Gösterilen Mesaj |
|---|---|---|
| 401 Unauthorized | Yanlış email veya şifre | "Email veya şifre hatalı." |
| 403 Forbidden | Hesap askıya alınmış | "Hesabınız {tarih} tarihine kadar askıya alınmıştır." |

### Teknik Detaylar
- **Auth Endpoint:** `isAuthEndpoint('/auth/login')` → `true`, token eklenmez
- **JWT Payload:** Başarılı giriş sonrası token'da `{ id, role: 'lawyer', exp }` bilgileri bulunur
- **State Akışı:** `login()` → `SecureStore.setItemAsync()` → `setUser()` → `AppNavigator` koşullu render ile `LawyerTabs`'a geçiş
- **Error Handling:** `err.response?.data?.message || 'Giriş yapılamadı.'`

---

## 3. Şifre Sıfırlama Maili Gönderme Servisi

- **API Endpoint:** `POST /api/auth/forgot-password`
- **Servis Dosyası:** `src/api/authApi.js` → `authApi.forgotPassword(email)`
- **Görev:** Şifresini unutan avukata şifre sıfırlama bağlantısı içeren email gönderilmesini tetikleme

### İşlevler
- Kullanıcıdan email adresini alma
- Client-side validasyon: Email alanının boş olmadığı kontrolü
- `axiosInstance` üzerinden `POST /api/auth/forgot-password` isteği gönderme
- Başarılı yanıtta ekranı başarı durumuna geçirme (email gönderildi bildirimi)
- Güvenlik: Kullanıcı var olsa da olmasa da aynı başarı mesajı gösterilir

### Request/Response
- **Request Body:**
```json
{
  "email": "deneme1234@email.com"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Kayıtlı bir hesap varsa şifre sıfırlama maili gönderildi."
}
```

### Teknik Detaylar
- **Güvenlik Prensibi:** Email enumeration saldırılarına karşı backend her durumda aynı mesajı döner
- **State Geçişi:** `sent: true` yapılarak form görünümünden başarı görünümüne geçilir
- **Backend İşlemi:** Token üretilir, `password_reset_tokens` tablosuna kaydedilir, 5 dakika geçerli bağlantı içeren email gönderilir

---

## 4. Yeni Şifre Belirleme Servisi

- **API Endpoint:** `POST /api/auth/reset-password`
- **Servis Dosyası:** `src/api/authApi.js` → `authApi.resetPassword(data)`
- **Görev:** Şifre sıfırlama token'ı ile yeni şifre belirleme

### İşlevler
- `route.params.token` üzerinden şifre sıfırlama token'ını alma
- Yeni şifre ve şifre tekrar alanlarından veri toplama
- Client-side validasyon: Şifre boş olamaz, minimum 8 karakter, eşleşme kontrolü
- `axiosInstance` üzerinden `POST /api/auth/reset-password` isteği gönderme
- Başarılı yanıtta başarı ekranı gösterme ve giriş sayfasına yönlendirme

### Request/Response
- **Request Body:**
```json
{
  "token": "53d52a9f4bb1d59e70b757255ab5ad06cf5b0c7d8726134a7010886da047a092",
  "password": "yenisifre123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz."
}
```

### Hata Durumları
| HTTP Kodu | Durum | Kullanıcıya Gösterilen Mesaj |
|---|---|---|
| 400 Bad Request | Token geçersiz | "Geçersiz veya süresi dolmuş bağlantı." |
| 400 Bad Request | Token daha önce kullanılmış | "Bu bağlantı daha önce kullanılmıştır." |
| 400 Bad Request | Token süresi dolmuş | "Bağlantının süresi dolmuştur. Lütfen tekrar şifre sıfırlama talebinde bulunun." |

### Teknik Detaylar
- **Token Kontrolü:** Token `route.params` üzerinden alınır; yoksa "Geçersiz Bağlantı" ekranı gösterilir
- **Backend İş Kuralları:** Token `password_reset_tokens` tablosunda kontrol edilir; `used = true` veya `expires_at < now()` ise reddedilir
- **Üç Durumlu Ekran:** Token yoksa → geçersiz, form → şifre belirleme, başarı → onay

---

## 5. Avukat Profil Bilgilerini Görüntüleme Servisi

- **API Endpoint:** `GET /api/lawyers/{lawyerId}`
- **Servis Dosyası:** `src/api/lawyersApi.js` → `lawyersApi.getProfile(id)`
- **Görev:** Giriş yapmış avukatın profil bilgilerini backend'den çekip ekranda gösterme

### İşlevler
- `AuthContext`'ten `user.id` ile avukat ID'sini alma
- `axiosInstance` üzerinden `GET /api/lawyers/{id}` isteği gönderme (Bearer Token otomatik eklenir)
- Dönen `lawyer` objesini state'e kaydetme ve ekranda gösterme
- Ekran odaklandığında (`focus` event) verilerin yenilenmesi
- Hata durumunda `ErrorMessage` bileşeni ile mesaj gösterimi

### Response
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "lawyer": {
      "id": "6c181a42-7d6b-4ba6-86c0-9eb774ff04dc",
      "first_name": "DENEME1234",
      "last_name": "ornek",
      "email": "deneme1234@email.com",
      "phone": "05122348955",
      "bar_association": "İzmir Barosu",
      "bar_number": "IZM-2026-167",
      "status": "active",
      "created_at": "2026-04-05T11:44:58.919Z",
      "updated_at": "2026-04-05T11:46:20.692Z"
    }
  }
}
```

### Teknik Detaylar
- **Token Ekleme:** `axiosInstance` request interceptor'ı `SecureStore`'dan `accessToken`'ı okuyup `Authorization: Bearer {token}` header'ına otomatik ekler
- **Cache Stratejisi:** Profil verisi `SecureStore`'da `user` anahtarı ile cache'lenir; uygulama açılışında önce cache'den hızlı gösterim, ardından API'den güncel veri alınır
- **Focus Listener:** `navigation.addListener('focus', fetchProfile)` ile Profil tab'ına her dönüşte veri yenilenir

---

## 6. Avukat Profil Bilgilerini Güncelleme Servisi

- **API Endpoint:** `PUT /api/lawyers/{lawyerId}`
- **Servis Dosyası:** `src/api/lawyersApi.js` → `lawyersApi.updateProfile(id, data)`
- **Görev:** Avukatın profil bilgilerini düzenleyip backend'e kaydetme

### İşlevler
- Düzenleme formundan güncellenen verileri toplama (`first_name`, `last_name`, `email`, `phone`, `bar_association`, `bar_number`)
- `axiosInstance` üzerinden `PUT /api/lawyers/{id}` isteği gönderme
- Başarılı güncelleme sonrası `AuthContext.updateUser()` ile global state ve `SecureStore` cache'ini güncelleme
- `Alert.alert()` ile başarı bildirimi ve `navigation.goBack()` ile profil ekranına dönüş

### Request/Response
- **Request Body:**
```json
{
  "first_name": "yeniad",
  "last_name": "yenisoyad",
  "phone": "05551234567",
  "bar_association": "İstanbul Barosu",
  "bar_number": "ISP-2026-030"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Profil bilgileriniz başarıyla güncellendi.",
  "data": {
    "lawyer": {
      "id": "6c181a42-7d6b-4ba6-86c0-9eb774ff04dc",
      "first_name": "yeniad",
      "last_name": "yenisoyad",
      "email": "deneme1234@email.com",
      "phone": "05551234567",
      "bar_association": "İstanbul Barosu",
      "bar_number": "ISP-2026-030",
      "status": "active",
      "created_at": "2026-04-05T11:44:58.919Z",
      "updated_at": "2026-04-05T11:48:29.699Z"
    }
  }
}
```

### Teknik Detaylar
- **State Senkronizasyonu:** `updateUser(updated)` → `setUser(updatedLawyer)` + `SecureStore.setItemAsync('user', JSON.stringify(updatedLawyer))` — hem global state hem cache güncellenir
- **Veri Ön Yükleme:** Düzenleme ekranı açıldığında `lawyersApi.getProfile()` ile mevcut veriler çekilip form alanlarına doldurulur

---

## 7. Avukat Hesabını Silme Servisi

- **API Endpoint:** `DELETE /api/lawyers/{lawyerId}`
- **Servis Dosyası:** `src/api/lawyersApi.js` → `lawyersApi.deleteProfile(id)`
- **Görev:** Avukatın kendi hesabını kalıcı olarak silmesi (soft delete)

### İşlevler
- Kullanıcıya `Alert.alert()` ile silme onay dialogu gösterme ("Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?")
- Onay verildiğinde `axiosInstance` üzerinden `DELETE /api/lawyers/{id}` isteği gönderme
- Başarılı silme sonrası `AuthContext.logout()` çağrılarak token ve cache temizleme
- Kullanıcının otomatik olarak login ekranına yönlendirilmesi

### Response
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Hesabınız başarıyla silindi."
}
```

### Teknik Detaylar
- **Soft Delete:** Backend'de `lawyers.status → 'deleted'` yapılır; fiziksel silme gerçekleşmez
- **Tam Temizlik:** `SecureStore.deleteItemAsync('accessToken')` + `SecureStore.deleteItemAsync('user')` + `setUser(null)`
- **Navigasyon:** `user` state'i `null` olduğunda `AppNavigator` otomatik olarak `AuthStack`'e döner
- **Destructive Action:** Kırmızı renkli buton, `Alert.alert()` ile çift onay mekanizması

---

## 8. Avukatın Kendi İlanlarını Listeleme Servisi

- **API Endpoint:** `GET /api/lawyers/{lawyerId}/listings`
- **Servis Dosyası:** `src/api/lawyersApi.js` → `lawyersApi.getListings(id, status)`
- **Görev:** Giriş yapmış avukatın kendi oluşturduğu ilanları listeleme

### İşlevler
- `AuthContext`'ten `user.id` ile avukat ID'sini alma
- Opsiyonel `status` filtresi ile ilanları getirme (`active`, `passive`, `cancelled`)
- `axiosInstance` üzerinden `GET /api/lawyers/{id}/listings` isteği gönderme
- Dönen ilan listesini `FlatList` ile ekranda gösterme

### Response
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "2b3f7670-909c-4a97-b1d2-d123bb19d9ef",
        "title": "afqwef",
        "description": "afeqfgcefce",
        "city": "Adıyaman",
        "courthouse": "Besni Adliyesi",
        "hearing_date": "2026-04-09T00:00:00.000Z",
        "status": "active",
        "created_at": "2026-04-05T11:50:00.107Z",
        "updated_at": "2026-04-05T11:50:00.107Z"
      }
    ]
  }
}
```

### Teknik Detaylar
- **Filtre Parametresi:** `lawyersApi.getListings(user.id, 'active')` → `GET /api/lawyers/{id}/listings?status=active`
- **Focus Listener:** `MyListingsScreen`'de `navigation.addListener('focus')` ile her odaklanmada yenileme
- **Kullanım Yeri:** `MyListingsScreen` (ilanlarım tab'ı) ve `IncomingApplicationsScreen` (gelen başvurular sayfası)

---

## 9. Kimlik Doğrulama Altyapısı (AuthContext + axiosInstance)

- **Dosyalar:** `src/context/AuthContext.js`, `src/api/axiosInstance.js`
- **Görev:** Uygulama genelinde JWT token yönetimi, otomatik token ekleme ve oturum kontrolü

### axiosInstance Yapılandırması
- **Base URL:** `https://lawassist-backend-nu.vercel.app/api`
- **Timeout:** 15 saniye
- **Request Interceptor:** Her istekten önce `SecureStore`'dan uygun token okunup `Authorization` header'ına eklenir. Admin endpoint'lerinde (`/admin/*`) `adminToken`, diğerlerinde `accessToken` kullanılır. Auth endpoint'leri (`/auth/*`, `/admin/login`) token eklenmeden geçirilir.
- **Response Interceptor:** `401 Unauthorized` yanıtı alındığında ilgili token ve kullanıcı verisi `SecureStore`'dan silinir.

### AuthContext State Yönetimi
| Fonksiyon | İşlev |
|---|---|
| `initAuth()` | Uygulama açılışında token kontrolü, JWT decode, cache'den hızlı yükleme, API'den güncel profil alma |
| `login(lawyer, token)` | Token ve kullanıcı bilgisini `SecureStore`'a kaydetme, `user` state'ini güncelleme |
| `logout()` | Token ve kullanıcı bilgisini `SecureStore`'dan silme, `user` state'ini `null` yapma |
| `updateUser(lawyer)` | Profil güncellemesi sonrası `user` state'ini ve `SecureStore` cache'ini güncelleme |

### Token Yaşam Döngüsü
1. **Login/Register** → Token üretilir → `SecureStore`'a kaydedilir → `user` state güncellenir
2. **Her API İsteği** → Interceptor token'ı `SecureStore`'dan okur → Header'a ekler
3. **401 Hatası** → Interceptor token'ı siler → `user` state `null` olur → Login ekranına yönlendirilir
4. **Logout/Hesap Silme** → Token silinir → State temizlenir → Login ekranına yönlendirilir
5. **Uygulama Yeniden Açılma** → `initAuth()` çalışır → Token varsa ve geçerliyse otomatik giriş yapılır