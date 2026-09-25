# Dokumentasi Proyek: App Delivery & Download Analytics Dashboard

> Dokumen ini adalah spesifikasi lengkap untuk dikerjakan bertahap (Fase 1–4). Ditulis agar bisa langsung dipakai sebagai konteks oleh coding agent.

---

## 1. Ringkasan Proyek

**Nama proyek:** App Download Dashboard
**Tujuan:** Sistem untuk mendistribusikan file aplikasi (installer/APK), melacak jumlah download, menampilkan landing page promosi + changelog + tutorial, dan menyediakan dashboard analytics privat untuk admin.

**Konteks bisnis:**
- Saat ini aplikasi di-upload ke Vercel tanpa tracking apapun.
- Masalah: tidak ada visibilitas terhadap jumlah download, versi mana yang dipakai, atau efektivitas landing page.
- Solusi: layer tracking di antara user dan file, plus dashboard privat berbasis login.

**Platform hosting:** Vercel (Next.js App Router)

---

## 2. Tech Stack

| Layer | Pilihan | Catatan |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Satu project untuk landing page + dashboard + API routes |
| Database | Vercel Postgres (atau Supabase Postgres) | Simpan data apps, versions, download events, admin users |
| File storage | Vercel Blob (file kecil-menengah) atau Cloudflare R2/S3 (file besar) | Jangan expose file langsung sebagai static asset publik |
| Auth | NextAuth.js (Credentials/Email) atau Clerk | Hanya untuk akses dashboard admin, bukan end-user publik |
| ORM | Prisma | Type-safe query ke Postgres |
| Charting | Recharts | Untuk visualisasi trend di dashboard |
| Styling | Tailwind CSS | Default cepat untuk landing + dashboard |
| Analytics tambahan (opsional) | Vercel Analytics | Traffic landing page (page views, referrer) |

---

## 3. Skema Database (Prisma-style)

```prisma
model App {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  createdAt   DateTime  @default(now())
  versions    Version[]
}

model Version {
  id          String    @id @default(cuid())
  appId       String
  app         App       @relation(fields: [appId], references: [id])
  versionTag  String    // contoh: "v2.1.04"
  changelog   String?   // markdown/text
  fileUrl     String    // lokasi file di Blob/R2
  platform    String    // "android" | "windows" | "ios" | dll
  isLatest    Boolean   @default(false)
  releasedAt  DateTime  @default(now())
  events      DownloadEvent[]
}

model DownloadEvent {
  id          String    @id @default(cuid())
  versionId   String
  version     Version   @relation(fields: [versionId], references: [id])
  ipHash      String    // IP di-hash untuk hitung unique, jangan simpan IP mentah
  userAgent   String?
  referrer    String?
  platform    String?   // hasil parsing user-agent
  createdAt   DateTime  @default(now())
}

model AdminUser {
  id          String    @id @default(cuid())
  email       String    @unique
  passwordHash String
  role        String    @default("admin")
  createdAt   DateTime  @default(now())
}

model TutorialItem {
  id          String    @id @default(cuid())
  title       String
  description String?
  mediaUrl    String    // link video/embed atau path gambar
  order       Int       @default(0)
  createdAt   DateTime  @default(now())
}
```

---

## 4. API Routes yang Dibutuhkan

| Endpoint | Method | Fungsi | Fase |
|---|---|---|---|
| `/api/download/[versionId]` | GET | Log `DownloadEvent`, lalu redirect/stream ke `fileUrl` | 1 |
| `/api/auth/[...nextauth]` | GET/POST | Login/logout admin | 2 |
| `/api/dashboard/stats` | GET | Ringkasan total download, per versi, per platform (auth required) | 2 |
| `/api/apps` | GET/POST | CRUD data aplikasi (auth required) | 2 |
| `/api/versions` | GET/POST | CRUD versi + changelog (auth required) | 3 |
| `/api/tutorials` | GET/POST | CRUD konten tutorial (auth required) | 3 |
| `/api/dashboard/funnel` | GET | Data funnel landing → klik download (auth required) | 4 |

**Prinsip penting:** file installer TIDAK PERNAH diakses lewat static public path. Semua request download wajib lewat `/api/download/[versionId]` agar tercatat sebelum file diberikan.

---

## 5. Breakdown Fase Implementasi

### Fase 1 — MVP: Landing Page + Tracking Dasar
**Goal:** Landing page hidup, download bisa dihitung.

Tugas:
- [ ] Setup project Next.js + Tailwind + deploy ke Vercel
- [ ] Setup database (Vercel Postgres) + Prisma schema (`App`, `Version`, `DownloadEvent`)
- [ ] Halaman landing statis: hero section, tombol download
- [ ] Endpoint `/api/download/[versionId]` — log event lalu redirect ke file
- [ ] Upload file installer ke Vercel Blob, simpan `fileUrl` di tabel `Version`
- [ ] Query sederhana: total download (bisa langsung dari DB, belum perlu UI dashboard)

**Acceptance criteria:** Setiap klik download tercatat di tabel `DownloadEvent` dengan timestamp dan versi yang benar.

---

### Fase 2 — Auth + Dashboard Basic
**Goal:** Ada login admin, ada halaman dashboard privat dengan angka dasar.

Tugas:
- [ ] Setup NextAuth.js dengan Credentials provider, tabel `AdminUser`
- [ ] Middleware proteksi route `/dashboard/*`
- [ ] Halaman dashboard: total download all-time, breakdown per versi, breakdown per platform
- [ ] CRUD sederhana untuk data `App` dan `Version` dari dashboard (tanpa upload UI dulu, bisa manual dulu)

**Acceptance criteria:** Admin bisa login, hanya admin yang bisa akses `/dashboard`, angka yang tampil akurat dibanding data di database.

---

### Fase 3 — Changelog CMS + Tutorial Hub
**Goal:** Landing page dinamis: update version otomatis tampil, ada halaman tutorial.

Tugas:
- [ ] Form di dashboard untuk publish versi baru + changelog (update tabel `Version`)
- [ ] Landing page menampilkan changelog terbaru otomatis dari database
- [ ] CRUD `TutorialItem` dari dashboard
- [ ] Halaman/section tutorial di landing page (embed video atau step-by-step)

**Acceptance criteria:** Admin publish versi baru dari dashboard tanpa perlu redeploy, dan langsung muncul di landing page.

---

### Fase 4 — Analytics Lanjutan
**Goal:** Insight lebih dalam untuk keputusan produk.

Tugas:
- [ ] Trend chart download (harian/mingguan/bulanan) pakai Recharts
- [ ] Funnel: visitor landing page → klik download → completed (integrasi dengan Vercel Analytics atau custom page-view tracking)
- [ ] Platform breakdown detail (parsing user-agent lebih akurat)
- [ ] Tutorial engagement metrics (views per item)
- [ ] Ekspor data (CSV) untuk laporan

**Acceptance criteria:** Dashboard bisa menjawab pertanyaan "versi mana yang paling banyak dipakai bulan ini" dan "berapa persen visitor landing page yang akhirnya download" tanpa query manual ke database.

---

## 6. Catatan Desain untuk Coding Agent

- Gunakan `versionId` sebagai referensi di endpoint download, bukan nama file langsung — supaya file bisa dipindah/di-rename tanpa broken link.
- `ipHash` wajib di-hash (misal SHA-256 + salt) sebelum disimpan, jangan simpan IP mentah.
- Skema database dari awal sudah multi-app (`appId` di tabel `Version`) supaya siap kalau ke depan ada lebih dari satu aplikasi yang didistribusikan.
- Landing page dan dashboard berada di satu Next.js project yang sama, tapi route dashboard (`/dashboard/*`) diproteksi middleware auth.
- Setiap fase harus deploy-able secara independen — jangan tunggu fase 4 baru bisa live.
