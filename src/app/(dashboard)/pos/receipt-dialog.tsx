"use client";

import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ExternalLink, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils";
import { getTransactionByInvoice } from "@/actions/transactions";
import Link from "next/link";

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber: string;
}

interface Transaction {
  invoiceNumber: string;
  grandTotal: number;
  paymentMethod: string;
  paidAmount: number;
  changeAmount: number;
  createdAt: Date;
  user: { name: string };
  items: { productName: string; quantity: number; price: number; subtotal: number }[];
}

export function ReceiptDialog({ open, onOpenChange, invoiceNumber }: ReceiptDialogProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && invoiceNumber) {
      setIsLoading(true);
      getTransactionByInvoice(invoiceNumber)
        .then((tx) => setTransaction(tx as Transaction | null))
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [open, invoiceNumber]);

  const receiptUrl = typeof window !== "undefined"
    ? `${window.location.origin}/receipt/${invoiceNumber}`
    : `/receipt/${invoiceNumber}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Transaction Complete!</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : transaction ? (
          <div className="space-y-4">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-muted/50">
              <QRCodeCanvas
                value={receiptUrl}
                size={180}
                level="M"
                includeMargin
                className="rounded-lg"
              />
              <p className="text-xs text-muted-foreground text-center">
                Show this QR code to customer for digital receipt
              </p>
            </div>

            {/* Summary */}
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Invoice</span>
                <span className="font-mono font-medium">{transaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span>{transaction.items.length} products</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Grand Total</span>
                <span className="text-primary">{formatCurrency(transaction.grandTotal)}</span>
              </div>
              {transaction.paymentMethod === "CASH" && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid</span>
                    <span>{formatCurrency(transaction.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                    <span>Change</span>
                    <span>{formatCurrency(transaction.changeAmount)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Link href={`/receipt/${invoiceNumber}`} target="_blank" className="flex-1">
                <Button className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Receipt
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Receipt not found
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
