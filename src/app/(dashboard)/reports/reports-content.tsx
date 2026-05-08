"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Download,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  Loader2,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatsCard } from "@/components/shared/stats-card";
import { getReports } from "@/actions/dashboard";
import { formatCurrency } from "@/utils";
import { ReportChart } from "./report-chart";

interface ReportData {
  totalRevenue: number;
  totalDiscount: number;
  totalTransactions: number;
  avgTransaction: number;
  topProducts: {
    productName: string;
    _sum: { quantity: number | null; subtotal: number | null };
  }[];
  paymentMethods: {
    paymentMethod: string;
    _sum: { grandTotal: number | null };
    _count: number;
  }[];
}

const paymentIcons: Record<string, typeof DollarSign> = {
  CASH: Banknote,
  TRANSFER: CreditCard,
  QRIS: QrCode,
};

export function ReportsContent() {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getReports({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setData(result as ReportData);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportCSV = () => {
    if (!data) return;

    const rows = [
      ["Report Summary"],
      ["Total Revenue", data.totalRevenue.toString()],
      ["Total Discount", data.totalDiscount.toString()],
      ["Total Transactions", data.totalTransactions.toString()],
      ["Average Transaction", data.avgTransaction.toString()],
      [],
      ["Top Products"],
      ["Product", "Quantity Sold", "Total Revenue"],
      ...data.topProducts.map((p) => [
        p.productName,
        (p._sum.quantity || 0).toString(),
        (p._sum.subtotal || 0).toString(),
      ]),
      [],
      ["Payment Methods"],
      ["Method", "Count", "Total"],
      ...data.paymentMethods.map((pm) => [
        pm.paymentMethod,
        pm._count.toString(),
        (pm._sum.grandTotal || 0).toString(),
      ]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${startDate || "all"}-${endDate || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  // Set default dates (current month)
  const setThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(now.toISOString().split("T")[0]);
  };

  const setLastMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const setToday = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  };

  const totalPayments = data?.paymentMethods.reduce(
    (sum, pm) => sum + pm._count,
    0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Sales analytics and performance reports
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          disabled={!data || isLoading}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Date Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={setToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={setThisMonth}>
                This Month
              </Button>
              <Button variant="outline" size="sm" onClick={setLastMonth}>
                Last Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                All Time
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(data.totalRevenue)}
              icon={DollarSign}
              className="border-l-4 border-l-emerald-500"
            />
            <StatsCard
              title="Total Transactions"
              value={data.totalTransactions}
              icon={ShoppingCart}
              className="border-l-4 border-l-blue-500"
            />
            <StatsCard
              title="Average Transaction"
              value={formatCurrency(data.avgTransaction)}
              icon={TrendingUp}
              className="border-l-4 border-l-violet-500"
            />
            <StatsCard
              title="Total Discount"
              value={formatCurrency(data.totalDiscount)}
              icon={Calendar}
              className="border-l-4 border-l-amber-500"
            />
          </div>

          {/* Charts & Tables */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                {data.topProducts.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No sales data available
                  </p>
                ) : (
                  <>
                    <ReportChart data={data.topProducts} />
                    <div className="mt-4 space-y-3">
                      {data.topProducts.map((product, index) => (
                        <div
                          key={product.productName}
                          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium">
                                {product.productName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product._sum.quantity || 0} units sold
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold">
                            {formatCurrency(product._sum.subtotal || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                {data.paymentMethods.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No payment data available
                  </p>
                ) : (
                  <div className="space-y-4">
                    {data.paymentMethods.map((pm) => {
                      const Icon = paymentIcons[pm.paymentMethod] || DollarSign;
                      const percentage = totalPayments > 0
                        ? Math.round((pm._count / totalPayments) * 100)
                        : 0;

                      return (
                        <div
                          key={pm.paymentMethod}
                          className="space-y-2 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <Badge variant="outline">{pm.paymentMethod}</Badge>
                            </div>
                            <span className="text-sm font-semibold">
                              {formatCurrency(pm._sum.grandTotal || 0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 rounded-full bg-muted h-2">
                              <div
                                className="h-2 rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-16 text-right">
                              {pm._count} ({percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
