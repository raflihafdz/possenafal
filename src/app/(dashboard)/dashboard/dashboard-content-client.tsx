"use client";

import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils";
import { StatsCard } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SalesChart } from "./sales-chart";
import type { getDashboardStats, getSalesChart } from "@/actions/dashboard";

interface DashboardContentClientProps {
  stats: Awaited<ReturnType<typeof getDashboardStats>>;
  chartData: Awaited<ReturnType<typeof getSalesChart>>;
}

export function DashboardContentClient({
  stats,
  chartData,
}: DashboardContentClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang! Berikut ringkasan bisnis Anda.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pendapatan Hari Ini"
          value={formatCurrency(stats.todayRevenue)}
          description="Total penjualan hari ini"
          icon={DollarSign}
          iconClassName="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Pendapatan Bulanan"
          value={formatCurrency(stats.monthRevenue)}
          description="Total penjualan bulan ini"
          icon={DollarSign}
          iconClassName="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatsCard
          title="Transaksi Hari Ini"
          value={stats.todayTransactions}
          description="Transaksi selesai"
          icon={ShoppingCart}
          iconClassName="bg-gradient-to-br from-violet-500 to-violet-600"
        />
        <StatsCard
          title="Total Produk"
          value={stats.totalProducts}
          description={`${stats.lowStockProducts} stok menipis`}
          icon={Package}
          iconClassName="bg-gradient-to-br from-amber-500 to-orange-500"
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Sales Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Grafik Penjualan</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={chartData} />
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Belum ada data penjualan
                </p>
              ) : (
                stats.topProducts.map((product: any, index: number) => (
                  <div
                    key={product.productName}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.productName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product._sum.quantity} terjual •{" "}
                        {formatCurrency(product._sum.subtotal || 0)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Belum ada transaksi
                </p>
              ) : (
                stats.recentTransactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {tx.invoiceNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.user.name} • {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(tx.grandTotal)}
                      </p>
                      <Badge
                        variant={
                          tx.status === "COMPLETED" ? "default" : "destructive"
                        }
                        className="text-[10px]"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Peringatan Stok Menipis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lowStockProducts === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Semua produk memiliki stok yang cukup
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {stats.lowStockProducts} produk hampir kehabisan stok.
                  Periksa halaman Produk untuk detailnya.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
