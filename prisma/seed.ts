import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const app = await prisma.app.upsert({
    where: { slug: "spkm" },
    update: {
      name: "SPKM",
      description: "App delivery and download analytics dashboard demo",
    },
    create: {
      name: "SPKM",
      slug: "spkm",
      description: "App delivery and download analytics dashboard demo",
    },
  });

  await prisma.adminUser.upsert({
    where: { email: "admin@spkm.local" },
    update: {
      passwordHash: hashSync("admin123", 10),
      role: "admin",
    },
    create: {
      email: "admin@spkm.local",
      passwordHash: hashSync("admin123", 10),
      role: "admin",
    },
  });

  const existingVersion = await prisma.version.findFirst({
    where: { appId: app.id },
    orderBy: { releasedAt: "desc" },
  });

  if (!existingVersion) {
    await prisma.version.create({
      data: {
        appId: app.id,
        versionTag: "v1.0.0",
        changelog: "- Rilis awal\n- Installer demo siap didownload\n- Tracking download aktif",
        fileUrl: "/files/spkm-installer.txt",
        platform: "android",
        isLatest: true,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
