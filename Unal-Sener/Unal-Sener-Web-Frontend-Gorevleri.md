# Ünal Şener'in Web Frontend Görevleri

**Front-end Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Admin Giriş Sayfası
- **API Endpoint:** `POST /api/admin/login`
- **Görev:** Sistem yöneticisinin admin paneline giriş yapması için web sayfası tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Split-screen layout (sol: mavi gradient tanıtım paneli, sağ: beyaz giriş formu)
  - LawAssist logosu ve "Admin Paneli" rozeti
  - Email input alanı (type="email", placeholder: "Admin Mailiniz")
  - Şifre input alanı (type="password", placeholder: "Admin Şifreniz")
  - "Giriş Yap" butonu (mavi gradient, shadow efekti)
  - "Avukat Girişi" linki (alt kısımda, standart kullanıcı girişine yönlendirme)
  - Sol panelde özellik listesi (Avukat Hesap Yönetimi, İlan Denetimi, Askıya Alma ve Silme)
  - Loading state (buton üzerinde "Giriş Yapılıyor..." text)
  - Responsive tasarım (mobilde sol panel gizlenir)
- **Form Validasyonu:**
  - Email ve şifre boş bırakılamaz kontrolü
  - Hata durumunda ErrorMessage komponenti ile kırmızı uyarı mesajı
  - Client-side ve server-side validation
- **Kullanıcı Deneyimi:**
  - Başarılı giriş sonrası JWT token localStorage'a kaydedilir ("adminToken" key)
  - Admin bilgileri localStorage'a kaydedilir ("admin" key)
  - Otomatik olarak Dashboard sayfasına yönlendirme
  - Hatalı giriş durumunda kullanıcı dostu hata mesajı gösterimi
  - Grid pattern arka plan efekti ve radial gradient dekorasyon
- **Teknik Detaylar:**
  - Framework: React + Vite
  - HTTP Client: Axios (axiosInstance üzerinden)
  - Routing: React Router v6 (useNavigate)
  - Stil: Tailwind CSS
  - Token yönetimi: localStorage (adminToken / accessToken ayrımı)

## 2. Admin Dashboard Sayfası
- **API Endpoint:** `GET /api/admin/lawyers` + `GET /api/admin/listings` (istatistik verileri için)
- **Görev:** Sistem genel durumunu gösteren yönetici ana paneli tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - AdminHeader komponenti (logo, navigasyon linkleri, çıkış butonu)
  - 4 adet istatistik kartı (Toplam Avukat, Aktif Avukat, Askıdaki Avukat, Toplam İlan)
  - Her kartta emoji ikon ve renkli değer gösterimi
  - 2 adet hızlı erişim kartı (Avukat Yönetimi, İlan Yönetimi)
  - Hover efektleri (border renk değişimi, shadow artışı)
  - Loading spinner (veri yüklenirken tam ekran)
  - Responsive grid layout (mobile: 2 sütun, desktop: 4 sütun)
- **Kullanıcı Deneyimi:**
  - Sayfa açılışında paralel API çağrıları (Promise.all) ile hızlı veri yükleme
  - Token yoksa otomatik admin login sayfasına yönlendirme
  - Çıkış butonu ile localStorage temizleme ve login'e yönlendirme
  - İstatistik kartları anlık sistem durumunu yansıtır
- **Teknik Detaylar:**
  - Paralel API çağrıları: 4 adet eşzamanlı istek (lawyers total, listings total, active count, suspended count)
  - Pagination bilgisinden toplam sayı çekme (pagination.total)
  - useEffect ile component mount kontrolü
  - useNavigate ile programatik yönlendirme

## 3. Avukat Yönetimi (Listeleme) Sayfası
- **API Endpoint:** `GET /api/admin/lawyers?status={status}&page={page}&limit={limit}`
- **Görev:** Sistemdeki tüm avukat hesaplarının filtrelenebilir tablo görünümünde listelenmesi
- **UI Bileşenleri:**
  - AdminHeader komponenti
  - Başlık alanı ("Avukat Yönetimi" + toplam avukat sayısı)
  - Filtre butonları (Tümü, Aktif, Askıda, Silinmiş) — rounded-xl pill style
  - Desktop: Tablo görünümü (Ad Soyad, Email, Baro, Durum, Kayıt Tarihi, Detay linki)
  - Mobile: Kart görünümü (avatar, isim, email, durum badge, baro, tarih)
  - Durum badge'leri (Aktif: yeşil, Askıda: turuncu, Silinmiş: kırmızı)
  - Pagination (Önceki / Sonraki butonları, sayfa göstergesi)
  - Boş durum mesajı ("Avukat bulunamadı")
  - Loading spinner
- **Kullanıcı Deneyimi:**
  - Filtre değiştiğinde sayfa 1'e sıfırlanır
  - Her avukat satırı/kartı tıklanabilir — detay sayfasına yönlendirir
  - Responsive: Masaüstünde tablo, mobilde kart görünümü (hidden md:block / md:hidden)
  - Avatar'da avukatın baş harfleri gösterilir (mobil kart görünümünde)
  - Hover efektleri (satır: bg-blue-50/30, kart: border-blue-200)
- **Teknik Detaylar:**
  - Server-side pagination ve filtreleme
  - Query parametreleri: status, page, limit
  - useEffect dependency array: [filter, page]
  - Conditional rendering: desktop tablo vs mobile kart

## 4. Avukat Detay Sayfası (Görüntüle + Askıya Al + Sil)
- **API Endpoint:** `GET /api/admin/lawyers/{lawyerId}` + `PATCH /api/admin/lawyers/{lawyerId}/suspend` + `DELETE /api/admin/lawyers/{lawyerId}`
- **Görev:** Belirli bir avukatın tüm detaylarını görüntüleme ve yönetim işlemleri (askıya alma, silme)
- **UI Bileşenleri:**
  - AdminHeader komponenti
  - Profil kartı: Mavi gradient üst şerit, avatar (baş harfler), isim, durum badge, email
  - Bilgi alanları: Telefon, Baro, Sicil No, Kayıt Tarihi (4 sütunlu grid)
  - "Yönetim İşlemleri" bölümü:
    - Tarih seçici (date input) + "Askıya Al" butonu (turuncu)
    - "Hesabı Sil" butonu (kırmızı)
  - İlanları listesi (varsa): İlan başlığı, şehir, adliye, tarih, durum badge
  - Başvuruları listesi (varsa): İlan başlığı, şehir, tarih, not, durum badge
  - Durum badge'leri: Aktif/Askıda/Silinmiş (avukat), Aktif/Pasif/İptal (ilan), Beklemede/Onaylandı/Reddedildi (başvuru)
  - Loading spinner ve hata mesajı
- **Kullanıcı Deneyimi:**
  - Askıya alma: Tarih seçildikten sonra butona basılır, sayfa otomatik yenilenir
  - Silme: Browser confirm dialog ile onay istenir, silme sonrası sayfa yenilenir
  - Silinmiş hesaplarda "Yönetim İşlemleri" bölümü gizlenir
  - İlan ve başvuru yoksa ilgili bölümler gösterilmez
  - Başvuru notları italik ve tırnak içinde gösterilir
  - Hover efektleri (ilan/başvuru kartlarında bg-gray-50)
- **Teknik Detaylar:**
  - useParams ile URL'den lawyerId alınır
  - fetchLawyer fonksiyonu: avukat bilgileri + ilanlar + başvurular tek API çağrısında
  - actionLoading state: "suspend" veya "delete" — hangi butonun loading olduğunu takip eder
  - confirm() ile destructive action onayı

## 5. İlan Yönetimi Sayfası
- **API Endpoint:** `GET /api/admin/listings?status={status}&page={page}&limit={limit}`
- **Görev:** Sistemdeki tüm tevkil ilanlarının konum filtresi olmaksızın listelenmesi ve denetlenmesi
- **UI Bileşenleri:**
  - AdminHeader komponenti
  - Başlık alanı ("İlan Yönetimi" + toplam ilan sayısı)
  - Filtre butonları (Tümü, Aktif, Pasif, İptal) — rounded-xl pill style
  - İlan kartları: Başlık, durum badge, şehir (konum ikonu), adliye, tarih
  - İlan sahibi bilgisi (Ad Soyad + email)
  - İlan açıklaması (varsa, 2 satır ile sınırlı — line-clamp-2)
  - "Avukat Detay" linki (ilan sahibinin detay sayfasına yönlendirir)
  - Pagination (Önceki / Sonraki)
  - Boş durum mesajı ve loading spinner
- **Kullanıcı Deneyimi:**
  - Filtre değiştiğinde sayfa 1'e sıfırlanır
  - Her ilanda ilan sahibinin bilgileri görünür (şeffaflık ve denetim)
  - "Avukat Detay" linki ile doğrudan ilan sahibinin profil sayfasına geçiş
  - Konum ikonu (SVG) ile şehir bilgisi görsel olarak vurgulanır
  - Hover efekti (shadow artışı)
  - Responsive kart düzeni
- **Teknik Detaylar:**
  - Server-side pagination ve filtreleme
  - Query parametreleri: status, page, limit
  - owner_id üzerinden avukat detay sayfasına Link
  - LISTING_STATUS constants ile durum renklendirmesi

## 6. Tevkil Başvurusunu Onaylama (Approve)
- **API Endpoint:** `PATCH /api/applications/{applicationId}/approve`
- **Görev:** İlan sahibi avukatın gelen başvuruları onaylaması — frontend'de "Onayla" butonu ile tetiklenir
- **UI Bileşenleri:**
  - ApplicationCard komponenti içinde "Onayla" butonu (yeşil gradient)
  - Confirm dialog ("Bu başvuruyu onaylamak istediğinize emin misiniz?")
  - Loading state (buton üzerinde "...")
  - Başarı/hata alert mesajları
- **İş Kuralları:**
  - Yalnızca ilan sahibi onaylayabilir (Bearer Token kontrolü)
  - Yalnızca "pending" durumundaki başvurularda buton gösterilir
  - Onaylama sonrası ilan otomatik kapatılır (status → cancelled)
  - Aynı ilana yapılan diğer bekleyen başvurular otomatik reddedilir
  - Sayfa otomatik yenilenir (onStatusChange callback)

## 7. Tevkil Başvurusunu Reddetme (Reject)
- **API Endpoint:** `PATCH /api/applications/{applicationId}/reject`
- **Görev:** İlan sahibi avukatın uygun bulmadığı başvuruları reddetmesi — frontend'de "Reddet" butonu ile tetiklenir
- **UI Bileşenleri:**
  - ApplicationCard komponenti içinde "Reddet" butonu (kırmızı border, hover: bg-red-50)
  - Confirm dialog ("Bu başvuruyu reddetmek istediğinize emin misiniz?")
  - Loading state (buton üzerinde "...")
  - Başarı/hata alert mesajları
- **İş Kuralları:**
  - Yalnızca ilan sahibi reddedebilir (Bearer Token kontrolü)
  - Yalnızca "pending" durumundaki başvurularda buton gösterilir
  - Reddetme sonrası sayfa otomatik yenilenir (onStatusChange callback)

## Ortak Bileşenler (Shared Components)

### AdminHeader
- Tüm admin sayfalarında kullanılan navigasyon başlığı
- Logo + "Admin" rozeti + navigasyon linkleri (Dashboard, Avukatlar, İlanlar) + Çıkış butonu
- Aktif sayfa linki vurgulanır (text-blue-600 bg-blue-50)
- Mobilde hamburger menü (açılır/kapanır)
- Çıkış: localStorage temizleme + admin login'e yönlendirme

### ApplicationCard
- Başvuru kartı komponenti — başvuran avukat bilgileri, not, tarih, durum badge
- "pending" durumunda Onayla + Reddet butonları gösterilir
- Confirm dialog ile destructive action onayı
- onStatusChange callback ile parent'a bildirim

### ApplicationBadge
- Başvuru durumu rozeti (Beklemede: mavi, Onaylandı: yeşil, Reddedildi: kırmızı, İptal: gri)

### Yardımcı Dosyalar
- **constants.js:** LAWYER_STATUS, LISTING_STATUS, APPLICATION_STATUS enum tanımları ve renk kodları
- **formatDate.js:** Türkçe tarih formatlama fonksiyonları (formatDate, formatDateTime)
- **adminApi.js:** Tüm admin API çağrıları (login, getLawyers, getLawyerById, updateLawyer, deleteLawyer, suspendLawyer, getListings)
- **applicationsApi.js:** Başvuru onaylama/reddetme API çağrıları (approve, reject)