# Mustafa Enes Koçaslan'ın REST API Metotları
**API Test Videosu:** [Test Videosu](https://www.youtube.com/watch?v=ONpTAAXhZ2Y)

## 1. Kullanıcı Kayıt Ol
- **Endpoint:** `POST /auth/register`
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
- **Response:** `201 Created`
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

---

## 2. Kullanıcı Giriş Yap
- **Endpoint:** `POST /auth/login`
- **Request Body:**
  ```json
  {
    "email": "deneme1234@email.com",
    "password": "12345678"
  }
  ```
- **Response:** `200 OK`
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

---

## 3. Şifremi Unuttum – Şifre Sıfırlama Maili Gönder
- **Endpoint:** `POST /auth/forgot-password`
- **Request Body:**
  ```json
  {
    "email": "deneme1234@email.com"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "Kayıtlı bir hesap varsa şifre sıfırlama maili gönderildi."
  }
  ```

---

## 4. Yeni Şifre Belirleme
- **Endpoint:** `POST /auth/reset-password`
- **Request Body:**
  ```json
  {
    "token": "53d52a9f4bb1d59e70b757255ab5ad06cf5b0c7d8726134a7010886da047a092",
    "password": "yenisifre123"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz."
  }
  ```

---

## 5. Avukat Profil Bilgilerini Görüntüle
- **Endpoint:** `GET /lawyers/{lawyerId}`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`
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

---

## 6. Avukat Profil Bilgilerini Güncelle
- **Endpoint:** `PUT /lawyers/{lawyerId}`
- **Authentication:** Bearer Token gerekli
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
- **Response:** `200 OK`
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

---

## 7. Avukat Hesabını Sil
- **Endpoint:** `DELETE /lawyers/{lawyerId}`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "Hesabınız başarıyla silindi."
  }
  ```

---

## 8. Avukatın Kendi Açtığı İlanları Listele
- **Endpoint:** `GET /lawyers/{lawyerId}/listings`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`
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
