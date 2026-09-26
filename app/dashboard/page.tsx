import { Download, LayoutDashboard, LogOut, UploadCloud } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const app = await prisma.app.findUnique({
    where: { slug: "spkm" },
  });

  const totalDownloads = app
    ? await prisma.downloadEvent.count({
        where: {
          version: {
            appId: app.id,
          },
        },
      })
    : 0;

  const versions = app
    ? await prisma.version.findMany({
        where: { appId: app.id },
        orderBy: { releasedAt: "desc" },
        include: {
          _count: {
            select: { events: true },
          },
        },
      })
    : [];

  const latestVersion = versions[0] ?? null;

  const recentDownloads = app
    ? await prisma.downloadEvent.findMany({
        where: {
          version: {
            appId: app.id,
          },
        },
        include: {
          version: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      })
    : [];

  return (
    <main className="min-h-screen bg-[var(--color-bg-subtle)] px-6 py-10 text-[var(--color-text)] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Dashboard admin
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[var(--color-text)]">Ringkasan Aplikasi</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
            >
              <UploadCloud className="h-4 w-4" strokeWidth={2} />
              Upload Versi Baru
            </Link>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
                Logout
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Download className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-muted)]">
                Semua waktu
              </span>
            </div>
            <p className="mt-5 text-sm text-[var(--color-text-muted)]">Total Download</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-[var(--color-text)]">{totalDownloads}</p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)]">
                <LayoutDashboard className="h-5 w-5" strokeWidth={2} />
              </span>
            </div>
            <p className="mt-5 text-sm text-[var(--color-text-muted)]">Versi aktif</p>
            <p className="mt-2 text-xl font-semibold text-[var(--color-text)]">
              {latestVersion ? latestVersion.versionTag : "Belum ada rilis"}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <UploadCloud className="h-5 w-5" strokeWidth={2} />
              </span>
            </div>
            <p className="mt-5 text-sm text-[var(--color-text-muted)]">Versi tersimpan</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-[var(--color-text)]">{versions.length}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-[var(--color-text)]">Riwayat Rilis</h2>
              <Link href="/versions" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                Lihat semua
              </Link>
            </div>

            <div className="space-y-4">
              {versions.length > 0 ? (
                versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-[var(--color-text)]">{version.versionTag}</p>
                        {version.isLatest ? (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                            Latest
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {new Date(version.releasedAt).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[var(--color-text-muted)]">
                        {version._count.events} download
                      </span>
                      <Link
                        href={`/api/download/${version.id}`}
                        prefetch={false}
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
                      >
                        <Download className="h-3.5 w-3.5" strokeWidth={2} />
                        Download APK
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5 text-sm text-[var(--color-text-muted)]">
                  Belum ada versi yang diupload.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Download Terbaru</h2>

            <div className="mt-5 space-y-3">
              {recentDownloads.length > 0 ? (
                recentDownloads.map((event) => (
                  <div key={event.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {event.version.versionTag}
                      </p>
                      <span className="rounded-full border border-[var(--color-border)] bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
                        {event.platform ?? "unknown"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                      {new Date(event.createdAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5 text-sm text-[var(--color-text-muted)]">
                  Belum ada event download yang tercatat.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
