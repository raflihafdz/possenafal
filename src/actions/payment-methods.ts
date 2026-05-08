"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Debit Banks
export async function getDebitBanks() {
  return prisma.debitBank.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });
}

export async function getAllDebitBanks() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.debitBank.findMany({
    orderBy: { displayOrder: "asc" },
  });
}

export async function createDebitBank(data: {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const bank = await prisma.debitBank.create({
    data: {
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountHolder: data.accountHolder,
      displayOrder: (await prisma.debitBank.count()) + 1,
    },
  });

  revalidatePath("/dashboard/payment-methods");
  return bank;
}

export async function updateDebitBank(
  id: string,
  data: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    isActive?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const bank = await prisma.debitBank.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/payment-methods");
  return bank;
}

export async function deleteDebitBank(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.debitBank.delete({
    where: { id },
  });

  revalidatePath("/dashboard/payment-methods");
}

export async function reorderDebitBanks(banks: Array<{ id: string; displayOrder: number }>) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await Promise.all(
    banks.map((bank) =>
      prisma.debitBank.update({
        where: { id: bank.id },
        data: { displayOrder: bank.displayOrder },
      })
    )
  );

  revalidatePath("/dashboard/payment-methods");
}

// QRIS
export async function getActiveQris() {
  return prisma.qrisCode.findFirst({
    where: { isActive: true },
  });
}

export async function getAllQris() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.qrisCode.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createQris(data: {
  qrisData: string;
  merchantName: string;
  displayText?: string;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Deactivate previous QRIS if adding new one
  await prisma.qrisCode.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  const qris = await prisma.qrisCode.create({
    data: {
      qrisData: data.qrisData,
      merchantName: data.merchantName,
      displayText: data.displayText || "Scan QRIS",
      isActive: true,
    },
  });

  revalidatePath("/dashboard/payment-methods");
  return qris;
}

export async function updateQris(
  id: string,
  data: {
    qrisData?: string;
    merchantName?: string;
    displayText?: string;
    isActive?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // If activating this QRIS, deactivate others
  if (data.isActive) {
    await prisma.qrisCode.updateMany({
      where: { isActive: true, NOT: { id } },
      data: { isActive: false },
    });
  }

  const qris = await prisma.qrisCode.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/payment-methods");
  return qris;
}

export async function deleteQris(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.qrisCode.delete({
    where: { id },
  });

  revalidatePath("/dashboard/payment-methods");
}
