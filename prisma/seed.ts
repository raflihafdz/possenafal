import { PrismaClient, Role, PaymentMethod } from "@prisma/client";
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

  // ============ Create Categories ============
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Minuman" },
      update: {},
      create: { name: "Minuman", description: "Berbagai macam minuman segar" },
    }),
    prisma.category.upsert({
      where: { name: "Makanan Ringan" },
      update: {},
      create: { name: "Makanan Ringan", description: "Snack dan makanan ringan" },
    }),
    prisma.category.upsert({
      where: { name: "Makanan Berat" },
      update: {},
      create: { name: "Makanan Berat", description: "Nasi, mie, dan makanan utama" },
    }),
    prisma.category.upsert({
      where: { name: "Dessert" },
      update: {},
      create: { name: "Dessert", description: "Hidangan penutup dan kue" },
    }),
    prisma.category.upsert({
      where: { name: "Lainnya" },
      update: {},
      create: { name: "Lainnya", description: "Produk lainnya" },
    }),
  ]);

  console.log(`✅ ${categories.length} categories created\n`);

  // ============ Create Products ============
  const products = [
    // Minuman
    { categoryId: categories[0].id, code: "MNM-001", name: "Es Teh Manis", purchasePrice: 2000, sellingPrice: 5000, stock: 100, minStock: 10 },
    { categoryId: categories[0].id, code: "MNM-002", name: "Es Jeruk", purchasePrice: 3000, sellingPrice: 7000, stock: 80, minStock: 10 },
    { categoryId: categories[0].id, code: "MNM-003", name: "Kopi Susu", purchasePrice: 5000, sellingPrice: 12000, stock: 50, minStock: 8 },
    { categoryId: categories[0].id, code: "MNM-004", name: "Jus Alpukat", purchasePrice: 7000, sellingPrice: 15000, stock: 30, minStock: 5 },
    { categoryId: categories[0].id, code: "MNM-005", name: "Air Mineral", purchasePrice: 1500, sellingPrice: 4000, stock: 200, minStock: 20 },
    { categoryId: categories[0].id, code: "MNM-006", name: "Matcha Latte", purchasePrice: 8000, sellingPrice: 18000, stock: 25, minStock: 5 },

    // Makanan Ringan
    { categoryId: categories[1].id, code: "SNK-001", name: "Kentang Goreng", purchasePrice: 5000, sellingPrice: 12000, stock: 40, minStock: 5 },
    { categoryId: categories[1].id, code: "SNK-002", name: "Nugget 5pcs", purchasePrice: 6000, sellingPrice: 15000, stock: 35, minStock: 5 },
    { categoryId: categories[1].id, code: "SNK-003", name: "Pisang Goreng", purchasePrice: 3000, sellingPrice: 8000, stock: 45, minStock: 8 },
    { categoryId: categories[1].id, code: "SNK-004", name: "Roti Bakar", purchasePrice: 4000, sellingPrice: 10000, stock: 30, minStock: 5 },
    { categoryId: categories[1].id, code: "SNK-005", name: "Dimsum 4pcs", purchasePrice: 7000, sellingPrice: 15000, stock: 20, minStock: 5 },

    // Makanan Berat
    { categoryId: categories[2].id, code: "MKN-001", name: "Nasi Goreng Spesial", purchasePrice: 10000, sellingPrice: 22000, stock: 30, minStock: 5 },
    { categoryId: categories[2].id, code: "MKN-002", name: "Mie Goreng", purchasePrice: 8000, sellingPrice: 18000, stock: 35, minStock: 5 },
    { categoryId: categories[2].id, code: "MKN-003", name: "Nasi Ayam Geprek", purchasePrice: 12000, sellingPrice: 25000, stock: 25, minStock: 5 },
    { categoryId: categories[2].id, code: "MKN-004", name: "Nasi Rendang", purchasePrice: 15000, sellingPrice: 30000, stock: 20, minStock: 3 },
    { categoryId: categories[2].id, code: "MKN-005", name: "Bakso Jumbo", purchasePrice: 10000, sellingPrice: 20000, stock: 25, minStock: 5 },

    // Dessert
    { categoryId: categories[3].id, code: "DST-001", name: "Pudding Coklat", purchasePrice: 4000, sellingPrice: 10000, stock: 20, minStock: 5 },
    { categoryId: categories[3].id, code: "DST-002", name: "Es Krim Cup", purchasePrice: 5000, sellingPrice: 12000, stock: 30, minStock: 5 },
    { categoryId: categories[3].id, code: "DST-003", name: "Brownies", purchasePrice: 6000, sellingPrice: 15000, stock: 15, minStock: 3 },

    // Lainnya
    { categoryId: categories[4].id, code: "LNY-001", name: "Tissue Pack", purchasePrice: 1000, sellingPrice: 3000, stock: 100, minStock: 15 },
    { categoryId: categories[4].id, code: "LNY-002", name: "Plastik Bag", purchasePrice: 200, sellingPrice: 500, stock: 500, minStock: 50 },
  ];

  let productCount = 0;
  const createdProducts = [];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { code: product.code },
      update: {},
      create: product,
    });
    createdProducts.push(created);
    productCount++;
  }

  console.log(`✅ ${productCount} products created\n`);

  // ============ Create Sample Transactions ============
  const now = new Date();

  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const txDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const itemCount = 1 + Math.floor(Math.random() * 4);
    const selectedProducts = createdProducts
      .sort(() => Math.random() - 0.5)
      .slice(0, itemCount);

    const items = selectedProducts.map((p) => {
      const qty = 1 + Math.floor(Math.random() * 3);
      return {
        productId: p.id,
        productName: p.name,
        price: p.sellingPrice,
        quantity: qty,
        discount: 0,
        subtotal: p.sellingPrice * qty,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0;
    const grandTotal = totalAmount - discount;
    const methods: PaymentMethod[] = ["CASH", "TRANSFER", "QRIS"];
    const paymentMethod = methods[Math.floor(Math.random() * methods.length)];
    const paidAmount =
      paymentMethod === "CASH"
        ? Math.ceil(grandTotal / 10000) * 10000
        : grandTotal;

    const year = txDate.getFullYear().toString().slice(-2);
    const month = (txDate.getMonth() + 1).toString().padStart(2, "0");
    const day = txDate.getDate().toString().padStart(2, "0");
    const rand = Math.floor(Math.random() * 999999)
      .toString()
      .padStart(6, "0");
    const invoiceNumber = `INV-${year}${month}${day}-${rand}`;

    await prisma.transaction.create({
      data: {
        invoiceNumber,
        userId: Math.random() > 0.5 ? admin.id : cashier.id,
        totalAmount,
        discount,
        grandTotal,
        paidAmount,
        changeAmount: Math.max(0, paidAmount - grandTotal),
        paymentMethod,
        createdAt: txDate,
        items: {
          create: items,
        },
      },
    });
  }

  console.log(`✅ 15 sample transactions created\n`);

  console.log("🎉 Seeding completed successfully!");
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
