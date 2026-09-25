# Design Rules — SPKM Landing Page

> Fokus saat ini: tampilan awal (tema **light** saja). Dark mode & theme switcher masuk pengembangan lanjutan, **jangan dikerjakan dulu** — tapi struktur CSS variable di bawah sudah disiapkan supaya gampang di-extend nanti.

---

## 1. Palet Warna (diambil dari logo GGF)

> Hex di bawah adalah estimasi visual dari logo, bukan brand guideline resmi. Kalau perusahaan punya brand guideline dengan hex pasti, ganti nilai ini dengan yang resmi.

| Nama | Hex (perkiraan) | Peran |
|---|---|---|
| `--color-primary` | `#1B7A3D` (hijau tua) | Warna utama — header, tombol utama, teks penting |
| `--color-primary-dark` | `#146530` | Hover state tombol utama |
| `--color-accent-orange` | `#F5A623` | Aksen — highlight, badge, ikon status |
| `--color-accent-lime` | `#8DC63F` | Aksen sekunder — dekorasi kecil, success state |
| `--color-accent-yellow` | `#C4D82E` | Aksen sekunder — dipakai sangat terbatas |
| `--color-accent-blue` | `#29ABE2` | Aksen — link, info state |
| `--color-bg` | `#FFFFFF` | Background utama |
| `--color-bg-subtle` | `#F5F7F5` | Background section alternatif (hijau sangat muda, bukan abu netral) |
| `--color-text` | `#1A1A1A` | Teks utama |
| `--color-text-muted` | `#6B7280` | Teks sekunder/caption |
| `--color-border` | `#E2E5E2` | Border/divider |

**Aturan penggunaan:**
- Hijau (`--color-primary`) dominan untuk elemen struktural: header, tombol download utama, judul penting.
- Orange/lime/yellow/blue **hanya dipakai sebagai aksen kecil** (badge, ikon, garis dekoratif) — jangan jadi warna dominan section.
- Maksimal 1 warna aksen non-hijau per section, supaya tidak ramai.
- Background tetap terang/putih dengan sentuhan hijau sangat muda (`--color-bg-subtle`) untuk section selingan, bukan abu-abu generik.

---

## 2. Larangan Desain

- ❌ **Tidak ada gradient** di background, tombol, atau card. Semua warna solid/flat.
- ❌ Tidak pakai emoji sebagai icon fungsional (contoh: 📥 untuk tombol download). Emoji hanya boleh dekoratif ringan kalau memang perlu, itu pun sebaiknya dihindari.
- ❌ Tidak ada shadow berlebihan/neumorphism. Kalau perlu shadow, pakai sangat tipis (`0 1px 2px rgba(0,0,0,0.05)`) untuk elevasi card saja.

---

## 3. Icon

- Gunakan icon library standar berbasis SVG/stroke, **bukan** karakter keyboard/emoji:
  - Rekomendasi: **Lucide Icons** (ringan, konsisten, cocok untuk stack React/Next.js — `lucide-react`)
  - Alternatif: Heroicons
- Style icon: outline/stroke (bukan filled/solid), stroke width konsisten (default 2px dari Lucide sudah pas)
- Warna icon default: `--color-primary` atau `--color-text-muted` tergantung konteks (aktif vs pasif)
- Ukuran standar: 20px (inline dengan teks), 24px (tombol/button icon), 32px+ (ikon dekoratif section)

---

## 4. Tipografi

- Font sans-serif standar, netral dan mudah dibaca (contoh: Inter, atau font default system UI kalau mau ringan tanpa load font eksternal)
- Hierarchy:
  - H1 (judul hero): bold, ukuran besar, warna `--color-text` (bukan warna-warni)
  - H2 (judul section): semi-bold
  - Body: regular, `--color-text` untuk konten utama, `--color-text-muted` untuk caption/label kecil
- Hindari teks warna hijau/orange untuk paragraf panjang — warna brand dipakai untuk aksen/CTA, bukan body text, supaya tetap mudah dibaca dan tidak melelahkan mata.

---

## 5. Komponen Dasar

**Tombol utama (contoh: Download):**
- Background: `--color-primary`, teks putih
- Hover: `--color-primary-dark`
- Border-radius: medium (8px), bukan pill/rounded penuh — kesan lebih formal/institusional sesuai kebutuhan aplikasi perusahaan
- Tidak ada gradient maupun shadow tebal

**Card/section info:**
- Background: `--color-bg` atau `--color-bg-subtle`
- Border: 1px solid `--color-border`
- Border-radius: 8-12px
- Shadow: tipis atau tanpa shadow sama sekali

**Badge (contoh: "Aplikasi Resmi Perusahaan"):**
- Background: versi tint tipis dari `--color-accent-orange` atau `--color-primary` (contoh: opacity 10-15%), teks warna solid dari warna yang sama
- Bukan gradient, bukan warna solid penuh yang terlalu mencolok

---

## 6. Struktur CSS Variable (untuk persiapan dark mode ke depan)

Definisikan warna sebagai CSS variable dari awal (bukan hardcode hex langsung di komponen), supaya nanti tinggal tambah `[data-theme="dark"]` tanpa refactor besar:

```css
:root {
  --color-primary: #1B7A3D;
  --color-primary-dark: #146530;
  --color-accent-orange: #F5A623;
  --color-accent-lime: #8DC63F;
  --color-accent-blue: #29ABE2;
  --color-bg: #FFFFFF;
  --color-bg-subtle: #F5F7F5;
  --color-text: #1A1A1A;
  --color-text-muted: #6B7280;
  --color-border: #E2E5E2;
}

/* placeholder untuk dark mode — JANGAN dikerjakan dulu, cukup siapkan strukturnya */
/*
[data-theme="dark"] {
  --color-bg: ...
  --color-text: ...
}
*/
```

Pakai variable ini di Tailwind config (`theme.extend.colors`) atau langsung sebagai CSS variable — bukan hex hardcode di tiap komponen — supaya konsisten dan siap di-extend.
