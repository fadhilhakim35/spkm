import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { getRequiredEnv } from "@/lib/env";
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
  const downloadHashSalt = getRequiredEnv("DOWNLOAD_HASH_SALT");
  const ipHash = crypto
    .createHash("sha256")
    .update(`${forwardedFor}${downloadHashSalt}`)
    .digest("hex");

  const cookieName = `spkm_download_${version.id}`;
  const cookieValue = request.cookies.get(cookieName)?.value;
  const now = Date.now();
  const cookieWindowMs = 60 * 1000;
  const duplicateWindowStart = new Date(now - cookieWindowMs);

  const recentDownload = await prisma.downloadEvent.findFirst({
    where: {
      versionId: version.id,
      ipHash,
      createdAt: {
        gte: duplicateWindowStart,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const isDuplicateByCookie =
    typeof cookieValue === "string" && !Number.isNaN(Number(cookieValue)) && Number(cookieValue) > now - cookieWindowMs;

  if (!recentDownload && !isDuplicateByCookie) {
    await prisma.downloadEvent.create({
      data: {
        versionId: version.id,
        ipHash,
        userAgent: userAgent ?? null,
        referrer: referrer ?? null,
        platform,
      },
    });
  }

  const redirectUrl = resolveDownloadUrl(version.fileUrl, request.nextUrl.origin);
  const response = NextResponse.redirect(redirectUrl, 302);

  if (!isDuplicateByCookie) {
    response.cookies.set(cookieName, String(now), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60,
    });
  }

  return response;
}
