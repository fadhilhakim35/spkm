import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const app = await prisma.app.findUnique({
    where: { slug: "spkm" },
  });

  const total = app
    ? await prisma.downloadEvent.count({
        where: {
          version: {
            appId: app.id,
          },
        },
      })
    : 0;

  return NextResponse.json({ total });
}
