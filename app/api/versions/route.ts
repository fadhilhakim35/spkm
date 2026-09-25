import { NextResponse } from "next/server";

import { auth } from "@/auth";

export async function POST() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      error:
        "Upload file kini harus diproses melalui endpoint /api/upload dengan Vercel Blob client upload. Endpoint /api/versions tidak lagi menerima file multipart.",
    },
    { status: 410 },
  );
}
