import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [totalDownloads, latestVersion, byPlatform] = await Promise.all([
    prisma.downloadEvent.count(),
    prisma.version.findFirst({
      orderBy: { releasedAt: "desc" },
      include: { app: true },
    }),
    prisma.downloadEvent.groupBy({
      by: ["platform"],
      _count: { platform: true },
      where: { platform: { not: null } },
    }),
  ]);

  return NextResponse.json({
    totalDownloads,
    latestVersion: latestVersion
      ? {
          id: latestVersion.id,
          versionTag: latestVersion.versionTag,
          appName: latestVersion.app.name,
          platform: latestVersion.platform,
        }
      : null,
    byPlatform,
  });
}
