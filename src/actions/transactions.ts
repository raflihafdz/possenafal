"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkoutSchema } from "@/schemas";
import { generateInvoiceNumber } from "@/utils";
import { revalidatePath } from "next/cache";

export async function createTransaction(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validated = checkoutSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const { items, totalAmount, discount, grandTotal, paidAmount, paymentMethod, notes } = validated.data;

  if (paidAmount < grandTotal) {
    return { error: "Paid amount must be greater than or equal to grand total" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Verify stock availability
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product ${item.productName} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.productName}. Available: ${product.stock}`
          );
        }
      }

      const invoiceNumber = generateInvoiceNumber();
      const changeAmount = paidAmount - grandTotal;

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          invoiceNumber,
          userId: session.user.id,
          totalAmount,
          discount,
          grandTotal,
          paidAmount,
          changeAmount,
          paymentMethod,
          notes: notes || null,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
              discount: item.discount,
              subtotal: item.subtotal,
            })),
          },
        },
        include: {
          items: true,
          user: { select: { name: true } },
        },
      });

      // Update stock and create stock movements
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) continue;

        const stockBefore = product.stock;
        const stockAfter = stockBefore - item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: stockAfter },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            userId: session.user.id,
            type: "SALE",
            quantity: item.quantity,
            stockBefore,
            stockAfter,
            referenceType: "TRANSACTION",
            referenceId: transaction.id,
            notes: `Sale - Invoice ${invoiceNumber}`,
          },
        });
      }

      return transaction;
    });

    revalidatePath("/pos");
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/products");
    return { success: true, transaction: result };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create transaction" };
  }
}

export async function getTransactions(params?: {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}) {
  const { search = "", page = 1, limit = 10, status, startDate, endDate, userId } = params || {};
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { invoiceNumber: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(status && { status: status as "COMPLETED" | "CANCELLED" }),
    ...(userId && { userId }),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate + "T23:59:59.999Z") }),
          },
        }
      : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        items: true,
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function getTransactionByInvoice(invoiceNumber: string) {
  return prisma.transaction.findUnique({
    where: { invoiceNumber },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { code: true } },
        },
      },
    },
  });
}

export async function getTransactionById(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { code: true } },
        },
      },
    },
  });
}
