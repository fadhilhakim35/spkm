import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const APP_SLUG = "spkm";
const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const result = await handleUpload({
      body,
      request,
      async onBeforeGenerateToken( pathname, clientPayload ) {
        const session = await auth();

        if (!session?.user || session.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        if (!pathname.toLowerCase().endsWith(".apk")) {
          throw new Error("File harus berformat .apk.");
        }

        let payload: { versionTag?: string; changelog?: string; platform?: string } = {};

        if (clientPayload) {
          try {
            payload = JSON.parse(clientPayload) as {
              versionTag?: string;
              changelog?: string;
              platform?: string;
            };
          } catch {
            throw new Error("Metadata upload tidak valid.");
          }
        }

        const versionTag = String(payload.versionTag ?? "").trim();

        if (!versionTag) {
          throw new Error("Version tag wajib diisi.");
        }

        const app = await prisma.app.findUnique({
          where: { slug: APP_SLUG },
        });

        if (!app) {
          throw new Error("Application tidak ditemukan.");
        }

        const existingVersion = await prisma.version.findFirst({
          where: {
            appId: app.id,
            versionTag,
          },
        });

        if (existingVersion) {
          throw new Error("Version tag sudah ada untuk aplikasi ini.");
        }

        return {
          allowedContentTypes: [
            "application/vnd.android.package-archive",
            "application/octet-stream",
          ],
          maximumSizeInBytes: MAX_UPLOAD_SIZE_BYTES,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({
            versionTag,
            changelog: String(payload.changelog ?? "").trim(),
            platform: String(payload.platform ?? "android").trim() || "android",
          }),
        };
      },
      async onUploadCompleted({ blob, tokenPayload }) {
        const session = await auth();

        if (!session?.user || session.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        let payload: { versionTag?: string; changelog?: string; platform?: string } = {};

        if (tokenPayload) {
          try {
            payload = JSON.parse(tokenPayload) as {
              versionTag?: string;
              changelog?: string;
              platform?: string;
            };
          } catch {
            throw new Error("Metadata upload tidak valid.");
          }
        }

        const versionTag = String(payload.versionTag ?? "").trim();
        const changelog = String(payload.changelog ?? "").trim();
        const platform = String(payload.platform ?? "android").trim() || "android";

        if (!versionTag) {
          throw new Error("Version tag wajib diisi.");
        }

        const app = await prisma.app.findUnique({
          where: { slug: APP_SLUG },
        });

        if (!app) {
          throw new Error("Application tidak ditemukan.");
        }

        const existingVersion = await prisma.version.findFirst({
          where: {
            appId: app.id,
            versionTag,
          },
        });

        if (existingVersion) {
          return;
        }

        await prisma.$transaction(async (tx) => {
          const newVersion = await tx.version.create({
            data: {
              appId: app.id,
              versionTag,
              changelog,
              fileUrl: blob.url,
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

          await tx.version.update({
            where: { id: newVersion.id },
            data: { isLatest: true },
          });
        });
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload gagal.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
