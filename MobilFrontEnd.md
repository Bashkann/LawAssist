# Mobil Frontend Görev Dağılımı

---

## Grup Üyelerinin Mobil Frontend Görevleri

1. [Mustafa Enes Koçaslan'ın Mobil Frontend Görevleri](Mustafa-Enes-Kocaslan/Mustafa-Enes-Kocaslan-Mobil-Frontend-Gorevleri.md)
2. [Ahmet Kaan Başkan'ın Mobil Frontend Görevleri](Ahmet-Kaan-Baskan/Ahmet-Kaan-Baskan-Mobil-Frontend-Gorevleri.md)
3. [Ünal Şener'in Mobil Frontend Görevleri](Unal-Sener/Unal-Sener-Mobil-Frontend-Gorevleri.md)

---

## Genel Mobil Frontend Prensipleri

### 1. Tasarım Sistemi

- **Renk Paleti:** Uygulama genelinde tutarlı bir renk sistemi uygulanmıştır.
  - **Primary:** `#2563eb` (mavi) — ana aksiyonlar, aktif tab'lar, linkler ve CTA butonları
  - **Success:** `#059669` / `#16a34a` (yeşil) — onaylama butonları, aktif durum badge'leri, başarı bildirimleri
  - **Error:** `#dc2626` / `#ef4444` (kırmızı) — hata mesajları, reddetme butonları, silme aksiyonları
  - **Warning:** `#d97706` (amber) — askıya alma durumu
  - **Neutral:** `#111827` (başlık), `#374151` (gövde metin), `#6b7280` (ikincil metin), `#9ca3af` (placeholder), `#f3f4f6` (border), `#f9fafb` (arka plan)
  - Tüm renkler `constants.js` dosyasında merkezi olarak tanımlanmıştır (`LAWYER_STATUS`, `LISTING_STATUS`, `APPLICATION_STATUS` objeleri üzerinden). Her durum için `color`, `bg` ve `border` değerleri tutulur.

- **Tipografi:** Platform bazlı font ailesi kullanılmıştır.
  - Başlıklar: `fontWeight: '700'`, `fontSize: 22-24` (iOS'ta `Georgia`, Android'de `serif`)
  - Alt başlıklar: `fontWeight: '600'`, `fontSize: 15-17`
  - Gövde metin: `fontWeight: '400'`, `fontSize: 13-14`
  - Etiketler (label): `fontWeight: '500'`, `fontSize: 11-13`, üst karakter (uppercase) badge metinleri için `letterSpacing: 0.5`
  - Placeholder metinleri: `fontSize: 14`, `color: '#9ca3af'`

- **Spacing:** 4px tabanlı grid sistemi uygulanmıştır.
  - Kart padding: `16px`
  - Bileşenler arası boşluk: `gap: 8` veya `gap: 12`
  - Sayfa kenar padding'i: `paddingHorizontal: 16`
  - Bölümler arası boşluk: `marginBottom: 12-16`
  - Form elemanları arası: `marginBottom: 14-16`

- **Iconography:** `@expo/vector-icons` paketi içindeki **Ionicons** seti kullanılmıştır.
  - Navigasyon: `search-outline`, `document-text-outline`, `paper-plane-outline`, `person-outline`
  - Aksiyonlar: `create-outline` (düzenle), `trash-outline` (sil), `add` (oluştur), `people-outline` (başvurular)
  - Bilgi: `location-outline`, `business-outline`, `calendar-outline`, `chevron-down`, `chevron-forward`
  - Durum: `checkmark-circle` (onaylandı), `shield-checkmark-outline` (admin), `close` (kapat)

- **Bileşen Tasarımı:** Kartlar `borderRadius: 16`, butonlar `borderRadius: 12`, badge'ler `borderRadius: 20` ile yuvarlatılmış tasarım dili benimsenmiştir. Tüm kartlarda `borderWidth: 1`, `borderColor: '#f3f4f6'` ile hafif çerçeve kullanılmıştır.

### 2. Responsive Tasarım

- **Flex Layout:** Tüm ekranlar `flex: 1` tabanlı esnek yerleşim ile tasarlanmıştır. `flexDirection: 'row'` ile yatay, varsayılan `column` ile dikey dizilim sağlanır.
- **flexWrap:** Filtre butonları, aksiyon butonları ve meta bilgi satırlarında `flexWrap: 'wrap'` kullanılarak küçük ekranlarda otomatik satır kırılması sağlanmıştır.
- **Safe Area:** Tüm ana ekranlarda `SafeAreaView` bileşeni kullanılarak iPhone notch alanı ve status bar ile çakışma önlenmiştir.
- **KeyboardAvoidingView:** Login, Register ve form ekranlarında `KeyboardAvoidingView` ile klavye açıldığında formun görünür kalması sağlanmıştır. `behavior` prop'u platform bazlı ayarlanmıştır: iOS'ta `'padding'`, Android'de `'height'`.
- **ScrollView ve FlatList:** Uzun içerikler için `ScrollView`, liste veriler için performanslı `FlatList` bileşeni kullanılmıştır. `keyboardShouldPersistTaps="handled"` ile form içi arama alanlarında klavye yönetimi sağlanmıştır.
- **Platform Adaptasyonu:** `Platform.OS` kontrolü ile iOS ve Android'e özel davranışlar uygulanmıştır (örneğin DateTimePicker'da iOS'ta `'spinner'`, Android'de `'default'` display modu).

### 3. Kullanıcı Deneyimi (UX)

- **Loading States:** `LoadingSpinner` bileşeni tüm veri yükleme durumlarında gösterilmektedir. `ActivityIndicator` (React Native native bileşeni) ile platform native loading animasyonu sağlanır. Her ekranda `loading` state'i kontrol edilerek veri yüklenirken spinner, yüklendikten sonra içerik gösterilir.
- **Error Handling:** `ErrorMessage` bileşeni kırmızı arka plan (`#fef2f2`) ve kırmızı border (`#fecaca`) ile dikkat çekici şekilde hata mesajlarını gösterir. API hatalarında `err.response?.data?.message` ile backend'den gelen Türkçe hata mesajı gösterilir; API ulaşılamazsa genel bir hata mesajı sunulur.
- **Empty States:** Tüm liste ekranlarında `ListEmptyComponent` ile boş durumlar yönetilmiştir. Filtreleme sonucu boşsa "İlan Bulunamadı — Filtreleri değiştirerek tekrar arayabilirsiniz.", henüz veri yoksa "Henüz bir ilan oluşturmadınız." gibi bağlama özel mesajlar gösterilir.
- **Feedback:** Kritik aksiyonlarda (silme, onaylama, reddetme, hesap silme) `Alert.alert()` ile onay dialogu gösterilir. Başarılı işlemlerde (ilan oluşturma, profil güncelleme) `Alert.alert()` ile başarı bildirimi yapılır ve kullanıcı önceki ekrana yönlendirilir. Butonlarda `loading` durumunda `opacity: 0.6` ve `disabled` ile çift tıklama önlenmiştir.
- **Inline Başvuru:** İlan kartlarında başvuru formu aynı kart içinde açılıp kapanabilir, kullanıcı sayfa değiştirmeden başvuru yapabilir. Başvuru sonrası yeşil "Başvuruldu" badge'i gösterilir.

### 4. Erişilebilirlik (Accessibility)

- **Touch Target Boyutları:** Tüm dokunulabilir alanlar (butonlar, tab'lar, picker alanları) minimum `paddingVertical: 10`, `paddingHorizontal: 12` ile yeterli dokunma alanı sağlanmıştır. Tab bar yüksekliği `height: 56` ile parmak dostu boyuttadır.
- **Renk Kontrastı:** Metin renkleri arka plan renklerine göre yeterli kontrast oranı sağlayacak şekilde seçilmiştir. Başlıklar koyu (`#111827`), gövde metni orta (`#374151`), ikincil bilgiler açık (`#9ca3af`) tonlarla beyaz/açık gri arka plan üzerinde kullanılmıştır.
- **Görsel İpuçları:** Durumlar yalnızca renkle değil, metin etiketleriyle de ifade edilmiştir (örneğin "Aktif", "Beklemede", "Reddedildi" badge'leri). Devre dışı bırakılan elemanlar `opacity: 0.5` ile görsel olarak ayırt edilir.
- **Placeholder Metinleri:** Tüm form alanlarında açıklayıcı `placeholder` metinleri kullanılmıştır (örneğin "ornek@email.com", "En az 8 karakter", "Şehir seçin").
- **numberOfLines:** Uzun metinler `numberOfLines` ile kısıtlanarak düzen bozulması önlenmiştir.

### 5. Performans

- **FlatList ile Lazy Rendering:** Liste ekranlarında (İlanlar, İlanlarım, Başvurularım, Admin Avukat/İlan Listeleri) `FlatList` bileşeni kullanılarak yalnızca ekranda görünen öğeler render edilir; bu sayede uzun listelerde bellek kullanımı optimize edilmiştir.
- **State Optimizasyonu:** `useCallback` ile fonksiyon referansları korunarak gereksiz yeniden render önlenmiştir. Form state'leri fonksiyonel güncelleme (`setForm(prev => ...)`) ile yönetilir.
- **İstek Yönetimi:** `axiosInstance` üzerinde `timeout: 15000` ile uzun süren isteklerin kesilmesi sağlanmıştır. Gereksiz API çağrıları önlenmiş; örneğin gelen başvurular yalnızca "Başvurular" butonuna basıldığında yüklenir.
- **Navigation Focus Listener:** `MyListingsScreen` gibi ekranlarda `navigation.addListener('focus', fetchListings)` ile yalnızca ekrana dönüldüğünde veri yenilenir, arka planda gereksiz istek atılmaz.
- **Token Cache:** `SecureStore`'dan okunan kullanıcı verisi hem state'te hem de güvenli depoda tutularak her render'da tekrar okuma yapılmaz. Uygulama açılışında cache'den hızlı yükleme, ardından API'den güncel profil alınması sağlanır.

### 6. Navigasyon

- **Navigasyon Yapısı:** `@react-navigation/native` kütüphanesi ile üç katmanlı navigasyon mimarisi kurulmuştur:
  - **RootStack** (`AppNavigator.js`): Auth durumuna göre `AuthStack`, `LawyerTabs` veya `AdminStack` arasında koşullu geçiş yapar.
  - **AuthStack**: Login → Register → ForgotPassword → ResetPassword → AdminLogin ekranları arasında stack navigasyonu.
  - **LawyerTabs**: Alt tab bar ile 4 ana bölüm (İlanlar, İlanlarım, Başvurularım, Profil). Her tab kendi içinde stack navigator barındırır.
  - **AdminStack**: Header'lı stack navigator ile Dashboard → Avukat Yönetimi → Avukat Detay → İlan Yönetimi akışı.

- **Bottom Tab Bar:** `@react-navigation/bottom-tabs` ile dört sekmeli alt navigasyon çubuğu oluşturulmuştur. Aktif sekme `#2563eb` (mavi), pasif sekme `#9ca3af` (gri) renk ile ayırt edilir. Her sekme `Ionicons` ikonu ve Türkçe etiket içerir.

- **Nested Stack:** İlanlarım sekmesi altında `CreateListingScreen`, `ListingApplicationsScreen` ve `IncomingApplicationsScreen` sayfalarına stack navigasyon ile geçiş yapılır. `navigation.goBack()` ile geri dönüş sağlanır.

- **Auth State Yönetimi:** `AuthContext` üzerinden `user` state'i kontrol edilerek login/logout geçişleri otomatik yapılır. Admin girişinde `SecureStore`'daki `adminToken` varlığı periyodik kontrol edilerek admin paneli geçişi sağlanır. Çıkış yapıldığında token silinir ve navigasyon otomatik olarak `AuthStack`'e döner.

- **Parametre Geçişi:** Ekranlar arası veri `route.params` ile taşınır (örneğin `navigation.navigate('ListingApplications', { listingId, listingTitle })`).

### 7. Form Yönetimi

- **State Tabanlı Formlar:** Her form ekranında (`LoginScreen`, `RegisterScreen`, `CreateListingScreen`, `EditProfileScreen`, `EditListingModal`) form verileri `useState` hook'u ile yönetilir. Her alan değiştiğinde state güncellenir ve hata mesajı temizlenir.

- **Validasyon:** Client-side validasyon form gönderilmeden önce kontrol edilir:
  - Zorunlu alan kontrolü (boş bırakılamaz)
  - Şifre uzunluk kontrolü (minimum 8 karakter)
  - Şifre eşleşme kontrolü (password === confirmPassword)
  - Hata mesajları `ErrorMessage` bileşeni ile form üstünde gösterilir.
  - Backend validasyon hataları `err.response?.data?.message` ile yakalanarak aynı bileşende gösterilir.

- **Özel Picker Bileşenleri:** Şehir ve adliye seçimi için `PickerModal` bileşeni geliştirilmiştir. Modal alttan yukarı açılır (`animationType="slide"`), arama özellikli (`TextInput` ile filtreleme), kaydırmalı listeden seçim yapılır. Adliye picker'ı şehir seçimine bağımlıdır; şehir seçilmeden adliye picker'ı devre dışıdır.

- **Tarih Seçici:** `@react-native-community/datetimepicker` ile native tarih seçici kullanılmıştır. iOS'ta `spinner` modunda, Android'de `default` (takvim) modunda görünür. Seçilen tarih `YYYY-MM-DD` formatına dönüştürülerek API'ye gönderilir. İlan oluşturma, ilan düzenleme, filtre ve admin askıya alma ekranlarında kullanılır.

- **Keyboard Handling:** Login ve Register ekranlarında `KeyboardAvoidingView` ile klavye yönetimi yapılır. Tüm `ScrollView` ve `FlatList` bileşenlerinde `keyboardShouldPersistTaps="handled"` ile arama alanlarında klavye otomatik kapanması önlenir.

- **Güvenli Şifre Girişi:** `secureTextEntry` prop'u ile şifre alanları maskelenir. Login ekranında göz ikonu ile şifre göster/gizle özelliği sunulur.

### 8. Platform Özellikleri

- **Cross-Platform Framework:** React Native + Expo kullanılarak tek kod tabanından hem iOS hem Android uygulaması üretilir. `npx expo start` ile geliştirme, Expo Go uygulaması ile cihazda test yapılır.

- **Platform Spesifik Davranışlar:**
  - `Platform.OS === 'ios'` kontrolü ile iOS ve Android'e özel UI farklılıkları yönetilir.
  - `KeyboardAvoidingView` behavior: iOS'ta `'padding'`, Android'de `'height'`.
  - `DateTimePicker` display: iOS'ta `'spinner'` (döndürme çarkı), Android'de `'default'` (takvim popup).
  - Font ailesi: iOS'ta `'Georgia'` (serif), Android'de `'serif'` (platform varsayılanı).

- **Güvenli Depolama:** `expo-secure-store` ile JWT token ve kullanıcı bilgileri cihazın güvenli deposunda saklanır. iOS'ta Keychain, Android'de EncryptedSharedPreferences kullanılır. Web'deki `localStorage` yerine mobil ortama uygun güvenli alternatif sağlanmıştır.

- **Native Bileşenler:** `SafeAreaView` (notch/status bar uyumu), `ActivityIndicator` (native loading animasyonu), `Alert.alert()` (native dialog), `Modal` (native modal), `FlatList` (native performanslı liste) kullanılmıştır.

- **HTTP İstemcisi:** `axios` ile RESTful API iletişimi kurulmuştur. `axiosInstance` üzerinde request interceptor ile her isteğe otomatik JWT token eklenir, response interceptor ile 401 hatalarında token temizlenir. Base URL olarak deploy edilmiş backend (`https://lawassist-backend-nu.vercel.app/api`) kullanılır.

- **Navigasyon Kütüphaneleri:** `@react-navigation/native`, `@react-navigation/native-stack` ve `@react-navigation/bottom-tabs` ile native-feel navigasyon deneyimi sağlanmıştır. `react-native-screens` ve `react-native-safe-area-context` ile native ekran yönetimi optimize edilmiştir.