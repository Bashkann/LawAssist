# Ahmet Kaan Başkan'ın REST API Metotları

**API Test Videosu:** [Test Videosu](https://www.youtube.com/watch?v=cnu22ZdPt0Q&t=2s)

---

### 1. Tevkil İlanı Oluştur
- **Endpoint:** `POST /api/listings`
- **Authentication:** Bearer Token gerekli
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
- **Response:** `201 Created`
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

---

### 2. İlanları Şehre Göre Filtrele
- **Endpoint:** `GET /api/listings?city={city}`
- **Query Parameters:**
  - `city` (string, required) – Şehir adı
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`
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

---

### 3. İlanları Tarihe Göre Filtrele
- **Endpoint:** `GET /api/listings?date={date}`
- **Query Parameters:**
  - `date` (string, required) – Tarih (YYYY-MM-DD)
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`
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

---

### 4. İlanları Adliyeye Göre Filtrele
- **Endpoint:** `GET /api/listings?courthouse={courthouse}`
- **Query Parameters:**
  - `courthouse` (string, required) – Adliye adı
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`
```json
{
  "message": "İlanlar başarıyla getirildi",
  "data": []
}
```

---

### 5. Tevkil İlanını Güncelle
- **Endpoint:** `PUT /api/listings/{listingId}`
- **Path Parameters:**
  - `listingId` (string, required) – İlan ID'si
- **Authentication:** Bearer Token gerekli (İlan sahibi)
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
- **Response:** `200 OK`
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

---

### 6. Tevkil İlanını Sil
- **Endpoint:** `DELETE /api/listings/{listingId}`
- **Path Parameters:**
  - `listingId` (string, required) – İlan ID'si
- **Authentication:** Bearer Token gerekli (İlan sahibi)
- **Response:** `200 OK`
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

---

### 7. Kendi İlanıma Yapılan Başvuruları Listele
- **Endpoint:** `GET /api/listings/{listingId}/applications`
- **Path Parameters:**
  - `listingId` (string, required) – İlan ID'si
- **Authentication:** Bearer Token gerekli (İlan sahibi)
- **Response:** `200 OK`
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

---

### 8. Tevkil İlanına Başvur
- **Endpoint:** `POST /api/listings/{listingId}/applications`
- **Path Parameters:**
  - `listingId` (string, required) – İlan ID'si
- **Authentication:** Bearer Token gerekli
- **Request Body:**
```json
{
  "note": "Merhaba. Bu dosyaya başvurabilirim."
}
```
- **Response:** `201 Created`
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

---

### 9. Yapılan Başvuruyu İptal Et
- **Endpoint:** `DELETE /api/listings/{listingId}/applications/{applicationId}`
- **Path Parameters:**
  - `listingId` (string, required) – İlan ID'si
  - `applicationId` (string, required) – Başvuru ID'si
- **Authentication:** Bearer Token gerekli (Başvuru sahibi)
- **Response:** `200 OK`
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
