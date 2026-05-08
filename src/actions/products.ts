"use server";

import prisma from "@/lib/prisma";
import { productSchema } from "@/schemas";
import { revalidatePath } from "next/cache";

export async function getProducts(params?: {
  search?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  isActive?: boolean;
  lowStock?: boolean;
}) {
  const { search = "", page = 1, limit = 10, categoryId, isActive, lowStock } = params || {};
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { code: { contains: search, mode: "insensitive" as const } },
        { barcode: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(categoryId && { categoryId }),
    ...(isActive !== undefined && { isActive }),
    ...(lowStock && {
      stock: { lte: prisma.product.fields.minStock },
    }),
  };

  // For low stock, we need a raw approach
  const finalWhere = lowStock
    ? {
        ...where,
        stock: { equals: 0 },
      }
    : where;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: lowStock ? undefined : finalWhere,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.product.count({ where: lowStock ? undefined : finalWhere }),
  ]);

  // Filter low stock at application level if needed
  const filteredProducts = lowStock
    ? products.filter((p: any) => p.stock <= p.minStock)
    : products;

  return {
    products: filteredProducts,
    total: lowStock ? filteredProducts.length : total,
    totalPages: Math.ceil((lowStock ? filteredProducts.length : total) / limit),
    currentPage: page,
  };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function searchProducts(query: string) {
  if (!query || query.length < 1) return [];

  return prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
        { barcode: { equals: query } },
      ],
    },
    include: { category: { select: { name: true } } },
    take: 20,
    orderBy: { name: "asc" },
  });
}

export async function createProduct(data: unknown) {
  const validated = productSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Validation failed" };
  }

  try {
    const product = await prisma.product.create({
      data: {
        ...validated.data,
        barcode: validated.data.barcode || null,
        description: validated.data.description || null,
        image: validated.data.image || null,
      },
    });
    revalidatePath("/products");
    return { success: true, product };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique")) {
      if (error.message.includes("code")) {
        return { error: "Product code already exists" };
      }
      if (error.message.includes("barcode")) {
        return { error: "Barcode already exists" };
      }
    }
    return { error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, data: unknown) {
  const validated = productSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Validation failed" };
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...validated.data,
        barcode: validated.data.barcode || null,
        description: validated.data.description || null,
        image: validated.data.image || null,
      },
    });
    revalidatePath("/products");
    return { success: true, product };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique")) {
      if (error.message.includes("code")) {
        return { error: "Product code already exists" };
      }
      if (error.message.includes("barcode")) {
        return { error: "Barcode already exists" };
      }
    }
    return { error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    const transactionItems = await prisma.transactionItem.count({
      where: { productId: id },
    });

    if (transactionItems > 0) {
      return { error: "Cannot delete: product has transaction history" };
    }

    // Delete stock movements first
    await prisma.stockMovement.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    revalidatePath("/products");
    return { success: true };
  } catch {
    return { error: "Failed to delete product" };
  }
}

export async function toggleProductStatus(id: string) {
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return { error: "Product not found" };

    await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });
    revalidatePath("/products");
    return { success: true };
  } catch {
    return { error: "Failed to toggle product status" };
  }
}
