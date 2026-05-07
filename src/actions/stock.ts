"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { stockMovementSchema } from "@/schemas";
import { revalidatePath } from "next/cache";

export async function createStockMovement(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validated = stockMovementSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const { productId, type, quantity, notes } = validated.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const stockBefore = product.stock;
      let stockAfter: number;

      switch (type) {
        case "IN":
          stockAfter = stockBefore + quantity;
          break;
        case "OUT":
          if (stockBefore < quantity) {
            throw new Error(`Insufficient stock. Available: ${stockBefore}`);
          }
          stockAfter = stockBefore - quantity;
          break;
        case "ADJUSTMENT":
          stockAfter = quantity; // Direct set
          break;
        default:
          throw new Error("Invalid movement type");
      }

      await tx.product.update({
        where: { id: productId },
        data: { stock: stockAfter },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          userId: session.user.id,
          type,
          quantity: type === "ADJUSTMENT" ? Math.abs(stockAfter - stockBefore) : quantity,
          stockBefore,
          stockAfter,
          referenceType: "MANUAL",
          notes: notes || null,
        },
        include: {
          product: { select: { name: true, code: true } },
          user: { select: { name: true } },
        },
      });

      return movement;
    });

    revalidatePath("/stock");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    return { success: true, movement: result };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create stock movement" };
  }
}

export async function getStockMovements(params?: {
  search?: string;
  page?: number;
  limit?: number;
  type?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { search = "", page = 1, limit = 20, type, productId, startDate, endDate } = params || {};
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { product: { name: { contains: search, mode: "insensitive" as const } } },
        { product: { code: { contains: search, mode: "insensitive" as const } } },
        { notes: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(type && { type: type as "IN" | "OUT" | "ADJUSTMENT" | "SALE" }),
    ...(productId && { productId }),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate + "T23:59:59.999Z") }),
          },
        }
      : {}),
  };

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, code: true, stock: true, minStock: true } },
        user: { select: { name: true } },
      },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return {
    movements,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: { select: { name: true } } },
    orderBy: { stock: "asc" },
  });

  return products.filter((p) => p.stock <= p.minStock);
}
