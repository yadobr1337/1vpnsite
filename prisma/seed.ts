import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.systemSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      pricePerDayKopeks: 4900,
      trialDays: 1,
      deletionGraceHours: 20,
      defaultHwidDeviceLimit: 3,
      captchaEnabled: false,
      paymentsMode: process.env.PAYMENTS_AUTO_APPROVE === "true" ? "demo" : "manual",
      supportTelegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
        ? `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`
        : null,
      heroAnnouncement: "Neon privacy. Flexible balance. Instant VPN subscription.",
    },
  });

  await prisma.squad.upsert({
    where: { slug: "alpha-core" },
    update: {},
    create: {
      name: "Alpha Core",
      slug: "alpha-core",
      memberLimit: 250,
      position: 1,
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        passwordHash,
        role: Role.ADMIN,
      },
      create: {
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
