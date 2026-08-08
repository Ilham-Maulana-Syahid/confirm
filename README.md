# 🎯 Pelacak Penipu — Halaman Konfirmasi Pembayaran

Halaman statis mirip konfirmasi pembayaran bank yang menampilkan data transaksi sesuai `id` di URL.
Saat tombol **Konfirmasi** diklik, browser meminta izin lokasi dan **data lokasi dikirim ke email Anda** lewat [Web3Forms](https://web3forms.com) — tanpa perlu server sendiri, sehingga bisa di-deploy gratis ke **GitHub Pages**.

> ⚠️ **Gunakan hanya untuk melacak penipu yang Anda kenal.** Halaman ini meniru tampilan bank sungguhan (Maybank). Jangan pernah mengirim link ini ke orang yang tidak Anda kenal — memancing orang tak bersalah bisa berakibat hukum. Data lokasi bersifat sensitif, jaga email & link Anda.

---

## 🚀 Cara menjalankan di lokal

```bash
node server.js
# buka http://localhost:3000/?id=562312345678
```

## 🌐 Cara deploy ke GitHub Pages

1. Buat repo baru di GitHub (boleh **Private** atau **Public**).
2. Push semua file project ini ke repo tersebut.
3. Di GitHub: **Settings → Pages → Source: Deploy from a branch → pilih `main` → folder `/ (root)` → Save**.
4. Tunggu ±1 menit, situs Anda tayang di:
   `https://USERNAME.github.io/NAMA-REPO/`
5. Buka link transaksi:
   `https://USERNAME.github.io/NAMA-REPO/?id=562312345678`
   (URL root otomatis diarahkan ke `konfirmasi.html` lewat `index.html`)

> Di **Netlify**: hubungkan repo yang sama (**Netlify → Add new site → Import an existing project → GitHub**),
> biarkan build command kosong (situs statis) — deploy otomatis setiap kali Anda `git push`.

Semua link di halaman sudah **relatif**, jadi tidak perlu ubah apa pun soal path.

## 🔑 Siapkan Access Key (Web3Forms)

1. Buka **https://web3forms.com** → isi email Anda → klik link verifikasi yang dikirim ke inbox.
2. Salin **Access Key** yang diberikan (formatnya seperti `1a2b3c4d-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
3. Buka `konfirmasi.html`, ganti:
   ```js
   const WEB3FORMS_KEY = 'YOUR_ACCESS_KEY_HERE';
   ```
   dengan Access Key Anda, lalu push lagi.
4. Klik **Konfirmasi** pada salah satu link transaksi (izin lokasi akan diminta) — cek inbox & dashboard web3forms.com.

> Access Key **bukan rahasia** — aman berada di kode halaman (berfungsi sebagai alias ke email Anda). Setiap kiriman masuk ke email ANDA **dan** tersimpan di dashboard privat selama 30 hari.

**Batas gratis:** 250 kiriman/bulan, penyimpanan data 30 hari.

## 🔗 Membuat link untuk transaksi baru

Edit `config.js` — tambahkan satu baris data, misal:

```js
{ id: '562312345678', nama: 'Budi Santoso', rekening: '5623 1234 5678', nominal: 'Rp 1.500.000' },
```

Lalu link-nya: `https://USERNAME.github.io/NAMA-REPO/?id=562312345678`
(`id` = nomor rekening tanpa spasi, **wajib unik**).

## 📁 Struktur file

| File | Fungsi |
|---|---|
| `index.html` | Pengalih root — URL `https://situs/?id=...` diarahkan ke `konfirmasi.html` |
| `konfirmasi.html` | Halaman utama — tampilkan data & minta lokasi |
| `sukses.html` | Halaman setelah izin lokasi diberikan |
| `tolak.html` | Halaman saat izin lokasi ditolak |
| `config.js` | Daftar data transaksi bawaan (id/nama/rekening/nominal) |
| `data.js` | Pemuat data: pakai hasil edit localStorage jika ada, kalau tidak pakai `config.js` |
| `admin.html` | **Dashboard admin** — kelola data lewat UI (lihat bagian di bawah) |
| `server.js` | Server lokal opsional (untuk tes di laptop; **tidak dipakai** di GitHub Pages/Netlify) |
| `test_uji.sh` | Script tes otomatis endpoint (jalankan: `bash test_uji.sh`) |

## 🛠️ Dashboard admin (`admin.html`)

Buka `https://SITUS-ANDA/admin.html` lalu masukkan passphrase (default: `admin123` — ganti di `admin.html`).

Di dashboard ini Anda bisa:
- **Tambah / ubah / hapus** transaksi lewat form & tabel.
- **Salin link** lengkap untuk setiap id (isi dulu kolom “Domain situs Anda”).
- **Salin / unduh `config.js`** berisi data terbaru — tempel ke file `config.js` lalu `git push`, Netlify/GitHub Pages auto-deploy.

> ⚠️ **Data yang diedit di dashboard tersimpan di localStorage browser tersebut saja** (untuk pratinjau cepat).
> Agar **semua orang** melihat data baru, gunakan tombol **“Salin config.js”** → tempel ke `config.js` → push.
> Tombol “Kembali ke data bawaan” menghapus edit lokal dan memakai `config.js` lagi.

## 🧭 Catatan

- **Geolocation butuh HTTPS.** GitHub Pages sudah HTTPS, jadi aman. Untuk tes lokal, gunakan `localhost` (dianggap aman oleh browser).
- Jangan pernah push `data_bank.txt` (sudah di-`.gitignore`). Jika file itu **pernah ter-commit** sebelum `.gitignore` dibuat, hapus dari tracking dengan: `git rm --cached data_bank.txt`.
