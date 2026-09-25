import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getRequiredEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const APP_SLUG = "spkm";

async function uploadFileToStorage(file: File, versionTag: string) {
  const safeName = `${versionTag.replace(/[^a-zA-Z0-9.-]+/g, "-").toLowerCase() || "spkm-version"}.apk`;
  const blobToken = getRequiredEnv("BLOB_READ_WRITE_TOKEN");

  const blob = await put(`spkm/${safeName}`, file, {
    access: "public",
    token: blobToken,
    contentType: file.type || "application/vnd.android.package-archive",
    addRandomSuffix: false,
  });

  return blob.url;
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const versionTag = String(formData.get("versionTag") ?? "").trim();
    const changelog = String(formData.get("changelog") ?? "").trim();
    const platform = String(formData.get("platform") ?? "android").trim() || "android";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File APK wajib diunggah." }, { status: 400 });
    }

    if (!versionTag) {
      return NextResponse.json({ error: "Version tag wajib diisi." }, { status: 400 });
    }

    if (!/\.apk$/i.test(file.name)) {
      return NextResponse.json({ error: "File harus berformat .apk." }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 50MB." }, { status: 400 });
    }

    const app = await prisma.app.findUnique({
      where: { slug: APP_SLUG },
    });

    if (!app) {
      return NextResponse.json({ error: "Application tidak ditemukan." }, { status: 404 });
    }

    const existingVersion = await prisma.version.findFirst({
      where: {
        appId: app.id,
        versionTag,
      },
    });

    if (existingVersion) {
      return NextResponse.json({ error: "Version tag sudah ada untuk aplikasi ini." }, { status: 409 });
    }

    const fileUrl = await uploadFileToStorage(file, versionTag);

    const createdVersion = await prisma.$transaction(async (tx) => {
      const newVersion = await tx.version.create({
        data: {
          appId: app.id,
          versionTag,
          changelog,
          fileUrl,
          platform,
          isLatest: false,
        },
      });

      await tx.version.updateMany({
        where: {
          appId: app.id,
          id: { not: newVersion.id },
        },
        data: {
          isLatest: false,
        },
      });

      return tx.version.update({
        where: { id: newVersion.id },
        data: { isLatest: true },
      });
    });

    return NextResponse.json({ success: true, version: createdVersion }, { status: 201 });
  } catch (error) {
    console.error("Upload version failed:", error);
    return NextResponse.json({ error: "Gagal mengunggah versi aplikasi." }, { status: 500 });
  }
}
