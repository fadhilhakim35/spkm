import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function detectPlatform(userAgent: string | null): string | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();

  if (ua.includes("android")) return "android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  if (ua.includes("windows")) return "windows";
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux")) return "linux";

  return "unknown";
}

function resolveDownloadUrl(fileUrl: string, origin: string): string {
  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  return new URL(fileUrl, origin).toString();
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ versionId: string }> },
) {
  const { versionId } = await context.params;

  const version = await prisma.version.findUnique({
    where: { id: versionId },
  });

  if (!version) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  const forwardedFor =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const userAgent = request.headers.get("user-agent");
  const referrer = request.headers.get("referer");
  const platform = detectPlatform(userAgent);
  const ipHash = crypto
    .createHash("sha256")
    .update(`${forwardedFor}${process.env.DOWNLOAD_HASH_SALT ?? "spkm-local-dev"}`)
    .digest("hex");

  await prisma.downloadEvent.create({
    data: {
      versionId: version.id,
      ipHash,
      userAgent: userAgent ?? null,
      referrer: referrer ?? null,
      platform,
    },
  });

  const redirectUrl = resolveDownloadUrl(version.fileUrl, request.nextUrl.origin);

  return NextResponse.redirect(redirectUrl, 302);
}
