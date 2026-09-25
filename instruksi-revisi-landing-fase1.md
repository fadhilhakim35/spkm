# Instruksi Revisi Landing Page — Fase 1 (SPKM)

> Konteks: Fase 1 (download + tracking) sudah berjalan. Ini revisi UI/copy pada landing page yang sudah ada, bukan fitur baru. Backend tracking tidak berubah.

## Scope revisi ini
Hanya landing page. Tidak menyentuh: auth/dashboard admin (Fase 2), CMS changelog (dipending), halaman daftar versi sebelumnya (dibahas terpisah nanti — cukup siapkan link/route kosong dulu).

---

## 1. Hapus tampilan jumlah download
- Hilangkan elemen "Downloads: X" dari UI landing page.
- **Jangan hapus logic tracking di backend** — endpoint `/api/download/[versionId]` tetap harus log `DownloadEvent` seperti biasa. Data ini tetap dibutuhkan untuk dashboard admin di Fase 2.

## 2. Ubah hero section jadi non-teknis (target user: mandor)
Ganti konten hero section dengan:

- **Badge:** "Aplikasi Resmi Perusahaan" (ganti dari badge teknis sebelumnya)
- **Judul:**
  ```
  SPK Mobile
  Kerja Lapangan Jadi Lebih Mudah
  ```
- **Deskripsi (1-2 kalimat):**
  ```
  Tidak perlu lagi bolak-balik ke kantor. Dengan SPK Mobile, Bapak/Ibu bisa
  langsung cek dan proses Surat Perintah Kerja dari HP, di mana saja.
  ```
- **Gambar hero:** siapkan placeholder image slot untuk screenshot dashboard SPK Mobile (gambar akan di-upload manual, belum ada asetnya — pakai placeholder sementara)
- **Tombol download:** tetap dipertahankan seperti sekarang, teks jadi "Download SPK Mobile Terbaru" (hilangkan nomor versi dari label tombol)

## 3. Ubah wording section info versi
- Nomor versi (misal "v2.1.04") tetap ditampilkan, tapi kecil/sekunder — bukan fokus utama
- Hapus label platform kalau tidak esensial buat mandor (opsional, boleh tetap kalau tidak mengganggu)

## 4. Ubah wording changelog jadi non-teknis
- Changelog **tetap hardcoded di kode** untuk saat ini (belum ada admin CMS — itu dipending, jangan dikerjakan dulu)
- Judul section: "Apa yang Baru?"
- Tulis ulang isi changelog versi terbaru dengan bahasa non-teknis, fokus ke manfaat yang dirasakan user, bukan istilah dev. Contoh pola konversi:
  - "Bug fix modul absensi" → "Perbaikan agar absensi tidak lagi gagal tersimpan"
  - "Optimasi performa" → "Aplikasi sekarang lebih cepat dibuka"
  - "Refactor UI" → "Tampilan lebih rapi dan mudah dibaca"

## 5. Tambahkan tombol/link ke halaman versi sebelumnya
- Tambahkan tombol "Lihat Versi Sebelumnya" di landing page
- Route tujuan: `/versions` (atau sesuai konvensi routing project) — **untuk sekarang cukup buat route kosong/placeholder**, isi halaman ini dibahas dan dikerjakan terpisah nanti
