# KMSIT Computer · Backend Laravel (MySQL)

Referensi backend untuk frontend React di repo ini. **Database wajib MySQL** — seluruh struktur tabel sudah tersedia dalam satu file SQL siap import phpMyAdmin.

## 1. Struktur database (MySQL)

```
File : public/database/kmsit_computer.sql   (ikut ter-deploy di dist/)
Isi  : 45 tabel · InnoDB · utf8mb4 · foreign key · index · seed
Import: phpMyAdmin → tab Import → pilih file → Go
```

## 2. Setup Laravel

```bash
composer create-project laravel/laravel kmsit-api
cd kmsit-api
composer require laravel/sanctum

# env
cp ../backend/.env.example .env          # lalu isi DB_*, APP_KEY, dst.
php artisan key:generate

# routes
cp ../backend/routes-api.php routes/api.php

# install Sanctum + jalankan migrasi framework
php artisan install:api

# struktur tabel KMSIT sudah di-import via phpMyAdmin (langkah 1),
# jadi JANGAN jalankan migrate untuk tabel aplikasi — cukup:
php artisan migrate          # hanya membuat tabel Sanctum jika belum ada

php artisan serve --port=8000
```

## 3. Hubungkan React (mekanisme .env Vite)

Di **root project frontend** buat file `.env.production`:

```
VITE_API_URL=http://localhost:8000
```

Lalu `npm run build`. Frontend otomatis:

1. Mengecek `GET {VITE_API_URL}/api/health`
2. Bila Laravel + MySQL menjawab → **Mode API** (login/registrasi/install lewat Laravel, data dari MySQL)
3. Bila tidak → mode lokal tertanam (tetap berfungsi penuh, untuk demo/statis)

Status koneksi terlihat di **Dashboard Super Admin → Sistem → Database & Koneksi API**.

## 4. CORS (agar React boleh memanggil API)

`config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
'supports_credentials' => true,
```

## 5. Catatan penting

- Password selalu di-hash **bcrypt** (kolom `users.password` VARCHAR 255).
- Credential gateway (Tripay/Xendit/Stripe), Zoom, dan Google **hanya di `.env`** — tidak pernah di-hardcode; mode `sandbox` vs `production` dipisah per provider.
- Tidak ada tabel/endpoint/role **donasi atau donatur** — payment gateway eksklusif untuk pembayaran kelas berbayar.
- Installer menolak dijalankan ulang bila `installed.lock` ada (middleware `installer.open`).
