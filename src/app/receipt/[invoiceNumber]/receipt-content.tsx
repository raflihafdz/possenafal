"use client";

import { useRef } from "react";
import { Printer, Download, Share2, Store, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/utils";
import { Badge } from "@/components/ui/badge";

interface TransactionItem {
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
  product: { code: string };
}

interface Transaction {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  user: { name: string; email: string };
  items: TransactionItem[];
}

export function ReceiptContent({ transaction }: { transaction: Transaction }) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "PossENafal Store";
  const storeAddress = process.env.NEXT_PUBLIC_STORE_ADDRESS || "";
  const storePhone = process.env.NEXT_PUBLIC_STORE_PHONE || "";

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt ${transaction.invoiceNumber}`,
          text: `Receipt from ${storeName} - ${formatCurrency(transaction.grandTotal)}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Receipt link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Action buttons - hidden in print */}
        <div className="flex gap-2 mb-4 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-1">
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-1">
            <a href={`/api/receipt/${transaction.invoiceNumber}/pdf`}>
              <Download className="h-4 w-4" /> PDF
            </a>
          </Button>
        </div>

        {/* Receipt */}
        <div
          ref={receiptRef}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Store className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-xl font-bold">{storeName}</h1>
            {storeAddress && <p className="text-sm text-blue-100 mt-1">{storeAddress}</p>}
            {storePhone && <p className="text-sm text-blue-100">{storePhone}</p>}
          </div>

          {/* Invoice Info */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Invoice Number</p>
                <p className="font-mono font-semibold">{transaction.invoiceNumber}</p>
              </div>
              <Badge
                variant={transaction.status === "COMPLETED" ? "default" : "destructive"}
                className="gap-1"
              >
                {transaction.status === "COMPLETED" && <CheckCircle className="h-3 w-3" />}
                {transaction.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p>{formatDate(transaction.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cashier</p>
                <p>{transaction.user.name}</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Items */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">Items</p>
              {transaction.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.price)}
                      {item.discount > 0 && ` (-${formatCurrency(item.discount)})`}
                    </p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(transaction.totalAmount)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Discount</span>
                  <span>-{formatCurrency(transaction.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Grand Total</span>
                <span className="text-primary">{formatCurrency(transaction.grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <Badge variant="secondary">{transaction.paymentMethod}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid Amount</span>
                <span>{formatCurrency(transaction.paidAmount)}</span>
              </div>
              {transaction.changeAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Change</span>
                  <span>{formatCurrency(transaction.changeAmount)}</span>
                </div>
              )}
            </div>

            {transaction.notes && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm">{transaction.notes}</p>
                </div>
              </>
            )}

            <Separator className="my-4" />

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground">
              <p>Thank you for your purchase!</p>
              <p className="mt-1">Powered by PossENafal POS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
