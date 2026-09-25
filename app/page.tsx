import Link from "next/link";
import { ArrowRight, BadgeCheck, Download, Smartphone, Sparkles } from "lucide-react";

import { prisma } from "@/lib/prisma";

async function getLandingData() {
  const app = await prisma.app.findUnique({
    where: { slug: "spkm" },
  });

  const latestVersion = app
    ? await prisma.version.findFirst({
        where: { appId: app.id, isLatest: true },
        orderBy: { releasedAt: "desc" },
      })
    : null;

  return { app, latestVersion };
}

export default async function Home() {
  const { app, latestVersion } = await getLandingData();
  const downloadHref = latestVersion ? `/api/download/${latestVersion.id}` : "#";
  const versionLabel = latestVersion?.versionTag ?? "Belum ada rilis";
  const changelogItems = latestVersion?.changelog
    ? latestVersion.changelog
        .split(/\n+/)
        .map((line) => line.replace(/^[-*\s]+/, "").trim())
        .filter(Boolean)
    : [];

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-8 lg:py-10">
        <nav className="mb-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-[0.08em] text-[var(--color-primary)]">
            SPK Mobile
          </Link>
          <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
            <Link href="#changelog" className="transition hover:text-[var(--color-primary)]">
              Changelog
            </Link>
            <Link href="#download" className="transition hover:text-[var(--color-primary)]">
              Download
            </Link>
          </div>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent-orange)]/30 bg-[var(--color-accent-orange)]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-orange)]">
              <BadgeCheck className="h-4 w-4" strokeWidth={2} />
              Aplikasi Resmi Perusahaan
            </span>

            <h1 className="mt-6 max-w-xl text-4xl font-bold tracking-[-0.04em] text-[var(--color-text)] md:text-6xl">
              <span className="block">SPK Mobile</span>
              <span className="block text-[var(--color-primary)]">Kerja Lapangan Jadi Lebih Mudah</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--color-text-muted)]">
              Tidak perlu lagi bolak-balik ke kantor. Dengan SPK Mobile, Bapak/Ibu bisa langsung cek
              dan proses Surat Perintah Kerja dari HP, di mana saja.
            </p>

            <div className="mt-8 flex flex-wrap gap-4" id="download">
              <a
                href={downloadHref}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
              >
                <Download className="h-4 w-4" strokeWidth={2} />
                Download
              </a>
              <Link
                href="/versions"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
              >
                Lihat Versi Sebelumnya
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-[var(--color-text-muted)]">
              <div className="inline-flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-[var(--color-primary)]" strokeWidth={2} />
                <span>Versi terbaru</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-1 text-[var(--color-text)]">
                {versionLabel}
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[400px]">
            <div className="absolute inset-y-6 left-10 right-10 -z-10 rounded-[1.3rem] bg-[var(--color-primary)]/8 blur-xl" />
            <div className="absolute inset-x-14 top-10 bottom-10 -z-10 rounded-[1.8rem] bg-[var(--color-accent-lime)]/10 blur-[32px]" />
            <div className="relative overflow-hidden rounded-[16px] bg-transparent">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-transparent">
                <img
                  src="/images/spkm-hero.webp"
                  alt="Tampilan aplikasi SPK Mobile"
                  className="h-full w-full object-contain drop-shadow-[0_22px_50px_rgba(31,57,140,0.14)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="changelog" className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Apa yang Baru?
              </p>
              <h3 className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                {app?.name ?? "SPKM"} terbaru
              </h3>
            </div>
            <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)]">
              {versionLabel}
            </span>
          </div>

          {changelogItems.length > 0 ? (
            <div className="mt-8 space-y-4">
              {changelogItems.map((item) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-xl border border-[var(--color-border)] bg-white p-4"
                >
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)]">
                    <Sparkles className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[var(--color-text)]">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-white p-5 text-base text-[var(--color-text-muted)]">
              Belum ada rilis tersedia. Nantinya, versi terbaru dari database akan muncul di sini.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
