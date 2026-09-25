"use client";

import { upload } from "@vercel/blob/client";
import { CheckCircle2, Loader2, UploadCloud, X } from "lucide-react";
import { FormEvent, useState } from "react";

export default function UploadVersionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toastMode, setToastMode] = useState<"idle" | "uploading" | "success">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");
    setToastMode("uploading");
    setUploadProgress(0);

    const fileInput = event.currentTarget.elements.namedItem("file");
    const file = fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : null;
    const versionTag = String(new FormData(event.currentTarget).get("versionTag") ?? "").trim();
    const changelog = String(new FormData(event.currentTarget).get("changelog") ?? "").trim();
    const platform = String(new FormData(event.currentTarget).get("platform") ?? "android").trim() || "android";

    try {
      if (!(file instanceof File)) {
        throw new Error("File APK wajib diunggah.");
      }

      if (!versionTag) {
        throw new Error("Version tag wajib diisi.");
      }

      if (!/\.apk$/i.test(file.name)) {
        throw new Error("File harus berformat .apk.");
      }

      if (file.size > 50 * 1024 * 1024) {
        throw new Error("Ukuran file maksimal 50MB.");
      }

      const safeVersionTag = versionTag.replace(/[^a-zA-Z0-9.-]+/g, "-").toLowerCase() || "spkm-version";

      await upload(`${safeVersionTag}.apk`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: JSON.stringify({ versionTag, changelog, platform }),
        contentType: file.type || "application/vnd.android.package-archive",
        onUploadProgress: ({ percentage }) => {
          const nextProgress = Math.min(100, Math.max(0, Math.round(percentage)));
          setUploadProgress(nextProgress);
        },
      });

      setUploadProgress(100);
      setToastMode("success");
      setSuccessMessage(`Versi ${versionTag} berhasil diunggah dan dijadikan rilis terbaru.`);

      const form = event.currentTarget;
      if (form) {
        form.reset();
      }
    } catch (error) {
      setToastMode("idle");
      setUploadProgress(0);
      setErrorMessage(error instanceof Error ? error.message : "Upload gagal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {toastMode !== "idle" ? (
        <div className="fixed bottom-5 right-5 z-50 w-[290px] rounded-2xl border border-[var(--color-border)] bg-white/95 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              {toastMode === "uploading" ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {toastMode === "uploading" ? "Mengunggah APK" : "Upload selesai"}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  {toastMode === "uploading" ? "Sedang mengirim file ke storage" : "File berhasil diproses"}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Tutup notifikasi"
              onClick={() => setToastMode("idle")}
              className="rounded-full p-1 text-[var(--color-text-muted)] transition hover:bg-slate-100 hover:text-[var(--color-text)]"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-[width] duration-200 ${
                toastMode === "success" ? "bg-emerald-500" : "bg-[var(--color-primary)]"
              }`}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
            <span>{toastMode === "success" ? "Selesai" : "Progres"}</span>
            <span className="font-semibold text-[var(--color-text)]">{uploadProgress}%</span>
          </div>
        </div>
      ) : null}

      <main className="min-h-screen bg-[var(--color-bg-subtle)] px-6 py-10 text-[var(--color-text)] lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Upload admin
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[var(--color-text)]">Upload Versi Baru</h1>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <UploadCloud className="h-5 w-5" strokeWidth={2} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]" htmlFor="file">
                File APK
              </label>
              <input
                id="file"
                name="file"
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                required
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2.5 text-sm text-[var(--color-text)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-primary)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]" htmlFor="versionTag">
                Version tag
              </label>
              <input
                id="versionTag"
                name="versionTag"
                type="text"
                placeholder="contoh: v2.1.05"
                required
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]" htmlFor="platform">
                Platform
              </label>
              <select
                id="platform"
                name="platform"
                defaultValue="android"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
              >
                <option value="android">Android</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]" htmlFor="changelog">
                Changelog
              </label>
              <textarea
                id="changelog"
                name="changelog"
                rows={6}
                placeholder="Masukkan perubahan yang terasa oleh pengguna..."
                required
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
              />
            </div>

            {successMessage ? (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                <span>{successMessage}</span>
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-600">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                  Mengunggah...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" strokeWidth={2} />
                  Upload Versi Baru
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
