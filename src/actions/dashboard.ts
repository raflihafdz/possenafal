"use server";

import prisma from "@/lib/prisma";

export async function getDashboardStats() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todayRevenue,
    monthRevenue,
    todayTransactions,
    totalProducts,
    lowStockProducts,
    recentTransactions,
    topProducts,
  ] = await Promise.all([
    // Today's revenue
    prisma.transaction.aggregate({
      where: {
        createdAt: { gte: startOfDay },
        status: "COMPLETED",
      },
      _sum: { grandTotal: true },
    }),
    // Month's revenue
    prisma.transaction.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: "COMPLETED",
      },
      _sum: { grandTotal: true },
    }),
    // Today's transaction count
    prisma.transaction.count({
      where: {
        createdAt: { gte: startOfDay },
        status: "COMPLETED",
      },
    }),
    // Total active products
    prisma.product.count({ where: { isActive: true } }),
    // Low stock count
    prisma.product
      .findMany({ where: { isActive: true } })
      .then((products) => products.filter((p) => p.stock <= p.minStock).length),
    // Recent transactions
    prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        items: true,
      },
    }),
    // Top selling products (this month)
    prisma.transactionItem.groupBy({
      by: ["productId", "productName"],
      where: {
        transaction: {
          createdAt: { gte: startOfMonth },
          status: "COMPLETED",
        },
      },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  return {
    todayRevenue: todayRevenue._sum.grandTotal || 0,
    monthRevenue: monthRevenue._sum.grandTotal || 0,
    todayTransactions,
    totalProducts,
    lowStockProducts,
    recentTransactions,
    topProducts,
  };
}

export async function getSalesChart(period: "7days" | "30days" | "12months" = "7days") {
  const now = new Date();
  let startDate: Date;
  let groupFormat: string;

  switch (period) {
    case "7days":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupFormat = "day";
      break;
    case "30days":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupFormat = "day";
      break;
    case "12months":
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      groupFormat = "month";
      break;
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      createdAt: { gte: startDate },
      status: "COMPLETED",
    },
    select: {
      grandTotal: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by period
  const grouped = new Map<string, number>();

  if (groupFormat === "day") {
    const days = period === "7days" ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      grouped.set(key, 0);
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
      grouped.set(key, 0);
    }
  }

  for (const tx of transactions) {
    let key: string;
    if (groupFormat === "day") {
      key = tx.createdAt.toISOString().split("T")[0];
    } else {
      key = `${tx.createdAt.getFullYear()}-${(tx.createdAt.getMonth() + 1).toString().padStart(2, "0")}`;
    }
    grouped.set(key, (grouped.get(key) || 0) + tx.grandTotal);
  }

  return Array.from(grouped.entries()).map(([date, total]) => ({
    date,
    total,
  }));
}

export async function getReports(params?: {
  startDate?: string;
  endDate?: string;
}) {
  const { startDate, endDate } = params || {};

  const where = {
    status: "COMPLETED" as const,
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate + "T23:59:59.999Z") }),
          },
        }
      : {}),
  };

  const [summary, topProducts, paymentMethods] = await Promise.all([
    prisma.transaction.aggregate({
      where,
      _sum: { grandTotal: true, discount: true },
      _count: true,
      _avg: { grandTotal: true },
    }),
    prisma.transactionItem.groupBy({
      by: ["productName"],
      where: { transaction: where },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    prisma.transaction.groupBy({
      by: ["paymentMethod"],
      where,
      _sum: { grandTotal: true },
      _count: true,
    }),
  ]);

  return {
    totalRevenue: summary._sum.grandTotal || 0,
    totalDiscount: summary._sum.discount || 0,
    totalTransactions: summary._count,
    avgTransaction: summary._avg.grandTotal || 0,
    topProducts,
    paymentMethods,
  };
}
