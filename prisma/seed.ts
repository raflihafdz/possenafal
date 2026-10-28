import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ============ Create Users ============
  const adminPassword = await bcrypt.hash("admin123", 12);
  const cashierPassword = await bcrypt.hash("cashier123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@possenafal.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@possenafal.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: "cashier@possenafal.com" },
    update: {},
    create: {
      name: "Kasir 1",
      email: "cashier@possenafal.com",
      password: cashierPassword,
      role: Role.CASHIER,
    },
  });

  console.log("✅ Users created:");
  console.log(`   Admin: admin@possenafal.com / admin123`);
  console.log(`   Cashier: cashier@possenafal.com / cashier123\n`);

  console.log("🎉 User seeding completed successfully!");
  console.log("\n📋 Login Credentials:");
  console.log("   Admin  → admin@possenafal.com / admin123");
  console.log("   Kasir  → cashier@possenafal.com / cashier123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
