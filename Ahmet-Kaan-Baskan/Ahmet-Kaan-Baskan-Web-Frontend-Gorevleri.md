# Kaan Başkan'ın Web Frontend Görevleri
**Front-end Test Videosu:** [Test Videosu](https://www.youtube.com/watch?v=5F1Yx8Qmo-o)

## 1. Tevkil İlanı Oluştur Sayfası
- **API Endpoint:** `POST /listings`
- **Görev:** Avukatların yetki devri (tevkil) için yeni bir ilan oluşturmasını sağlayan sayfanın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Tek sütunlu, ortalanmış form kartı layout'u
  - Şehir, Adliye, Duruşma/İşlem Tarihi, Saat input ve dropdown alanları
  - İşin Niteliği (Hukuk, Ceza, İcra vb.) ve Açıklama (textarea) alanları
  - Ücret belirleme alanı (`<CurrencyInput />`)
  - "İlanı Oluştur" butonu (`<SubmitButton />`)
  - Hata mesajı alanı (`<ErrorMessage />`)
- **Form Validasyonu:**
  - Şehir, Adliye, Tarih ve Açıklama alanları zorunludur
  - Seçilen tarih geçmiş bir tarih olamaz
- **Kullanıcı Deneyimi:**
  - Yükleme sırasında buton "Oluşturuluyor..." olarak güncellenir
  - Başarılı oluşturma sonrası yeşil bir toast mesajı çıkar ve `/listings/my-listings` sayfasına yönlendirilir
- **Teknik Detaylar:**
  - İlanı oluşturan kullanıcının ID'si `useAuth` hook'u ile alınarak payload'a eklenir

## 2. İlan Panosu ve Filtreleme Sayfası
- **API Endpoint:** `GET /listings?city={cityId}&date={date}&courthouse={courthouseId}`
- **Görev:** Sistemdeki aktif tevkil ilanlarının listelenmesi ve Şehir, Tarih, Adliye bazlı filtrelenmesi
- **UI Bileşenleri:**
  - Sol/Üst kısımda filtreleme modülü: Şehir seçici (Select), Adliye seçici (Select - Şehre bağlı çalışır), Tarih seçici (DatePicker)
  - "Filtrele" ve "Filtreleri Temizle" butonları
  - Sağ/Alt kısımda grid yapısında ilan kartları (`<ListingCard />`)
  - İlan kartında: Şehir, Adliye, Tarih, Ücret ve "Detayı Gör / Başvur" butonu
- **Kullanıcı Deneyimi:**
  - Filtreler değiştikçe (veya butona basıldığında) listeleme alanında `<LoadingSpinner />` gösterilir
  - Seçili filtreye uygun ilan yoksa "Bu kriterlere uygun ilan bulunamadı" ekranı (empty state) gösterilir
- **Teknik Detaylar:**
  - Filtre state'leri URL query parametrelerine (`useSearchParams`) senkronize edilir, böylece filtrelenmiş sayfanın linki paylaşılabilir

## 3. Tevkil İlanı Güncelleme Sayfası
- **API Endpoint:** `PUT /listings/{listingId}`
- **Görev:** Kullanıcının kendi oluşturduğu ilanın detaylarını (tarih, açıklama, ücret vb.) düzenlemesi
- **UI Bileşenleri:**
  - Oluşturma formu ile aynı UI bileşenleri, ancak API'den gelen mevcut verilerle dolu şekilde
  - "Değişiklikleri Kaydet" butonu (`<SubmitButton />`)
  - "İptal" butonu → Geri yönlendirme yapar
- **Form Validasyonu:**
  - Tüm temel alanlar zorunludur, tarih geçmiş olamaz
- **Kullanıcı Deneyimi:**
  - Sayfa açıldığında mevcut ilan bilgileri forma doldurulur
  - Güncelleme başarılı olduğunda "İlan güncellendi" bildirimi gösterilir
- **Teknik Detaylar:**
  - `listingId` parametresi `useParams` ile alınır

## 4. İlan Durum Yönetimi (Yayından Kaldır / Sil)
- **API Endpoint:** `PATCH /listings/{listingId}/status` veya `DELETE /listings/{listingId}`
- **Görev:** Kullanıcının kendi ilanını aktiften pasife alması veya tamamen silmesi
- **UI Bileşenleri:**
  - İlan detay sayfasında veya "İlanlarım" kartı üzerinde aksiyon menüsü
  - "Yayından Kaldır" butonu (Sarı/Turuncu uyarı stili)
  - "İlanı Sil" butonu (Kırmızı tehlikeli aksiyon stili)
- **Kullanıcı Deneyimi:**
  - Her iki işlemden önce `Modal` veya `window.confirm` ile kullanıcıdan emin misiniz onayı istenir
  - Başarılı silme sonrası liste otomatik olarak ekrandan kaybolur (optimistic UI update)
- **Teknik Detaylar:**
  - Silme işleminden sonra context veya cache (örn. React Query) güncellenerek tablonun/listenin yeniden render edilmesi sağlanır

## 5. İlan Başvurularını Görüntüleme Sayfası
- **API Endpoint:** `GET /listings/{listingId}/applications`
- **Görev:** İlan sahibinin, ilana başvuran diğer avukatları listelemesi ve incelemesi
- **UI Bileşenleri:**
  - İlan özetini gösteren üst banner
  - Başvuran avukatların listesi (`<ApplicantCard />` veya `<Table />`)
  - Başvuranın Adı, Soyadı, Barosu, Profili İncele butonu ve iletişim bilgileri
- **Kullanıcı Deneyimi:**
  - Henüz başvuru yoksa "Henüz başvuru yapılmamış" şeklinde bilgilendirme mesajı
  - Yükleme sırasında iskelet ekran (Skeleton loader) gösterimi
- **Teknik Detaylar:**
  - Sadece ilanı oluşturan kişinin bu sayfayı görebilmesi için route seviyesinde (Authorization) kontrol yapılır

## 6. İlana Başvurma ve Başvuru İptali İşlemleri
- **API Endpoints:** - Başvur: `POST /listings/{listingId}/apply`
  - İptal Et: `DELETE /applications/{applicationId}`
- **Görev:** Avukatın uygun gördüğü bir ilana görev almak için başvurması ve gerektiğinde başvuruyu geri çekmesi
- **UI Bileşenleri:**
  - Başka bir kullanıcıya ait ilan detay sayfasında "İlana Başvur" butonu
  - Başvuru yapıldıysa aynı alanın "Başvuruyu İptal Et" butonuna dönüşmesi
- **Kullanıcı Deneyimi:**
  - İlana başvurulduğunda buton durumu anında değişir ve "Başvurunuz İletildi" toast mesajı çıkar
  - Başvuruyu iptal ederken hızlı bir onay (tooltip veya popconfirm) istenir
  - Kişi kendi ilanına başvuramaz (buton gizlenir veya disabled olur)
- **Teknik Detaylar:**
  - Mevcut kullanıcının başvuru durumu (hasApplied) API'den dönen veriye veya lokal state'e göre hesaplanıp butonun conditional (şartlı) render edilmesi sağlanır