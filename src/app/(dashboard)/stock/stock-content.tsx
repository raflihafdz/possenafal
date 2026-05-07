"use client";

import { useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, RefreshCw, ShoppingCart, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createStockMovement, getStockMovements, getLowStockProducts } from "@/actions/stock";
import { getProducts } from "@/actions/products";
import { formatDate, formatCurrency } from "@/utils";

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  referenceType: string | null;
  notes: string | null;
  createdAt: Date;
  product: { name: string; code: string; stock: number; minStock: number };
  user: { name: string };
}

interface LowStockProduct {
  id: string;
  code: string;
  name: string;
  stock: number;
  minStock: number;
  sellingPrice: number;
  category: { name: string };
}

interface ProductOption {
  id: string;
  code: string;
  name: string;
  stock: number;
}

export function StockContent() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    type: "IN" as "IN" | "OUT" | "ADJUSTMENT",
    quantity: 1,
    notes: "",
  });

  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getStockMovements({
        search,
        page,
        limit: 15,
        type: typeFilter || undefined,
      });
      setMovements(result.movements as StockMovement[]);
      setTotalPages(result.totalPages);
    } catch {
      toast.error("Failed to load stock movements");
    } finally {
      setIsLoading(false);
    }
  }, [search, page, typeFilter]);

  const fetchLowStock = useCallback(async () => {
    try {
      const result = await getLowStockProducts();
      setLowStockProducts(result as LowStockProduct[]);
    } catch {/* skip */}
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const result = await getProducts({ limit: 1000, isActive: true });
      setProducts(result.products as ProductOption[]);
    } catch {/* skip */}
  }, []);

  useEffect(() => { fetchMovements(); }, [fetchMovements]);
  useEffect(() => { fetchLowStock(); fetchProducts(); }, [fetchLowStock, fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createStockMovement(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Stock movement created!");
      setDialogOpen(false);
      setFormData({ productId: "", type: "IN", quantity: 1, notes: "" });
      fetchMovements();
      fetchLowStock();
    } catch {
      toast.error("Failed to create stock movement");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "IN": return <ArrowUpCircle className="h-4 w-4 text-emerald-500" />;
      case "OUT": return <ArrowDownCircle className="h-4 w-4 text-red-500" />;
      case "ADJUSTMENT": return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case "SALE": return <ShoppingCart className="h-4 w-4 text-violet-500" />;
      default: return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      IN: "bg-emerald-500/10 text-emerald-600",
      OUT: "bg-red-500/10 text-red-600",
      ADJUSTMENT: "bg-blue-500/10 text-blue-600",
      SALE: "bg-violet-500/10 text-violet-600",
    };
    return (
      <Badge className={`${variants[type] || ""} gap-1`}>
        {getTypeIcon(type)}
        {type}
      </Badge>
    );
  };

  const movementColumns: ColumnDef<StockMovement>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => <span className="text-sm">{formatDate(row.original.createdAt)}</span>,
    },
    {
      accessorKey: "product.name",
      header: "Product",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.product.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.original.product.code}</p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => getTypeBadge(row.original.type),
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      cell: ({ row }) => {
        const { type, quantity } = row.original;
        return (
          <span className={type === "IN" ? "text-emerald-600 font-semibold" : type === "OUT" || type === "SALE" ? "text-red-600 font-semibold" : "font-semibold"}>
            {type === "IN" ? "+" : type === "OUT" || type === "SALE" ? "-" : "±"}
            {quantity}
          </span>
        );
      },
    },
    {
      id: "stockChange",
      header: "Stock Change",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.stockBefore} → {row.original.stockAfter}
        </span>
      ),
    },
    {
      accessorKey: "user.name",
      header: "User",
      cell: ({ row }) => <span className="text-sm">{row.original.user.name}</span>,
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {row.original.notes || "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground">Track and manage inventory movements</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Stock Movement
        </Button>
      </div>

      <Tabs defaultValue="movements">
        <TabsList>
          <TabsTrigger value="movements">Movement History</TabsTrigger>
          <TabsTrigger value="lowstock" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Low Stock ({lowStockProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="movements" className="space-y-4 mt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search product..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val === "all" ? "" : val); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="IN">Stock In</SelectItem>
                <SelectItem value="OUT">Stock Out</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                <SelectItem value="SALE">Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable columns={movementColumns} data={movements} isLoading={isLoading} pageCount={totalPages} currentPage={page} onPageChange={setPage} />
        </TabsContent>

        <TabsContent value="lowstock" className="mt-4">
          {lowStockProducts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                All products are well stocked!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {lowStockProducts.map((product) => (
                <Card key={product.id} className="border-amber-200 dark:border-amber-900">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{product.name}</CardTitle>
                      {product.stock === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-600">Low Stock</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current / Min</span>
                      <span className="font-semibold">{product.stock} / {product.minStock}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Category</span>
                      <span>{product.category.name}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Price</span>
                      <span>{formatCurrency(product.sellingPrice)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Stock Movement Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Stock Movement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={formData.productId} onValueChange={(val) => setFormData({ ...formData, productId: val })}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Movement Type</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val as "IN" | "OUT" | "ADJUSTMENT" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">Stock In</SelectItem>
                  <SelectItem value="OUT">Stock Out</SelectItem>
                  <SelectItem value="ADJUSTMENT">Stock Adjustment (Set to)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{formData.type === "ADJUSTMENT" ? "New Stock Value" : "Quantity"}</Label>
              <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} min={formData.type === "ADJUSTMENT" ? 0 : 1} required />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Reason for stock movement..." rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create Movement</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
