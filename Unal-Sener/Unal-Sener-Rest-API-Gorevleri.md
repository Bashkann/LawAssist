# Ünal Şener'in REST API Metotları

**Back-end Domain Adresi:** [https://lawassist-backend-nu.vercel.app/api](https://lawassist-backend-nu.vercel.app/api)

**API Test Videosu:** [Youtube Video](https://youtu.be/onhXOSKdrdw)

## 1. Tevkil Başvurusunu Onayla
- **Endpoint:** `PATCH /api/applications/{applicationId}/approve`
- **Path Parameters:**
  - `applicationId` (string, required) - Başvurunun benzersiz ID'si
- **Authentication:** Bearer Token gerekli (İlan sahibi avukatın token'ı)
- **Response:** `200 OK` - Başvuru başarıyla onaylandı
- **İş Kuralları:**
  - Yalnızca ilan sahibi onaylayabilir
  - Yalnızca `pending` durumundaki başvurular onaylanabilir
  - Onaylama sonrası ilan otomatik kapatılır (`status → cancelled`)
  - Aynı ilana yapılan diğer bekleyen başvurular otomatik reddedilir

## 2. Tevkil Başvurusunu Reddet
- **Endpoint:** `PATCH /api/applications/{applicationId}/reject`
- **Path Parameters:**
  - `applicationId` (string, required) - Başvurunun benzersiz ID'si
- **Authentication:** Bearer Token gerekli (İlan sahibi avukatın token'ı)
- **Response:** `200 OK` - Başvuru başarıyla reddedildi
- **İş Kuralları:**
  - Yalnızca ilan sahibi reddedebilir
  - Yalnızca `pending` durumundaki başvurular reddedilebilir

## 3. Admin Giriş Yap
- **Endpoint:** `POST /api/admin/login`
- **Request Body:**
  ```json
  {
    "email": "admin1@lawassist.com",
    "password": "law1234"
  }
  ```
- **Response:** `200 OK` - Admin girişi başarılı, JWT token döndürüldü

## 4. Tüm Avukatları Listele
- **Endpoint:** `GET /api/admin/lawyers`
- **Query Parameters:**
  - `status` (string, optional) - `active`, `suspended`, `deleted`, `all` (varsayılan: `all`)
  - `page` (integer, optional) - Sayfa numarası (varsayılan: 1)
  - `limit` (integer, optional) - Sayfa başına kayıt (varsayılan: 20)
- **Authentication:** Bearer Token gerekli (Admin yetkisi)
- **Response:** `200 OK` - Avukat listesi başarıyla getirildi

## 5. Avukat Hesabını Görüntüle
- **Endpoint:** `GET /api/admin/lawyers/{lawyerId}`
- **Path Parameters:**
  - `lawyerId` (string, required) - Avukatın benzersiz ID'si
- **Authentication:** Bearer Token gerekli (Admin yetkisi)
- **Response:** `200 OK` - Avukat detayları başarıyla getirildi (uzmanlıklar, ilanlar ve başvurular dahil)

## 6. Avukat Hesabını Güncelle
- **Endpoint:** `PUT /api/admin/lawyers/{lawyerId}`
- **Path Parameters:**
  - `lawyerId` (string, required) - Avukatın benzersiz ID'si
- **Request Body:**
  ```json
  {
    "firstName": "AhmetGüncellendi",
    "phone": "5559998879"
  }
  ```
- **Authentication:** Bearer Token gerekli (Admin yetkisi)
- **Response:** `200 OK` - Avukat bilgileri başarıyla güncellendi

## 7. Avukat Hesabını Belli Bir Süreliğine Pasif Hale Getir
- **Endpoint:** `PATCH /api/admin/lawyers/{lawyerId}/suspend`
- **Path Parameters:**
  - `lawyerId` (string, required) - Avukatın benzersiz ID'si
- **Request Body:**
  ```json
  {
    "suspendUntil": "2026-06-01T00:00:00Z"
  }
  ```
- **Authentication:** Bearer Token gerekli (Admin yetkisi)
- **Response:** `200 OK` - Avukat hesabı başarıyla askıya alındı
- **İş Kuralları:**
  - Askı bitiş tarihi gelecekte bir tarih olmalıdır
  - Silinmiş hesaplar askıya alınamaz
  - Süre dolduğunda hesap otomatik aktif hale gelir

## 8. Konumdan Bağımsız Tüm İlanları Listele
- **Endpoint:** `GET /api/admin/listings`
- **Query Parameters:**
  - `status` (string, optional) - `active`, `passive`, `cancelled`, `all` (varsayılan: `all`)
  - `page` (integer, optional) - Sayfa numarası (varsayılan: 1)
  - `limit` (integer, optional) - Sayfa başına kayıt (varsayılan: 20)
- **Authentication:** Bearer Token gerekli (Admin yetkisi)
- **Response:** `200 OK` - Tüm ilanlar başarıyla listelendi

## 9. Avukat Hesabını Sil
- **Endpoint:** `DELETE /api/admin/lawyers/{lawyerId}`
- **Path Parameters:**
  - `lawyerId` (string, required) - Avukatın benzersiz ID'si
- **Authentication:** Bearer Token gerekli (Admin yetkisi)
- **Response:** `200 OK` - Avukat hesabı başarıyla silindi
- **İş Kuralları:**
  - Soft delete uygulanır (`status → deleted`), fiziksel silme yapılmaz
  - Zaten silinmiş hesaplar tekrar silinemez