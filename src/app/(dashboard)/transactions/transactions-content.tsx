"use client";

import { useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Eye, ExternalLink, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getTransactions, getTransactionById } from "@/actions/transactions";
import { formatCurrency, formatDate } from "@/utils";
import Link from "next/link";

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
  user: { name: string };
  items: { productName: string; quantity: number; price: number; subtotal: number }[];
}

interface TransactionDetail extends Transaction {
  user: { name: string; email: string };
  items: { productName: string; quantity: number; price: number; discount: number; subtotal: number; product: { code: string } }[];
}

export function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getTransactions({
        search,
        page,
        limit: 10,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setTransactions(result.transactions as Transaction[]);
      setTotalPages(result.totalPages);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [search, page, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleViewDetail = async (id: string) => {
    try {
      const tx = await getTransactionById(id);
      setSelectedTransaction(tx as TransactionDetail | null);
      setDetailDialogOpen(true);
    } catch {
      toast.error("Failed to load transaction");
    }
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">
          {row.original.invoiceNumber}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      accessorKey: "user.name",
      header: "Cashier",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.user.name}</span>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatCurrency(row.original.grandTotal)}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.paymentMethod}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "COMPLETED" ? "default" : "destructive"}
          className={row.original.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : ""}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetail(row.original.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Link href={`/receipt/${row.original.invoiceNumber}`} target="_blank">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">View and manage transaction history</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoice..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val === "all" ? "" : val); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="w-[160px]" />
          <span className="text-muted-foreground">to</span>
          <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="w-[160px]" />
        </div>
      </div>

      <DataTable columns={columns} data={transactions} isLoading={isLoading} pageCount={totalPages} currentPage={page} onPageChange={setPage} />

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Detail</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Invoice</p>
                  <p className="font-mono font-medium">{selectedTransaction.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p>{formatDate(selectedTransaction.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cashier</p>
                  <p>{selectedTransaction.user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <Badge variant="secondary">{selectedTransaction.paymentMethod}</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-semibold text-sm">Items</p>
                {selectedTransaction.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm rounded-lg border p-2">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(selectedTransaction.totalAmount)}</span>
                </div>
                {selectedTransaction.discount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Discount</span>
                    <span>-{formatCurrency(selectedTransaction.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Grand Total</span>
                  <span className="text-primary">{formatCurrency(selectedTransaction.grandTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span>{formatCurrency(selectedTransaction.paidAmount)}</span>
                </div>
                {selectedTransaction.changeAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Change</span>
                    <span>{formatCurrency(selectedTransaction.changeAmount)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
