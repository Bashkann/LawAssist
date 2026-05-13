# Mobil Backend (REST API Bağlantısı) Görev Dağılımı

Bu dokümanda, mobil uygulamanın REST API ile iletişimini sağlayan backend entegrasyon görevleri listelenmektedir. Her grup üyesi, kendisine atanan API endpoint'lerinin mobil uygulamadan çağrılması ve yönetilmesinden sorumludur.

Mobil uygulama için ayrı bir backend geliştirilmemiştir. Web uygulaması için geliştirilen ve Vercel üzerinde deploy edilen mevcut REST API, mobil uygulama tarafından da aynen kullanılmaktadır. Mobil taraftaki backend entegrasyonu; `axiosInstance` yapılandırması, API servis modülleri, token yönetimi ve hata yakalama katmanlarından oluşmaktadır.

**REST API Adresi:** [https://lawassist-backend-nu.vercel.app/](https://lawassist-backend-nu.vercel.app/)

---

## Grup Üyelerinin Mobil Backend Görevleri

1. [Mustafa Enes Koçaslan'ın Mobil Backend Görevleri](Mustafa-Enes-Kocaslan/Mustafa-Enes-Kocaslan-Mobil-Backend-Gorevleri.md)
2. [Ahmet Kaan Başkan'ın Mobil Backend Görevleri](Ahmet-Kaan-Baskan/Ahmet-Kaan-Baskan-Mobil-Backend-Gorevleri.md)
3. [Ünal Şener'in Mobil Backend Görevleri](Unal-Sener/Unal-Sener-Mobil-Backend-Gorevleri.md)

---

## Genel Mobil Backend Prensipleri

### 1. HTTP Client Yapılandırması

- **Kütüphane:** `axios` HTTP istemcisi kullanılmıştır.
- **Base URL:** `https://lawassist-backend-nu.vercel.app/api` — Web uygulaması ile aynı backend'e istek atılmaktadır.
- **Timeout:** Request timeout `15000ms` (15 saniye) olarak ayarlanmıştır. Bu süre içinde yanıt alınamayan istekler otomatik olarak iptal edilir.
- **Merkezi Yapılandırma:** `src/api/axiosInstance.js` dosyasında `axios.create()` ile tek bir merkezi HTTP istemci örneği oluşturulmuştur. Tüm API servis modülleri (`authApi`, `lawyersApi`, `listingsApi`, `applicationsApi`, `adminApi`) bu örneği import ederek kullanır.
- **Headers:** Her istekte `Content-Type: application/json` varsayılan olarak gönderilir. Kimlik doğrulama gerektiren endpoint'lerde `Authorization: Bearer {token}` header'ı request interceptor tarafından otomatik olarak eklenir.

```javascript
// axiosInstance.js yapılandırması
const axiosInstance = axios.create({
  baseURL: 'https://lawassist-backend-nu.vercel.app/api',
  timeout: 15000,
});
```

### 2. Authentication Yönetimi

- **Güvenli Token Saklama:** JWT access token'ları `expo-secure-store` kütüphanesi ile cihazın güvenli deposunda saklanır. iOS'ta Keychain, Android'de EncryptedSharedPreferences altyapısı kullanılır. Web'deki `localStorage` yerine mobil ortama uygun bu güvenli alternatif tercih edilmiştir.

- **Token Anahtarları:**
  - `accessToken` — Avukat kullanıcıların JWT token'ı
  - `user` — Avukat profil bilgilerinin JSON string olarak cache'lenmiş hali
  - `adminToken` — Admin kullanıcıların JWT token'ı
  - `admin` — Admin bilgilerinin JSON string olarak cache'lenmiş hali

- **Otomatik Token Ekleme (Request Interceptor):** `axiosInstance` üzerinde tanımlanan request interceptor, her istekten önce çalışır. İsteğin URL'sine göre uygun token (`accessToken` veya `adminToken`) `SecureStore`'dan okunur ve `Authorization` header'ına eklenir. Auth endpoint'leri (`/auth/*` ve `/admin/login`) bu kontrolün dışında bırakılmıştır.

```javascript
// Request interceptor akışı
axiosInstance.interceptors.request.use(async (config) => {
  if (isAuthEndpoint(config.url)) return config; // Auth endpoint'leri atla

  if (config.url?.startsWith('/admin')) {
    const adminToken = await SecureStore.getItemAsync('adminToken');
    if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`;
  } else {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

- **401 Hatası Yönetimi (Response Interceptor):** API'den `401 Unauthorized` yanıtı alındığında response interceptor devreye girer. İlgili token ve kullanıcı verisi `SecureStore`'dan silinir. `AuthContext`'teki `user` state'i `null` olduğunda `AppNavigator` otomatik olarak `AuthStack`'e (login ekranına) yönlendirir.

- **Login/Logout Akışı:** Login başarılı olduğunda `AuthContext.login()` fonksiyonu çağrılır: token ve kullanıcı bilgisi `SecureStore`'a yazılır, `user` state'i güncellenir. Logout'ta `AuthContext.logout()` ile token ve kullanıcı bilgisi `SecureStore`'dan silinir, `user` state'i `null` yapılır.

- **Uygulama Açılışında Token Doğrulama:** `AuthContext` mount edildiğinde (`useEffect`) mevcut token kontrol edilir. Token varsa payload'dan `exp` (expiration) süresi kontrol edilir; süresi dolmuşsa token silinir. Geçerli ise cache'den hızlı yükleme yapılır, ardından API'den güncel profil bilgisi alınarak state güncellenir.

### 3. Error Handling

- **Katmanlı Hata Yönetimi:** Hatalar üç katmanda yakalanır ve yönetilir:
  1. **Interceptor Katmanı:** 401 hataları response interceptor tarafından yakalanır, token temizlenir ve kullanıcı login ekranına yönlendirilir.
  2. **Servis Katmanı:** Her API çağrısı `try/catch` bloğu içinde yapılır. Backend'den gelen hata mesajı `err.response?.data?.message` ile okunur.
  3. **UI Katmanı:** Hata mesajı `ErrorMessage` bileşeni ile ekranda gösterilir veya `Alert.alert()` ile dialog olarak sunulur.

- **Backend Hata Mesajları:** Backend tarafında `ApiError` sınıfı ile üretilen Türkçe hata mesajları (örneğin "Bu email adresi zaten kullanılmaktadır.", "Email veya şifre hatalı.") mobil uygulamada doğrudan kullanıcıya gösterilir.

- **Fallback Mesajlar:** Backend'e ulaşılamadığında veya beklenmeyen bir hata oluştuğunda genel Türkçe fallback mesajları gösterilir:

```javascript
catch (err) {
  setError(err.response?.data?.message || 'İşlem başarısız.');
}
```

- **Network Hataları:** `axios` timeout aşımı veya bağlantı hatası durumunda `catch` bloğu devreye girer. `err.response` undefined olacağı için fallback mesajı gösterilir.

- **SecureStore Hata Yönetimi:** Token okuma/yazma işlemlerinde oluşabilecek hatalar `try/catch` ile yakalanır ve sessizce geçilir, uygulama çökmesi önlenir.

### 4. API Servis Modülleri

Tüm API çağrıları, endpoint gruplarına göre ayrılmış servis modüllerinde merkezi olarak tanımlanmıştır. Her modül `axiosInstance`'ı import eder ve ilgili endpoint'leri fonksiyon olarak dışa aktarır. Ekran bileşenleri doğrudan `axios` çağrısı yapmaz; servis modüllerini kullanır.

- **`authApi.js`** — Kimlik doğrulama işlemleri
  - `register(data)` → `POST /auth/register`
  - `login(data)` → `POST /auth/login`
  - `forgotPassword(email)` → `POST /auth/forgot-password`
  - `resetPassword(data)` → `POST /auth/reset-password`

- **`lawyersApi.js`** — Avukat profil ve veri işlemleri
  - `getProfile(id)` → `GET /lawyers/{id}`
  - `updateProfile(id, data)` → `PUT /lawyers/{id}`
  - `deleteProfile(id)` → `DELETE /lawyers/{id}`
  - `getListings(id, status)` → `GET /lawyers/{id}/listings`
  - `getApplications(id)` → `GET /lawyers/{id}/applications`

- **`listingsApi.js`** — İlan işlemleri
  - `getAll(params)` → `GET /listings?city=&courthouse=&date=`
  - `create(data)` → `POST /listings`
  - `update(id, data)` → `PUT /listings/{id}`
  - `remove(id)` → `DELETE /listings/{id}`
  - `getApplications(listingId)` → `GET /listings/{listingId}/applications`
  - `apply(listingId, data)` → `POST /listings/{listingId}/applications`
  - `cancelApplication(listingId, applicationId)` → `DELETE /listings/{listingId}/applications/{applicationId}`

- **`applicationsApi.js`** — Başvuru onay/red işlemleri
  - `approve(applicationId)` → `PATCH /applications/{applicationId}/approve`
  - `reject(applicationId)` → `PATCH /applications/{applicationId}/reject`

- **`adminApi.js`** — Yönetici işlemleri
  - `login(data)` → `POST /admin/login`
  - `getLawyers(params)` → `GET /admin/lawyers`
  - `getLawyerById(id)` → `GET /admin/lawyers/{id}`
  - `updateLawyer(id, data)` → `PUT /admin/lawyers/{id}`
  - `deleteLawyer(id)` → `DELETE /admin/lawyers/{id}`
  - `suspendLawyer(id, data)` → `PATCH /admin/lawyers/{id}/suspend`
  - `getListings(params)` → `GET /admin/listings`

### 5. Loading States

- **Ekran Bazlı Loading:** Her veri çeken ekranda `loading` state'i yönetilir. API isteği başladığında `setLoading(true)`, tamamlandığında (başarılı veya başarısız) `setLoading(false)` yapılır. Loading durumunda `LoadingSpinner` bileşeni gösterilir, veri geldikten sonra asıl içerik render edilir.

- **Buton Bazlı Loading:** Form gönderme butonlarında işlem sürerken buton metni değişir (örneğin "Giriş Yap" → "Giriş Yapılıyor..."), buton `opacity: 0.6` ile soluklaşır ve `disabled` yapılarak çift tıklama önlenir.

- **Başarı Bildirimleri:** İlan oluşturma, profil güncelleme gibi başarılı işlemler sonrasında `Alert.alert()` ile başarı dialogu gösterilir ve kullanıcı önceki ekrana yönlendirilir.

- **Inline Loading:** Gelen başvurular bölümü gibi iç içe veri yüklemelerinde `LoadingSpinner` küçük boyutta (`size="small"`) ilgili alanın içinde gösterilir.

### 6. State Yönetimi ve Veri Akışı

- **AuthContext (Global State):** `React Context API` ile uygulama genelinde kullanıcı kimlik doğrulama durumu yönetilir. `AuthProvider` bileşeni uygulamanın kök seviyesinde sarmalanarak tüm ekranlardan `useAuth()` hook'u ile erişim sağlanır.

- **Lokal State:** Her ekran kendi veri state'ini (`listings`, `applications`, `lawyer` vb.) `useState` ile yönetir. API'den gelen veri doğrudan state'e yazılır.

- **Veri Yenileme Stratejileri:**
  - **Focus Listener:** `MyListingsScreen` gibi ekranlarda `navigation.addListener('focus')` ile ekrana her dönüşte veri yenilenir.
  - **Aksiyon Sonrası Yenileme:** Onaylama, reddetme, silme gibi aksiyonlar sonrasında ilgili `fetch` fonksiyonu tekrar çağrılarak liste güncellenir.
  - **Filtre Değişikliği:** Filtre veya sayfa değiştiğinde `useEffect` dependency array'i tetiklenerek veri yeniden çekilir.

- **Veri Önbellekleme:** Kullanıcı profil bilgisi `SecureStore`'da JSON olarak saklanır. Uygulama açılışında önce cache'den hızlı yükleme yapılır, ardından API'den güncel veri alınarak state güncellenir. Bu sayede kullanıcı profil bilgilerini anında görür.