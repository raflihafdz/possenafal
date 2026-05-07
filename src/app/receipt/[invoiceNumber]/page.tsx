import { getTransactionByInvoice } from "@/actions/transactions";
import { ReceiptContent } from "./receipt-content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ invoiceNumber: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { invoiceNumber } = await params;
  return {
    title: `Receipt ${invoiceNumber} - PossENafal POS`,
    description: `Digital receipt for transaction ${invoiceNumber}`,
  };
}

export default async function ReceiptPage({ params }: Props) {
  const { invoiceNumber } = await params;
  const transaction = await getTransactionByInvoice(decodeURIComponent(invoiceNumber));

  if (!transaction) {
    notFound();
  }

  return <ReceiptContent transaction={transaction} />;
}
