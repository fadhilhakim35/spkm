import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function VersionsPage() {
  const app = await prisma.app.findUnique({
    where: { slug: "spkm" },
  });

  const versions = app
    ? await prisma.version.findMany({
        where: { appId: app.id },
        orderBy: { releasedAt: "desc" },
      })
    : [];

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Versi sebelumnya
              </p>
              <h1 className="mt-3 text-3xl font-bold text-[var(--color-text)]">Riwayat rilis SPKM</h1>
            </div>

            <Link
              href="/"
              className="inline-flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-text-muted)]"
            >
              Kembali ke beranda
            </Link>
          </div>

          <div className="mt-8 space-y-4">
            {versions.length > 0 ? (
              versions.map((version) => (
                <div
                  key={version.id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-[var(--color-text)]">{version.versionTag}</p>
                        {version.isLatest ? (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                            Latest
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Dirilis {new Date(version.releasedAt).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <Link
                      href={`/api/download/${version.id}`}
                      className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
                    >
                      Download APK
                    </Link>
                  </div>

                  {version.changelog ? (
                    <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                        Changelog
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--color-text)]">
                        {version.changelog}
                      </p>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5 text-base text-[var(--color-text-muted)]">
                Belum ada rilis yang tersedia.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
