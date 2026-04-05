# Web Frontend Görev Dağılımı

**Web Frontend Adresi:** [https://lawassist-frontend.vercel.app/](https://lawassist-frontend.vercel.app/)

Bu dokümanda, web uygulamasının kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir.

---

## Grup Üyelerinin Web Frontend Görevleri

1. [Mustafa Enes Koçaslan'ın Web Frontend Görevleri](Mustafa-Enes-Kocaslan/Mustafa-Enes-Kocaslan-Web-Frontend-Gorevleri.md)
2. [Ahmet Kaan Başkan'ın Web Frontend Görevleri](Ahmet-Kaan-Baskan/Ahmet-Kaan-Baskan-Web-Frontend-Gorevleri.md)
3. [Ünal Şener'in Web Frontend Görevleri](Unal-Sener/Unal-Sener-Web-Frontend-Gorevleri.md)

---

## Genel Web Frontend Prensipleri
 
### 1. Responsive Tasarım
- **Mobile-First Approach:** Tasarımlar Tailwind CSS kullanılarak önce mobil, sonra tablet ve desktop (`sm`, `md`, `lg`, `xl` breakpointleri) cihazlara tam uyumlu olacak şekilde geliştirilmiştir.
- **Breakpoints:**
  - Mobile: < 640px (`sm`)
  - Tablet: 640px – 1024px (`md`, `lg`)
  - Desktop: > 1024px (`xl`, `2xl`)
- **Flexible Layouts:** Sayfa yapılarında modern CSS Flexbox ve Grid mimarisi kullanılmıştır. Kart tabanlı bileşenler, tablolar ve formlar her ekran boyutuna uyum sağlayacak şekilde tasarlanmıştır.
- **Touch-Friendly:** Mobil cihazlarda rahat kullanım için butonlar ve etkileşimli öğeler minimum 44x44px boyutunda tasarlanmıştır.
 
### 2. Tasarım Sistemi
- **CSS Framework:** Hızlı ve tutarlı stil yazımı için `Tailwind CSS v3.4` tercih edilmiştir. Özel tema genişletmeleri `tailwind.config.js` üzerinden yönetilmektedir.
- **Renk Paleti:** Kurumsal mavi tonları (`blue-600`, `indigo-500`) ana renk paleti olarak belirlenmiştir. Durum renkleri tutarlı biçimde uygulanmıştır:
  - Yeşil (`green-600`): Aktif durumlar, onaylama işlemleri
  - Kırmızı (`red-500`): Hata mesajları, reddetme ve silme işlemleri
  - Amber (`amber-700`): Askıya alma işlemleri
  - Mavi (`blue-600`): Beklemede durumlar, bilgilendirme
  - Gri (`gray-400`): İptal durumları
- **Tipografi:** Georgia serif fontu sayfa başlıklarında kullanılarak hukuki ve profesyonel bir görünüm kazandırılmıştır. Gövde metinlerinde Tailwind'in varsayılan sans-serif font ailesi kullanılmıştır.
- **Spacing:** Tailwind'in 4px tabanlı spacing sistemi (`p-4`, `gap-3`, `mb-6` vb.) tutarlı padding ve margin değerleri için kullanılmıştır.
- **Component Library:** Tekrar kullanılabilir ortak UI bileşenleri oluşturulmuştur:
  - `Navbar` — Avukat paneli navigasyonu
  - `AdminHeader` — Admin paneli navigasyonu
  - `Footer` — Sayfa alt bilgisi
  - `LoadingSpinner` — Yükleme göstergesi
  - `ErrorMessage` — Hata mesajı gösterimi
  - `ApplicationBadge` — Başvuru durum etiketi
  - `ApplicationCard` — Başvuru kartı (Onayla/Reddet butonları)
  - `ProtectedRoute` — Yetki korumalı sayfa bileşeni
 
### 3. Performans Optimizasyonu
- **Build Tool:** Hızlı geliştirme ortamı (HMR – Hot Module Replacement) ve optimize edilmiş üretim sürümü için `Vite v5.4` kullanılmıştır.
- **Minification:** Vite'ın üretim build sürecinde CSS ve JavaScript dosyaları otomatik olarak minify edilmektedir.
- **Tree Shaking:** Kullanılmayan kodların otomatik olarak çıkarılması Vite tarafından sağlanmaktadır.
- **Dev Proxy:** Geliştirme ortamında API istekleri `vite.config.js` içindeki proxy ayarı ile `localhost:5000` adresine yönlendirilmektedir.
 
### 4. Erişilebilirlik (Accessibility)
- **Semantic HTML:** HTML5 semantik etiketleri (`<main>`, `<nav>`, `<form>`, `<button>`, `<label>`) doğru biçimde kullanılmıştır.
- **Form Labels:** Tüm form alanları `<label>` etiketleri ile ilişkilendirilmiştir.
- **Focus States:** Tailwind'in `focus:` prefix'i ile görünür odak göstergeleri (`focus:border-blue-500`, `focus:ring-2`, `focus:ring-blue-100`) uygulanmıştır.
- **Color Contrast:** Metin ve arka plan renkleri arasında yeterli kontrast oranı sağlanmıştır.
- **Loading States:** Yükleme durumlarında `LoadingSpinner` bileşeni ile kullanıcıya görsel geri bildirim verilmektedir.
- **Confirm Dialogs:** Silme, onaylama ve reddetme gibi kritik işlemler öncesinde kullanıcıdan onay alınmaktadır.
 
### 5. State Management (Durum Yönetimi)
- **Global State:** Kullanıcı kimlik doğrulama durumu `React Context API` (`AuthContext`) ile merkezi olarak yönetilmektedir. JWT token `jwt-decode` kütüphanesi ile decode edilerek kullanıcı bilgileri uygulama genelinde erişilebilir hale getirilmiştir.
- **Local State:** Bileşen bazlı anlık durumlar (form verileri, yükleme göstergeleri, filtre seçimleri, modal açma/kapama, expandable bölümler) `useState` Hook'u ile kontrol edilmektedir.
- **Side Effects:** API çağrıları ve veri yükleme işlemleri `useEffect` Hook'u ile yönetilmektedir.
- **Custom Hooks:** Kod tekrarını önlemek amacıyla özel hook'lar oluşturulmuştur:
  - `useAuth` — AuthContext'ten kullanıcı bilgilerine kolay erişim
  - `useFetch` — Tekrar kullanılabilir veri çekme mantığı
- **Token Storage:** Avukat token'ı `localStorage.accessToken`, admin token'ı `localStorage.adminToken` olarak ayrı ayrı saklanmaktadır.
 
### 6. Routing ve Navigasyon
- **Client-Side Routing:** Sayfalar arası hızlı ve tam sayfa yenilemesi olmadan geçişler için `React Router DOM v6` kullanılmıştır.
- **Dynamic Routing:** İlan detayları, avukat profilleri ve başvuru sayfaları URL parametreleri (`/:id`, `/:listingId`) ile dinamik olarak oluşturulmuştur.
- **Protected Routes:** Yetkilendirme gerektiren sayfalar `ProtectedRoute` bileşeni ile korunmaktadır. Giriş yapmamış kullanıcılar login sayfasına yönlendirilmektedir.
- **Rol Bazlı Navigasyon:** Avukat ve admin kullanıcılar için ayrı navigasyon yapıları kullanılmıştır:
  - Avukat paneli: `Navbar` → İlanlar, İlanlarım, Başvurularım
  - Admin paneli: `AdminHeader` → Dashboard, Avukatlar, İlanlar
- **404 Handling:** Tanımsız URL'ler için özel yönlendirme uygulanmıştır.
 
### 7. API Entegrasyonu
- **HTTP Client:** Backend ile iletişim kurmak için `Axios` kütüphanesi yapılandırılmıştır. Merkezi `axiosInstance` üzerinden tüm API çağrıları yönetilmektedir. Base URL ortam değişkeni (`VITE_API_URL`) üzerinden belirlenmektedir.
- **Request Interceptors:** Her API isteğinde JWT token otomatik olarak `Authorization: Bearer <token>` header'ına eklenmektedir. Admin ve avukat endpoint'leri için farklı token kaynakları kullanılmaktadır.
- **Response Interceptors:** 401 (Unauthorized) yanıtlarında token temizlenerek kullanıcı otomatik olarak ilgili login sayfasına (avukat → `/login`, admin → `/admin/login`) yönlendirilmektedir.
- **Modüler API Katmanı:** Her modül için ayrı API dosyaları oluşturularak temiz ve sürdürülebilir bir mimari sağlanmıştır:
  - `authApi.js` — Kayıt, giriş, şifre sıfırlama
  - `lawyersApi.js` — Profil görüntüleme, güncelleme, silme, ilanlar, başvurular
  - `listingsApi.js` — İlan oluşturma, filtreleme, güncelleme, silme, başvuru işlemleri
  - `applicationsApi.js` — Başvuru onaylama, reddetme
  - `adminApi.js` — Admin giriş, avukat yönetimi, ilan listeleme
- **Error Handling:** API hatalarında kullanıcıya `ErrorMessage` bileşeni veya `alert()` ile anlaşılır hata mesajları gösterilmektedir.
 
### 8. Browser Compatibility
- **Modern Browsers:** Chrome, Firefox, Safari, Edge tarayıcılarının son 2 versiyonu desteklenmektedir.
- **CSS Prefixes:** Tailwind CSS ile birlikte `autoprefixer` kullanılarak tarayıcı uyumluluğu otomatik olarak sağlanmaktadır.
- **ES Modules:** Vite'ın ESM (ES Modules) tabanlı yapısı modern tarayıcılarla tam uyumlu çalışmaktadır.
 
### 9. Build ve Deployment
- **Build Tool:** `Vite v5.4` — Hızlı geliştirme sunucusu ve optimize edilmiş üretim build'i.
- **Module System:** ES Modules (`import/export`) kullanılmaktadır.
- **Environment Variables:** API adresi gibi ortam değişkenleri `.env` dosyaları üzerinden `VITE_` prefix'i ile yönetilmektedir:
  - Development: `http://localhost:5000/api`
  - Production: `https://lawassist-backend-nu.vercel.app/api`
- **CI/CD:** GitHub'a yapılan her push işleminde Vercel otomatik olarak yeni bir deployment oluşturmaktadır.
- **Hosting:** Uygulama `Vercel` platformunda barındırılmaktadır. Her branch için ayrı preview deployment'ları oluşturulmaktadır.
- **Branch Strategy:** Her grup üyesi kendi branch'ında (`unalsener`, `kaanbaskan`, `eneskocaslan`) çalışmış, main branch'a merge edilmiştir.