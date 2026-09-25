# Instruksi Implementasi — Upload Admin + Landing Page Auto-Update + Dashboard Dasar

> Scope: hanya 3 hal di bawah. **Jangan kerjakan filter tanggal (hari/minggu/bulan), halaman daftar versi sebelumnya, atau edit changelog versi lama** — itu menyusul, dibahas terpisah nanti.

## Konteks
Schema database (`App`, `Version`, `DownloadEvent`, `AdminUser`) sudah dirancang di awal project — pakai skema yang sama, jangan ubah struktur kecuali memang dibutuhkan langkah di bawah.

---

## 1. Auth Admin (kalau belum ada)
- Setup NextAuth.js dengan Credentials provider, pakai tabel `AdminUser`
- Proteksi semua route `/dashboard/*` dan `/dashboard/upload` dengan middleware — hanya admin login yang bisa akses
- Kalau auth basic sudah pernah dikerjakan sebelumnya, skip step ini, cukup pastikan route upload baru juga ikut terproteksi

## 2. Halaman & Endpoint Upload (Admin)

**Halaman:** `/dashboard/upload`

**Form input:**
- File APK (validasi ekstensi `.apk`, maksimal 50MB)
- Version tag (text, contoh `v2.1.05`) — validasi harus unik per `appId`
- Changelog (textarea, multi-baris)
- Platform (dropdown, default `android`)

**Endpoint:** `POST /api/versions`

Logic saat submit:
1. Upload file ke Vercel Blob dengan `contentDisposition` sesuai nama file yang diinginkan → dapat `fileUrl`
2. Insert row baru ke tabel `Version` (`versionTag`, `changelog`, `fileUrl`, `platform`, `appId`)
3. Update semua row `Version` lain dengan `appId` yang sama → set `isLatest: false`
4. Set row yang baru dibuat → `isLatest: true`
5. Semua langkah 2-4 dibungkus dalam satu database transaction supaya konsisten (tidak ada state di mana dua versi sama-sama `isLatest: true`)

## 3. Landing Page — Auto-Update dari Database

Ganti bagian hero section + section "Apa yang Baru" yang saat ini masih hardcode, jadi fetch dari database:

```ts
const latest = await prisma.version.findFirst({
  where: { appId: SPKM_APP_ID, isLatest: true },
  orderBy: { releasedAt: "desc" },
});
```

- Tampilkan `latest.versionTag` di section info versi
- Tampilkan `latest.changelog` di section "Apa yang Baru"
- Tombol download mengarah ke `/api/download/${latest.id}`
- Kalau `latest` null/belum ada data sama sekali, tampilkan fallback state yang wajar (misal pesan "Belum ada rilis tersedia"), jangan biarkan halaman error/blank

## 4. Dashboard — Total Download (versi minimal dulu)

**Halaman:** `/dashboard` (atau `/dashboard/stats`)

Cukup tampilkan **satu angka**: total `DownloadEvent` count untuk app ini, tanpa filter tanggal apapun dulu.

```ts
// GET /api/dashboard/stats
const total = await prisma.downloadEvent.count({
  where: { version: { appId: SPKM_APP_ID } },
});
```

Tampilkan sebagai satu card simpel: "Total Download: {total}". Struktur UI-nya boleh disiapkan supaya nanti gampang ditambah tab filter (hari/minggu/bulan/semua), tapi untuk sekarang cukup satu angka total saja — jangan bangun UI filter-nya dulu.

---

## Di luar scope (jangan dikerjakan sekarang)
- Filter dashboard berdasarkan hari/minggu/bulan/all-time
- Halaman publik "Daftar Versi Sebelumnya"
- Edit/hapus changelog versi yang sudah pernah diupload
- Grafik/chart trend download

Kalau ada bagian yang ambigu, tanyakan dulu sebelum lanjut — jangan asumsi sendiri untuk hal di luar yang dijelaskan di sini.
