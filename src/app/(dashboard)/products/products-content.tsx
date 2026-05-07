"use client";

import { useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/shared/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "@/actions/products";
import { getAllCategories } from "@/actions/categories";
import { formatCurrency, formatDate } from "@/utils";

interface Product {
  id: string;
  categoryId: string;
  code: string;
  barcode: string | null;
  name: string;
  description: string | null;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

const defaultFormData = {
  categoryId: "",
  code: "",
  barcode: "",
  name: "",
  description: "",
  purchasePrice: 0,
  sellingPrice: 0,
  stock: 0,
  minStock: 5,
  image: "",
  isActive: true,
};

export function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getProducts({
        search,
        page,
        limit: 10,
        categoryId: categoryFilter || undefined,
      });
      setProducts(result.products as Product[]);
      setTotalPages(result.totalPages);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [search, page, categoryFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const result = await getAllCategories();
      setCategories(result);
    } catch {
      /* skip */
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      categoryId: product.categoryId,
      code: product.code,
      barcode: product.barcode || "",
      name: product.name,
      description: product.description || "",
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      minStock: product.minStock,
      image: product.image || "",
      isActive: product.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = editingProduct
        ? await updateProduct(editingProduct.id, formData)
        : await createProduct(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(editingProduct ? "Product updated!" : "Product created!");
      setDialogOpen(false);
      fetchProducts();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const result = await deleteProduct(deletingId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Product deleted!");
      setDeleteDialogOpen(false);
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const result = await toggleProductStatus(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Status updated!");
      fetchProducts();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.category.name}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "sellingPrice",
      header: "Price",
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.original.sellingPrice)}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const { stock, minStock } = row.original;
        const isLow = stock <= minStock;
        const isOut = stock === 0;
        return (
          <div className="flex items-center gap-2">
            <span className={isOut ? "text-destructive font-semibold" : isLow ? "text-amber-600 font-semibold" : ""}>
              {stock}
            </span>
            {isOut && (
              <Badge variant="destructive" className="text-[10px]">
                Out
              </Badge>
            )}
            {!isOut && isLow && (
              <Badge className="text-[10px] bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Low
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.isActive ? "default" : "secondary"}
          className={row.original.isActive ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : ""}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(row.original)} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(row.original.id)} className="h-8 w-8">
            {row.original.isActive ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setDeletingId(row.original.id); setDeleteDialogOpen(true); }}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val === "all" ? "" : val); setPage(1); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={products} isLoading={isLoading} pageCount={totalPages} currentPage={page} onPageChange={setPage} />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Create Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Code</Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="PRD-001" required />
              </div>
              <div className="space-y-2">
                <Label>Barcode</Label>
                <Input value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} placeholder="Optional" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Product name" required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.categoryId} onValueChange={(val) => setFormData({ ...formData, categoryId: val })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Purchase Price</Label>
                <Input type="number" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })} min={0} required />
              </div>
              <div className="space-y-2">
                <Label>Selling Price</Label>
                <Input type="number" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })} min={0} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} min={0} required />
              </div>
              <div className="space-y-2">
                <Label>Min Stock</Label>
                <Input type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })} min={0} required />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingProduct ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
