import { Download, LayoutDashboard, UploadCloud } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
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
            <p className="mt-5 text-sm text-[var(--color-text-muted)]">Status</p>
            <p className="mt-2 text-xl font-semibold text-[var(--color-text)]">Dashboard aktif</p>
          </div>
        </div>
      </div>
    </main>
  );
}
