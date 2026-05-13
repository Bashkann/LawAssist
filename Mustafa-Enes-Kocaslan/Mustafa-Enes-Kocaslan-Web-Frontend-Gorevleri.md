# Mustafa Enes Koçaslan'ın Web Frontend Görevleri
**Front-end Test Videosu:** [Test Videosu](https://www.youtube.com/watch?v=kljmG71rYoI)

## 1. Kayıt Ol Sayfası
- **API Endpoint:** `POST /auth/register`
- **Görev:** Avukatların sisteme kayıt olması için web sayfası tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - İki sütunlu layout (sol: mavi gradient tanıtım paneli, sağ: kayıt formu)
  - Ad, Soyad, Email, Telefon, Baro, Baro Sicil No input alanları
  - Şifre ve Şifre Tekrar input alanları (`<PasswordInput />` – göster/gizle toggle)
  - "Kayıt Ol" butonu (`<SubmitButton />`)
  - "Zaten hesabınız var mı? Giriş Yap" linki → `/login`
  - Hata mesajı alanı (`<ErrorMessage />`)
- **Form Validasyonu:**
  - Tüm alanlar zorunludur
  - Şifre minimum 8 karakter olmalıdır
  - Şifre ve şifre tekrar eşleşmelidir
  - `confirmPassword` API payload'una dahil edilmez
- **Kullanıcı Deneyimi:**
  - Hata mesajları form başında gösterilir
  - Yükleme sırasında buton `"Kayıt Yapılıyor..."` olarak güncellenir
  - Başarılı kayıt sonrası otomatik giriş yapılır ve `/listings` sayfasına yönlendirilir
- **Teknik Detaylar:**
  - Framework: React + Vite
  - Routing: `useNavigate` ile `/listings`'e yönlendirme
  - Auth: `useAuth` hook'u ile `login(lawyer, accessToken)` çağrısı

## 2. Giriş Yap Sayfası
- **API Endpoint:** `POST /auth/login`
- **Görev:** Kayıtlı avukatların sisteme giriş yapması için web sayfası tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - İki sütunlu layout (sol: mavi gradient panel + üç özellik kartı, sağ: giriş formu)
  - Email ve Şifre input alanları
  - "Giriş Yap" butonu (`<SubmitButton />`)
  - "Şifremi Unuttum" linki → `/forgot-password`
  - "Yönetici Girişi" butonu → `/admin/login`
  - Hata mesajı alanı (`<ErrorMessage />`)
- **Form Validasyonu:**
  - Email ve şifre alanları zorunludur
- **Kullanıcı Deneyimi:**
  - Hata mesajları form başında gösterilir
  - Yükleme sırasında buton `"Giriş Yapılıyor..."` olarak güncellenir
  - Başarılı giriş sonrası `/listings` sayfasına yönlendirilir
- **Teknik Detaylar:**
  - Auth: `useAuth` hook'u ile `login(lawyer, accessToken)` çağrısı
  - Routing: `useNavigate` ile `/listings`'e yönlendirme

## 3. Şifremi Unuttum Sayfası
- **API Endpoint:** `POST /auth/forgot-password`
- **Görev:** Şifresini unutan kullanıcıların sıfırlama sürecini başlatması için web sayfası tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Ortalanmış kart layout
  - Email input alanı
  - "Bağlantı Gönder" butonu (`<SubmitButton />`)
  - "Giriş sayfasına dön" linki → `/login`
  - Hata mesajı alanı (`<ErrorMessage />`)
- **Form Validasyonu:**
  - Email alanı zorunludur
- **Kullanıcı Deneyimi:**
  - Başarılı istek sonrası form gizlenir, yeşil ikonlu onay ekranı gösterilir
  - Onay mesajı: "Kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderildi." (email enumeration önlemi)
- **Teknik Detaylar:**
  - `sent` state'i ile form/onay ekranı arasında geçiş yapılır

## 4. Yeni Şifre Belirleme Sayfası
- **API Endpoint:** `POST /auth/reset-password`
- **Görev:** Kullanıcının email bağlantısı üzerinden yeni şifre belirlemesi için web sayfası tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Ortalanmış kart layout
  - Yeni Şifre ve Şifre Tekrar input alanları (`<PasswordInput />`)
  - "Şifreyi Güncelle" butonu (`<SubmitButton />`)
  - Hata mesajı alanı (`<ErrorMessage />`)
- **Form Validasyonu:**
  - Şifre boş olamaz, minimum 8 karakter olmalıdır
  - Şifre ve şifre tekrar eşleşmelidir
- **Kullanıcı Deneyimi:**
  - URL'de `token` yoksa "Geçersiz Bağlantı" ekranı gösterilir, "Yeni bağlantı iste" linki → `/forgot-password`
  - Başarılı güncelleme sonrası yeşil onay ikonlu başarı ekranı ve "Giriş Yap" butonu → `/login`
- **Teknik Detaylar:**
  - `token` değeri `useSearchParams` ile URL'den alınır ve API payload'una eklenir

## 5. Avukat Profil Görüntüleme Sayfası
- **API Endpoint:** `GET /lawyers/{lawyerId}`
- **Görev:** Avukat profil bilgilerini görüntüleme sayfası tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Navbar + Footer
  - Profil kartı: üst gradient şerit, baş harflerinden oluşan avatar, iki sütunlu bilgi grid'i
  - Gösterilen alanlar: Ad, Soyad, Email, Telefon, Baro, Sicil No, Durum, Kayıt Tarihi
  - "Profili Düzenle" butonu → `/lawyers/${id}/edit`
  - "Hesabı Sil" butonu (kırmızı, tehlikeli aksiyon stili)
- **Kullanıcı Deneyimi:**
  - Yükleme sırasında `<LoadingSpinner text="Profil yükleniyor..." />`
  - Hesap silme öncesi `window.confirm` ile onay alınır
  - Silme başarılı olursa `logout()` çağrılır ve `/login` sayfasına yönlendirilir
- **Teknik Detaylar:**
  - `id` parametresi `useParams` ile alınır
  - Tarih formatlaması `formatDate` util fonksiyonu ile yapılır

## 6. Avukat Profil Düzenleme Sayfası
- **API Endpoint:** `PUT /lawyers/{lawyerId}`
- **Görev:** Avukat profil bilgilerini düzenleme sayfası tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Navbar + Footer
  - Düzenleme formu (mevcut değerlerle dolu): Ad, Soyad, Email, Telefon, Baro, Sicil No
  - "Kaydet" butonu (`<SubmitButton />`)
  - "İptal" butonu → `/lawyers/${id}`
  - Hata mesajı alanı (`<ErrorMessage />`)
- **Form Validasyonu:**
  - Tüm alanlar zorunludur
- **Kullanıcı Deneyimi:**
  - Sayfa yüklendiğinde mevcut profil bilgileri API'den çekilerek forma doldurulur
  - Başarılı güncellemede yeşil success mesajı gösterilir
  - 1.5 saniye sonra `/lawyers/${id}` sayfasına yönlendirilir
- **Teknik Detaylar:**
  - Güncelleme sonrası `updateUser(updatedLawyer)` ile context güncellenir

---

## Ortak Kısım

### İlanlarım Sayfası – Kendi İlanlarını Listeleme
- **API Endpoint:** `GET /lawyers/{lawyerId}/listings`
- **Görev:** Giriş yapmış avukatın yalnızca kendi oluşturduğu ilanların listelenmesi
- **UI Bileşenleri:**
  - Filtre sekmeleri: Tümü / Aktif / Pasif / İptal
  - İlan kartları: başlık, durum badge'i, şehir, adliye, duruşma tarihi, açıklama
- **Kullanıcı Deneyimi:**
  - Yükleme sırasında `<LoadingSpinner text="İlanlar yükleniyor..." />`
  - Boş listede "İlan Bulunamadı" ekranı gösterilir
- **Teknik Detaylar:**
  - Filtre değişikliğinde `useEffect` tetiklenerek ilanlar yeniden çekilir
  - `user.id` değeri `useAuth` hook'undan alınır; yalnızca o avukkata ait ilanlar getirilir
