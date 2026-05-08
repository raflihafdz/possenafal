"use server";

import prisma from "@/lib/prisma";
import { categorySchema } from "@/schemas";
import { revalidatePath } from "next/cache";

export async function getCategories(params?: {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
}) {
  const { search = "", page = 1, limit = 10, isActive } = params || {};
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(isActive !== undefined && { isActive }),
  };

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.category.count({ where }),
  ]);

  return {
    categories,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function getAllCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export async function createCategory(data: unknown) {
  const validated = categorySchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Validation failed" };
  }

  try {
    const category = await prisma.category.create({
      data: validated.data,
    });
    revalidatePath("/categories");
    return { success: true, category };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique")) {
      return { error: "Category name already exists" };
    }
    return { error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, data: unknown) {
  const validated = categorySchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Validation failed" };
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: validated.data,
    });
    revalidatePath("/categories");
    return { success: true, category };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique")) {
      return { error: "Category name already exists" };
    }
    return { error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return { error: `Cannot delete: ${productsCount} products are using this category` };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/categories");
    return { success: true };
  } catch {
    return { error: "Failed to delete category" };
  }
}

export async function toggleCategoryStatus(id: string) {
  try {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return { error: "Category not found" };

    await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });
    revalidatePath("/categories");
    return { success: true };
  } catch {
    return { error: "Failed to toggle category status" };
  }
}
