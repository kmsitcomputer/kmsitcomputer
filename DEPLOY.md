# KMSIT Computer — Panduan Deploy Produksi

Website ini adalah aplikasi statis hasil build React + Vite + Tailwind CSS 4.
**Tidak butuh Node.js, PHP runtime, atau konfigurasi database di server** —
semua berjalan di browser pengunjung dan data tersimpan melalui lapisan
persistence aplikasi. Upload sekali, langsung jalan.

## Langkah deploy (3 langkah)

### 1. Build di komputer development
```bash
npm install
npm run build
```
Hasil build ada di folder `dist/`.

### 2. Unggah ke web server
Upload **seluruh isi** folder `dist/` (bukan foldernya) ke:

| Hosting            | Tujuan                          |
|--------------------|---------------------------------|
| cPanel / shared    | `public_html/`                  |
| VPS Apache         | `/var/www/html/`                |
| VPS Nginx          | `/var/www/kmsit` (lihat `dist/nginx.conf`) |
| Netlify            | publish directory = `dist`      |
| Vercel             | output = `dist`                 |

File penting yang sudah ikut di `dist/`:
- `.htaccess` — rewrite SPA + header keamanan + gzip + cache (Apache)
- `nginx.conf` — contoh konfigurasi VPS
- `_redirects` — Netlify
- `robots.txt` & `sitemap.xml` — SEO (ganti `domainanda.com` dulu)
- `manifest.webmanifest` + `icon.svg` — PWA & favicon

### 3. Buka domain → install sekali
1. Buka `https://domainanda.com/`
2. Installer otomatis berjalan: cek sistem → konfigurasi MySQL → migrasi →
   seeder → **buat akun Super Admin** → konfigurasi website.
3. Installer terkunci (`installed.lock`) — tidak bisa di-install ulang.
4. Login sebagai Super Admin, lalu kelola website dari dashboard.

## Catatan penting
- Routing memakai **hash** (`/#/courses`) → semua halaman bekerja di hosting
  mana pun **tanpa konfigurasi rewrite**. `.htaccess` tetap disertakan untuk
  keamanan & cache.
- Unggah ke **root domain**. Aset build menggunakan path absolut dari root.
- Ganti `domainanda.com` di `sitemap.xml` dan `robots.txt`.
- Identitas website (nama, logo, favicon, warna, alamat + titik Google Maps)
  diubah dari **Dashboard Super Admin → Pengaturan → Website**.
- Untuk reset total: Dashboard → Sistem → Danger Zone → Reset Instalasi.
