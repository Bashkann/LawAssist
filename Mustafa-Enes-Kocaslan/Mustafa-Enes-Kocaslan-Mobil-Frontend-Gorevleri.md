# Mustafa Enes Koçaslan'ın Mobil Frontend Görevleri

**Mobile Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

---

## Sorumlu Olduğu Dosyalar

| Klasör | Dosya |
|---|---|
| `src/api/` | `authApi.js`, `lawyersApi.js` |
| `src/context/` | `AuthContext.js` |
| `src/navigation/` | `AuthStack.js`, `LawyerTabs.js` |
| `src/screens/auth/` | `LoginScreen.js`, `RegisterScreen.js`, `ForgotPasswordScreen.js`, `ResetPasswordScreen.js` |
| `src/screens/lawyer/` | `ProfileScreen.js`, `EditProfileScreen.js` |

---

## 1. Giriş Yapma (Login) Ekranı

- **API Endpoint:** `POST /api/auth/login`
- **Dosya:** `src/screens/auth/LoginScreen.js`
- **Görev:** Kayıtlı avukatların email ve şifre ile sisteme giriş yapması

### UI Bileşenleri
- LawAssist logosu ve uygulama adı (üst kısımda, ortalanmış)
- Email input alanı (`keyboardType: 'email-address'`, `autoCapitalize: 'none'`)
- Şifre input alanı (`secureTextEntry`, göz ikonu ile göster/gizle toggle)
- "Şifremi Unuttum" linki (sağ hizalı, mavi renk)
- "Giriş Yap" butonu (tam genişlik, primary mavi renk)
- "Hesabınız yok mu? Kayıt Ol" linki (alt kısımda)
- Ayırıcı çizgi
- "Yönetici Girişi" butonu (outline stil, shield ikonu ile)
- Loading indicator (giriş işlemi sırasında buton metni değişir)

### Form Validasyonu
- Email ve şifre alanları boş olamaz kontrolü
- Hatalı giriş durumunda backend'den gelen mesaj gösterimi ("Email veya şifre hatalı.")
- Input değiştiğinde hata mesajının otomatik temizlenmesi
- Hesap askıya alınmışsa 403 hatası ile tarih bilgisi gösterimi

### Kullanıcı Deneyimi
- `KeyboardAvoidingView` ile klavye açıldığında form kaymasının önlenmesi (iOS: `padding`, Android: `height`)
- `ScrollView` ile küçük ekranlarda kaydırma desteği (`keyboardShouldPersistTaps="handled"`)
- `ErrorMessage` bileşeni ile kırmızı kutuda hata mesajı gösterimi
- Giriş başarılı olduğunda `AuthContext.login()` çağrılarak token `SecureStore`'a kaydedilir ve otomatik olarak `LawyerTabs`'a yönlendirilir
- Buton tıklandığında "Giriş Yapılıyor..." metni ve `opacity: 0.6` ile görsel feedback
- `disabled` prop ile çift tıklama önleme

### Teknik Detaylar
- **Platform:** React Native + Expo (cross-platform: iOS ve Android)
- **State Management:** `useState` ile form state (`email`, `password`), loading state ve error state yönetimi
- **Auth Entegrasyonu:** `useAuth()` hook'u üzerinden `login(lawyer, accessToken)` fonksiyonu çağrılır
- **Navigation:** `navigation.navigate('Register')`, `navigation.navigate('ForgotPassword')`, `navigation.navigate('AdminLogin')` ile ekranlar arası geçiş
- **Güvenlik:** Şifre alanında `secureTextEntry` ile maskeleme, `showPassword` state ile toggle

---

## 2. Üye Olma (Kayıt) Ekranı

- **API Endpoint:** `POST /api/auth/register`
- **Dosya:** `src/screens/auth/RegisterScreen.js`
- **Görev:** Yeni avukatların sisteme kayıt olması

### UI Bileşenleri
- LawAssist logosu (üst kısımda)
- "Kayıt Ol" başlığı ve "Yeni hesap oluşturun" alt başlığı
- Ad ve Soyad input alanları (yan yana, `flexDirection: 'row'`)
- Email input alanı (`keyboardType: 'email-address'`)
- Telefon input alanı (`keyboardType: 'phone-pad'`)
- Baro ve Baro Sicil No input alanları (yan yana)
- Şifre ve Şifre Tekrar input alanları (yan yana, `secureTextEntry`)
- "Kayıt Ol" butonu (tam genişlik, primary mavi)
- "Zaten hesabınız var mı? Giriş Yap" linki (alt kısımda)
- Loading indicator (kayıt sırasında buton metni değişir)

### Form Validasyonu
- Tüm alanların boş olamaz kontrolü (Ad, Soyad, Email, Şifre, Telefon, Baro, Baro Sicil No)
- Şifre minimum 8 karakter kontrolü
- Şifre ve Şifre Tekrar eşleşme kontrolü
- Backend'den gelen hata mesajları (409: "Bu email adresi zaten kullanılmaktadır.")
- Input değiştiğinde mevcut hata mesajının temizlenmesi

### Kullanıcı Deneyimi
- `KeyboardAvoidingView` ve `ScrollView` ile form erişilebilirliği
- `ErrorMessage` bileşeni ile form üstünde hata gösterimi
- Başarılı kayıt sonrası otomatik giriş yapılarak `LawyerTabs`'a yönlendirilme (ayrıca login gerekmez)
- Yan yana input alanları ile kompakt form tasarımı
- `confirmPassword` alanı API'ye gönderilmeden önce payload'dan çıkarılır

### Teknik Detaylar
- **State Management:** `useState` ile 8 alanlı form objesi (`first_name`, `last_name`, `email`, `password`, `confirmPassword`, `phone`, `bar_association`, `bar_number`)
- **API Çağrısı:** `authApi.register(payload)` → Yanıttaki `lawyer` ve `accessToken` ile `AuthContext.login()` çağrılır
- **Navigation:** `navigation.navigate('Login')` ile giriş ekranına geçiş

---

## 3. Şifremi Unuttum Ekranı

- **API Endpoint:** `POST /api/auth/forgot-password`
- **Dosya:** `src/screens/auth/ForgotPasswordScreen.js`
- **Görev:** Şifresini unutan avukatlara sıfırlama bağlantısı gönderimi

### UI Bileşenleri
- LawAssist logosu
- "Şifremi Unuttum" başlığı ve açıklama metni
- Email input alanı
- "Bağlantı Gönder" butonu
- "Giriş sayfasına dön" linki
- Başarı durumunda:
  - Yeşil mail ikonu (64x64, yuvarlatılmış kutu içinde)
  - "Email Gönderildi" başlığı
  - Bilgilendirme mesajı ("Kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderildi.")
  - "Giriş sayfasına dön" linki

### Kullanıcı Deneyimi
- Email boş olamaz validasyonu
- Güvenlik: Kullanıcı var olsa da olmasa da aynı başarı mesajı gösterilir (email enumeration önleme)
- İki aşamalı ekran: form görünümü → başarı görünümü (`sent` state ile koşullu render)
- Loading durumunda buton metni "Gönderiliyor..." olarak değişir

### Teknik Detaylar
- **API Çağrısı:** `authApi.forgotPassword(email)` → `POST /api/auth/forgot-password`
- **State Management:** `email`, `loading`, `error`, `sent` state'leri
- **Navigation:** `navigation.navigate('Login')` ile giriş ekranına dönüş

---

## 4. Yeni Şifre Belirleme Ekranı

- **API Endpoint:** `POST /api/auth/reset-password`
- **Dosya:** `src/screens/auth/ResetPasswordScreen.js`
- **Görev:** Şifre sıfırlama bağlantısı ile yeni şifre belirleme

### UI Bileşenleri
- "Yeni Şifre Belirle" başlığı ve açıklama metni
- Yeni Şifre input alanı (`secureTextEntry`)
- Şifre Tekrar input alanı (`secureTextEntry`)
- "Şifreyi Güncelle" butonu
- Geçersiz token durumunda:
  - "Geçersiz Bağlantı" başlığı
  - Açıklama metni ve "Yeni bağlantı iste" linki
- Başarı durumunda:
  - Yeşil onay ikonu
  - "Şifre Güncellendi" başlığı
  - "Giriş Yap" butonu

### Form Validasyonu
- Yeni şifre boş olamaz kontrolü
- Minimum 8 karakter kontrolü
- Şifre eşleşme kontrolü
- Token geçerlilik kontrolü (token `route.params` ile alınır)
- Backend hata mesajları ("Bağlantının süresi dolmuştur.", "Bu bağlantı daha önce kullanılmıştır.")

### Teknik Detaylar
- **Parametre:** `route.params.token` ile şifre sıfırlama token'ı alınır
- **API Çağrısı:** `authApi.resetPassword({ token, password })` → `POST /api/auth/reset-password`
- **Üç Durumlu Ekran:** Token yoksa → geçersiz bağlantı, form → şifre belirleme, başarı → onay ekranı

---

## 5. Avukat Profil Görüntüleme Ekranı

- **API Endpoint:** `GET /api/lawyers/{lawyerId}`
- **Dosya:** `src/screens/lawyer/ProfileScreen.js`
- **Görev:** Giriş yapmış avukatın profil bilgilerini görüntüleme

### UI Bileşenleri
- Mavi gradient üst bar (48px yükseklik)
- Profil avatar (64x64, initials ile, koyu mavi arka plan, beyaz border, gradient üzerine konumlandırılmış)
- Ad Soyad (büyük başlık, 18px, bold)
- Email adresi (gri renk, 13px)
- Bilgi satırları grid'i (InfoRow bileşeni ile):
  - Ad, Soyad, Email, Telefon, Baro, Sicil No, Durum, Kayıt Tarihi
  - Her satırda üst kısımda küçük gri label (11px, uppercase), altında değer (14px)
- "Profili Düzenle" butonu (tam genişlik, primary mavi, create-outline ikonu)
- "Çıkış Yap" butonu (tam genişlik, outline stil, log-out-outline ikonu)
- "Hesabı Sil" butonu (tam genişlik, kırmızı border, kırmızı metin)
- `SafeAreaView` ile güvenli alan desteği

### Kullanıcı Deneyimi
- Ekran odaklandığında (tab'a dönüldüğünde) profil verisi yenilenir (`navigation.addListener('focus')`)
- `LoadingSpinner` ile veri yüklenirken loading gösterimi
- `ErrorMessage` ile hata durumu gösterimi
- Çıkış yapma ve hesap silme işlemlerinde `Alert.alert()` ile onay dialogu
- Hesap silme sonrası `AuthContext.logout()` ile token temizlenir ve login ekranına yönlendirilir
- Çıkış yap sonrası `AuthContext.logout()` çağrılır

### Teknik Detaylar
- **API Çağrısı:** `lawyersApi.getProfile(user.id)` → `GET /api/lawyers/{id}`
- **Hesap Silme:** `lawyersApi.deleteProfile(user.id)` → `DELETE /api/lawyers/{id}`
- **State Management:** `lawyer`, `loading`, `error`, `deleting` state'leri
- **Navigation:** `navigation.navigate('EditProfile')` ile düzenleme ekranına geçiş

---

## 6. Avukat Profil Düzenleme Ekranı

- **API Endpoint:** `PUT /api/lawyers/{lawyerId}`
- **Dosya:** `src/screens/lawyer/EditProfileScreen.js`
- **Görev:** Avukatın kendi profil bilgilerini güncellemesi

### UI Bileşenleri
- Üst bar: Geri ok butonu (sol), "Profili Düzenle" başlığı (orta)
- Ad ve Soyad input alanları (yan yana, mevcut değerlerle dolu)
- Email input alanı (mevcut değerle dolu)
- Telefon input alanı (mevcut değerle dolu, `keyboardType: 'phone-pad'`)
- Baro ve Sicil No input alanları (yan yana, mevcut değerlerle dolu)
- "Kaydet" ve "İptal" butonları (yan yana, `flexDirection: 'row'`)

### Kullanıcı Deneyimi
- Ekran açıldığında mevcut profil verileri API'den çekilip form alanlarına doldurulur
- Başarılı güncelleme sonrası `AuthContext.updateUser()` ile global state güncellenir
- `Alert.alert()` ile "Profil güncellendi." başarı mesajı gösterilir
- "Tamam" butonuna basıldığında `navigation.goBack()` ile profil ekranına dönülür
- "İptal" butonu ile değişiklikler kaydedilmeden geri dönülür
- Loading durumunda "Kaydediliyor..." buton metni

### Teknik Detaylar
- **API Çağrıları:**
  - `lawyersApi.getProfile(user.id)` → Mevcut verileri form'a doldurmak için
  - `lawyersApi.updateProfile(user.id, form)` → Güncel verileri kaydetmek için
- **State Management:** `form` (6 alan), `loading`, `saving`, `error` state'leri
- **Context Güncellemesi:** `updateUser(updated)` ile `AuthContext`'teki kullanıcı bilgisi ve `SecureStore` cache'i güncellenir

---

## 7. Auth Navigasyon Yapısı

- **Dosya:** `src/navigation/AuthStack.js`
- **Görev:** Giriş yapmamış kullanıcılar için ekran akışı yönetimi

### Yapı
- `createNativeStackNavigator` ile stack navigator
- Tüm ekranlarda `headerShown: false` (özel header tasarımları kullanılıyor)
- Beyaz arka plan (`contentStyle: { backgroundColor: '#fff' }`)

### Ekranlar
| Ekran Adı | Bileşen | Açıklama |
|---|---|---|
| `Login` | `LoginScreen` | Avukat giriş ekranı |
| `Register` | `RegisterScreen` | Avukat kayıt ekranı |
| `ForgotPassword` | `ForgotPasswordScreen` | Şifre sıfırlama maili gönderme |
| `ResetPassword` | `ResetPasswordScreen` | Yeni şifre belirleme |
| `AdminLogin` | `AdminLoginScreen` | Admin giriş ekranı (Ünal'ın ekranı) |

---

## 8. Ana Tab Navigasyonu

- **Dosya:** `src/navigation/LawyerTabs.js`
- **Görev:** Giriş yapmış avukatlar için alt tab bar navigasyonu

### Yapı
- `createBottomTabNavigator` ile 4 sekmeli tab bar
- Her sekme kendi `createNativeStackNavigator` stack'ini barındırır
- Tab bar stili: beyaz arka plan, `#f3f4f6` üst border, 56px yükseklik

### Sekmeler
| Sekme | İkon | Etiket | Stack İçeriği |
|---|---|---|---|
| İlanlar | `search-outline` | İlanlar | `ListingsScreen` |
| İlanlarım | `document-text-outline` | İlanlarım | `MyListingsScreen` → `CreateListingScreen` → `ListingApplicationsScreen` → `IncomingApplicationsScreen` |
| Başvurularım | `paper-plane-outline` | Başvurularım | `MyApplicationsScreen` |
| Profil | `person-outline` | Profil | `ProfileScreen` → `EditProfileScreen` |

### Teknik Detaylar
- Aktif sekme rengi: `#2563eb` (mavi), pasif sekme rengi: `#9ca3af` (gri)
- Tab bar etiket stili: `fontSize: 11`, `fontWeight: '600'`
- `Ionicons` ikon seti kullanımı (her sekme için `size - 2`)

---

## 9. AuthContext — Kimlik Doğrulama State Yönetimi

- **Dosya:** `src/context/AuthContext.js`
- **Görev:** Uygulama genelinde kullanıcı oturum durumu yönetimi

### Sağlanan Değerler
| Değer | Tip | Açıklama |
|---|---|---|
| `user` | `object \| null` | Giriş yapmış avukat bilgisi |
| `loading` | `boolean` | Uygulama başlangıcında token kontrolü durumu |
| `login(lawyer, token)` | `function` | Token ve kullanıcı bilgisini kaydet, state güncelle |
| `logout()` | `function` | Token ve kullanıcı bilgisini sil, state temizle |
| `updateUser(lawyer)` | `function` | Profil güncellemesi sonrası state ve cache güncelle |

### Uygulama Başlangıç Akışı (`initAuth`)
1. `SecureStore`'dan `accessToken` okunur
2. Token yoksa → `loading: false`, kullanıcı login ekranına yönlendirilir
3. Token varsa → JWT payload decode edilir (`atob` ile base64 çözme)
4. `exp` süresi kontrol edilir, dolmuşsa → token silinir
5. Önce `SecureStore` cache'inden kullanıcı bilgisi yüklenir (hızlı gösterim)
6. Ardından `lawyersApi.getProfile(id)` ile güncel profil API'den alınır
7. Hata oluşursa → token silinir, kullanıcı login ekranına yönlendirilir

### Teknik Detaylar
- `expo-secure-store` ile güvenli token saklama (iOS: Keychain, Android: EncryptedSharedPreferences)
- `createContext` + `useContext` pattern'i ile global erişim
- `useAuth()` custom hook'u ile kolay kullanım
- `AuthProvider` bileşeni `App.js`'de uygulamanın kök seviyesinde sarmalanır

---

## 10. API Servis Modülleri

### authApi.js
- **Dosya:** `src/api/authApi.js`
- **Fonksiyonlar:**

| Fonksiyon | HTTP Metodu | Endpoint | Açıklama |
|---|---|---|---|
| `register(data)` | `POST` | `/auth/register` | Yeni avukat kaydı |
| `login(data)` | `POST` | `/auth/login` | Avukat girişi |
| `forgotPassword(email)` | `POST` | `/auth/forgot-password` | Şifre sıfırlama maili |
| `resetPassword(data)` | `POST` | `/auth/reset-password` | Yeni şifre belirleme |

### lawyersApi.js
- **Dosya:** `src/api/lawyersApi.js`
- **Fonksiyonlar:**

| Fonksiyon | HTTP Metodu | Endpoint | Açıklama |
|---|---|---|---|
| `getProfile(id)` | `GET` | `/lawyers/{id}` | Avukat profil bilgileri |
| `updateProfile(id, data)` | `PUT` | `/lawyers/{id}` | Profil güncelleme |
| `deleteProfile(id)` | `DELETE` | `/lawyers/{id}` | Hesap silme (soft delete) |
| `getListings(id, status)` | `GET` | `/lawyers/{id}/listings` | Avukatın ilanları |
| `getApplications(id)` | `GET` | `/lawyers/{id}/applications` | Avukatın başvuruları |