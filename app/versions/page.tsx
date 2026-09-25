import Link from "next/link";

export default function VersionsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Versi sebelumnya
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[var(--color-text)]">Halaman versi sebelumnya</h1>
          <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">
            Halaman ini masih dalam tahap pengembangan. Nantinya akan menampilkan daftar versi aplikasi
            sebelumnya beserta changelog per release.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
          >
            Kembali ke halaman utama
          </Link>
        </div>
      </div>
    </main>
  );
}
