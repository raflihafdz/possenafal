"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  QrCode,
  Loader2,
  Check,
  X,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { searchProducts, getProducts } from "@/actions/products";
import { getAllCategories } from "@/actions/categories";
import { createTransaction } from "@/actions/transactions";
import { formatCurrency } from "@/utils";
import type { CartItem } from "@/schemas";
import { ReceiptDialog } from "./receipt-dialog";

interface SearchProduct {
  id: string;
  code: string;
  barcode: string | null;
  name: string;
  sellingPrice: number;
  soldByWeight: boolean;
  pricePerKg: number | null;
  stock: number;
  category: { name: string };
}

interface POSCategory {
  id: string;
  name: string;
}

// Dialog for entering weight when product is sold by weight
function WeightInputDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: SearchProduct | null;
  onConfirm: (weightKg: number) => void;
}) {
  const [weight, setWeight] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setWeight("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const weightNum = parseFloat(weight) || 0;
  const pricePerKg = product?.pricePerKg ?? 0;
  const estimatedPrice = weightNum * pricePerKg;

  const quickWeights = [0.25, 0.5, 0.75, 1, 1.5, 2];

  const handleConfirm = () => {
    if (weightNum <= 0) {
      toast.error("Masukkan berat yang valid");
      return;
    }
    onConfirm(weightNum);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Input Berat
          </DialogTitle>
        </DialogHeader>
        {product && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                Harga: {formatCurrency(pricePerKg)} / kg
              </p>
              <p className="text-xs text-muted-foreground">
                Stok: {product.stock} kg
              </p>
            </div>

            <div className="space-y-2">
              <Label>Berat (kg)</Label>
              <Input
                ref={inputRef}
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Contoh: 1.5"
                min={0.001}
                step={0.001}
                className="h-12 text-xl font-semibold text-center"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirm();
                }}
              />
              <div className="grid grid-cols-3 gap-1.5">
                {quickWeights.map((w) => (
                  <Button
                    key={w}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setWeight(String(w))}
                  >
                    {w} kg
                  </Button>
                ))}
              </div>
            </div>

            {weightNum > 0 && (
              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <p className="text-sm text-muted-foreground">Estimasi Harga</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(estimatedPrice)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {weightNum} kg × {formatCurrency(pricePerKg)}/kg
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirm}
                disabled={weightNum <= 0}
              >
                Tambah ke Keranjang
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function POSContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER" | "QRIS">("CASH");
  const [notes, setNotes] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [lastInvoice, setLastInvoice] = useState("");

  // Weight input dialog
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [pendingWeightProduct, setPendingWeightProduct] = useState<SearchProduct | null>(null);

  // New states for category view
  const [categories, setCategories] = useState<POSCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<SearchProduct[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await getAllCategories();
        setCategories(result);
        if (result.length > 0) {
          setSelectedCategoryId(result[0].id);
        }
      } catch {
        toast.error("Gagal memuat kategori");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Load products for selected category
  useEffect(() => {
    if (!selectedCategoryId) return;

    const loadCategoryProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const result = await getProducts({
          categoryId: selectedCategoryId,
          limit: 100,
        });
        setSearchResults([]);
        setShowResults(false);
        setCategoryProducts(result.products as SearchProduct[]);
      } catch {
        toast.error("Gagal memuat produk");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadCategoryProducts();
  }, [selectedCategoryId]);

  // Calculate totals
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const grandTotal = Math.max(0, totalAmount - discount);
  const changeAmount = Math.max(0, paidAmount - grandTotal);

  // Search products with debounce
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchProducts(query);
      setSearchResults(results as SearchProduct[]);
      setShowResults(true);
    } catch {
      toast.error("Pencarian gagal");
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Close search results on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search on mount and keyboard shortcut
  useEffect(() => {
    searchRef.current?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "F2") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "F9") {
        e.preventDefault();
        if (cart.length > 0) setCheckoutDialogOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [cart.length]);

  // Add a weight-based product to cart
  const addWeightItemToCart = (product: SearchProduct, weightKg: number) => {
    const pricePerKg = product.pricePerKg ?? product.sellingPrice;
    const subtotal = Math.round(weightKg * pricePerKg * 100) / 100;

    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      // For weight products, update weight and recalculate
      const newWeight = (existing.weightKg ?? 0) + weightKg;
      if (newWeight > product.stock) {
        toast.error(`Stok tidak mencukupi. Tersedia: ${product.stock} kg`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                weightKg: Math.round(newWeight * 1000) / 1000,
                quantity: Math.round(newWeight * 1000) / 1000,
                subtotal: Math.round(newWeight * pricePerKg * 100) / 100,
              }
            : item
        )
      );
    } else {
      if (weightKg > product.stock) {
        toast.error(`Stok tidak mencukupi. Tersedia: ${product.stock} kg`);
        return;
      }
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          price: pricePerKg,
          quantity: weightKg,
          soldByWeight: true,
          weightKg,
          pricePerKg,
          discount: 0,
          subtotal,
          maxStock: product.stock,
        },
      ]);
    }

    setSearchQuery("");
    setShowResults(false);
    searchRef.current?.focus();
    toast.success(`${product.name} (${weightKg} kg) ditambahkan ke keranjang`);
  };

  const addToCart = (product: SearchProduct) => {
    // If sold by weight, open weight dialog
    if (product.soldByWeight) {
      setPendingWeightProduct(product);
      setWeightDialogOpen(true);
      return;
    }

    const existing = cart.find((item) => item.productId === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(`Hanya ${product.stock} item tersedia`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price - item.discount,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          price: product.sellingPrice,
          quantity: 1,
          soldByWeight: false,
          weightKg: null,
          pricePerKg: null,
          discount: 0,
          subtotal: product.sellingPrice,
          maxStock: product.stock,
        },
      ]);
    }

    setSearchQuery("");
    setShowResults(false);
    searchRef.current?.focus();
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.productId !== productId) return item;
          if (item.soldByWeight) {
            // For weight items, delta is in steps of 0.1 kg
            const step = 0.1;
            const newWeight = Math.round((item.weightKg ?? item.quantity) * 1000 + delta * step * 1000) / 1000;
            if (newWeight <= 0) return item;
            if (newWeight > item.maxStock) {
              toast.error(`Stok tidak mencukupi. Tersedia: ${item.maxStock} kg`);
              return item;
            }
            return {
              ...item,
              weightKg: newWeight,
              quantity: newWeight,
              subtotal: Math.round(newWeight * (item.pricePerKg ?? item.price) * 100) / 100,
            };
          }
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item;
          if (newQty > item.maxStock) {
            toast.error(`Hanya ${item.maxStock} item tersedia`);
            return item;
          }
          return {
            ...item,
            quantity: newQty,
            subtotal: newQty * item.price - item.discount,
          };
        })
    );
  };

  // Directly set weight for weight-based item
  const setItemWeight = (productId: string, newWeight: number) => {
    setCart(
      cart.map((item) => {
        if (item.productId !== productId || !item.soldByWeight) return item;
        if (newWeight <= 0) return item;
        if (newWeight > item.maxStock) {
          toast.error(`Stok tidak mencukupi. Tersedia: ${item.maxStock} kg`);
          return item;
        }
        return {
          ...item,
          weightKg: newWeight,
          quantity: newWeight,
          subtotal: Math.round(newWeight * (item.pricePerKg ?? item.price) * 100) / 100,
        };
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setPaidAmount(0);
    setNotes("");
  };

  const handleCheckout = async () => {
    if (paymentMethod === "CASH" && paidAmount < grandTotal) {
      toast.error("Jumlah pembayaran harus minimal " + formatCurrency(grandTotal));
      return;
    }

    const finalPaidAmount = paymentMethod !== "CASH" ? grandTotal : paidAmount;

    setIsCheckingOut(true);
    try {
      const result = await createTransaction({
        items: cart,
        totalAmount,
        discount,
        grandTotal,
        paidAmount: finalPaidAmount,
        paymentMethod,
        notes,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Transaksi berhasil!");
      setLastInvoice(result.transaction!.invoiceNumber);
      setCheckoutDialogOpen(false);
      setReceiptDialogOpen(true);
      clearCart();

      // Reload products to refresh stock numbers
      if (selectedCategoryId) {
        const reloadedProducts = await getProducts({
          categoryId: selectedCategoryId,
          limit: 100,
        });
        setCategoryProducts(reloadedProducts.products as SearchProduct[]);
      }
    } catch {
      toast.error("Transaksi gagal");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const quickAmounts = [10000, 20000, 50000, 100000, 200000, 500000];

  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 h-[calc(100vh-8rem)] overflow-hidden p-2 md:p-4">
      {/* Left Panel - Product Search */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <div className="mb-2 md:mb-4">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Kasir POS</h1>
        </div>

        {/* Search */}
        <div ref={searchContainerRef} className="relative mb-2 md:mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 md:pl-11 h-10 md:h-12 text-sm md:text-base"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <Card className="absolute z-50 w-full mt-1 shadow-lg max-h-96 overflow-auto">
              <CardContent className="p-0">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors border-b last:border-0 text-left"
                  >
                    <div>
                      <p className="font-medium flex items-center gap-1.5">
                        {product.name}
                        {product.soldByWeight && (
                          <Scale className="h-3.5 w-3.5 text-primary" />
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.code} • {product.category.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {product.soldByWeight
                          ? `${formatCurrency(product.pricePerKg ?? 0)}/kg`
                          : formatCurrency(product.sellingPrice)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Stok: {product.stock} {product.soldByWeight ? "kg" : "pcs"}
                      </p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {showResults && searchResults.length === 0 && searchQuery.length > 0 && !isSearching && (
            <Card className="absolute z-50 w-full mt-1 shadow-lg">
              <CardContent className="p-6 text-center text-muted-foreground">
                Produk tidak ditemukan
              </CardContent>
            </Card>
          )}
        </div>

        {/* Category Selection */}
        {!searchQuery && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Kategori</h3>
            {isLoadingCategories ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-20 w-24 rounded-lg bg-muted animate-pulse shrink-0"
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`shrink-0 px-4 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                      selectedCategoryId === category.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Products Grid */}
        {!searchQuery && selectedCategoryId && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
              Produk {isLoadingProducts && "• Memuat..."}
            </h3>
            {isLoadingProducts ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-muted animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : categoryProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 max-h-48 overflow-y-auto">
                {categoryProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="flex flex-col items-start p-2 rounded-lg border border-muted-foreground/20 hover:border-primary hover:bg-accent transition-all text-left text-xs"
                  >
                    <p className="font-medium truncate w-full flex items-center gap-1">
                      {product.soldByWeight && <Scale className="h-3 w-3 text-primary shrink-0" />}
                      <span className="truncate">{product.name}</span>
                    </p>
                    <p className="text-xs text-primary font-semibold">
                      {product.soldByWeight
                        ? `${formatCurrency(product.pricePerKg ?? 0)}/kg`
                        : formatCurrency(product.sellingPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stok: {product.stock} {product.soldByWeight ? "kg" : ""}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <Card className="mb-4">
                <CardContent className="p-4 text-center text-muted-foreground text-sm">
                  Tidak ada produk di kategori ini
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Cart Items */}
        <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                Keranjang ({cart.length} item)
              </CardTitle>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
                  <X className="h-4 w-4 mr-1" /> Bersihkan
                </Button>
              )}
            </div>
          </CardHeader>
          <Separator className="shrink-0" />
          <ScrollArea className="flex-1 h-0">
            <CardContent className="p-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-muted-foreground">
                    Keranjang kosong. Cari dan tambahkan produk.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate flex items-center gap-1.5">
                          {item.soldByWeight && <Scale className="h-3.5 w-3.5 text-primary shrink-0" />}
                          {item.productName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.soldByWeight
                            ? `${formatCurrency(item.pricePerKg ?? item.price)}/kg`
                            : formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        {item.soldByWeight ? (
                          <Input
                            type="number"
                            value={item.weightKg ?? item.quantity}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setItemWeight(item.productId, val);
                            }}
                            className="w-16 h-7 text-center text-sm font-medium px-1"
                            min={0.001}
                            step={0.1}
                          />
                        ) : (
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-medium text-muted-foreground ml-0.5">
                          {item.soldByWeight ? "kg" : "pcs"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold w-24 text-right">
                        {formatCurrency(item.subtotal)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>

      {/* Right Panel - Order Summary */}
      <Card className="w-full lg:w-80 flex flex-col">
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-base md:text-lg">Ringkasan Pesanan</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="flex-1 flex flex-col p-3 md:p-4 gap-3 md:gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">Diskon</span>
              <Input
                type="number"
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="w-24 md:w-32 h-7 md:h-8 text-right text-xs md:text-sm"
                min={0}
                max={totalAmount}
              />
            </div>
            <Separator />
            <div className="flex justify-between text-base md:text-lg font-bold">
              <span>Total Akhir</span>
              <span className="text-primary">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-xs md:text-sm font-medium">Metode Pembayaran</Label>
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {[
                { value: "CASH", label: "Tunai", icon: Banknote },
                { value: "TRANSFER", label: "Transfer", icon: CreditCard },
                { value: "QRIS", label: "QRIS", icon: QrCode },
              ].map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  type="button"
                  variant={paymentMethod === value ? "default" : "outline"}
                  className="flex flex-col gap-1 h-auto py-2 md:py-3 text-xs"
                  onClick={() => {
                    setPaymentMethod(value as "CASH" | "TRANSFER" | "QRIS");
                    if (value !== "CASH") {
                      setPaidAmount(grandTotal);
                    }
                  }}
                >
                  <Icon className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Paid Amount (Cash only) */}
          {paymentMethod === "CASH" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Jumlah Pembayaran</Label>
              <Input
                type="number"
                value={paidAmount || ""}
                onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                className="h-11 text-lg font-semibold"
                min={0}
              />
              <div className="grid grid-cols-3 gap-1.5">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setPaidAmount(amount)}
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
              {paidAmount > 0 && paidAmount >= grandTotal && (
                <div className="flex justify-between items-center rounded-lg bg-emerald-500/10 p-3">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Kembalian
                  </span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(changeAmount)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Catatan</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan opsional..."
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="mt-auto">
            <Button
              className="w-full h-12 text-base font-semibold gap-2"
              disabled={
                cart.length === 0 ||
                (paymentMethod === "CASH" && paidAmount < grandTotal)
              }
              onClick={() => setCheckoutDialogOpen(true)}
            >
              <Check className="h-5 w-5" />
              Selesaikan Pembayaran
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Confirmation */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Transaksi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Item</span>
                <span>{cart.length} item</span>
              </div>
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    {item.soldByWeight && <Scale className="h-3 w-3" />}
                    {item.productName}
                    {item.soldByWeight ? ` (${item.weightKg} kg)` : ` ×${item.quantity}`}
                  </span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Diskon</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Akhir</span>
                <span className="text-primary">{formatCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pembayaran</span>
                <Badge>{paymentMethod}</Badge>
              </div>
              {paymentMethod === "CASH" && (
                <>
                  <div className="flex justify-between">
                    <span>Dibayar</span>
                    <span>{formatCurrency(paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Kembalian</span>
                    <span>{formatCurrency(changeAmount)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCheckoutDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Konfirmasi
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Weight Input Dialog */}
      <WeightInputDialog
        open={weightDialogOpen}
        onOpenChange={setWeightDialogOpen}
        product={pendingWeightProduct}
        onConfirm={(weightKg) => {
          if (pendingWeightProduct) {
            addWeightItemToCart(pendingWeightProduct, weightKg);
          }
        }}
      />

      {/* Receipt Dialog */}
      <ReceiptDialog
        open={receiptDialogOpen}
        onOpenChange={setReceiptDialogOpen}
        invoiceNumber={lastInvoice}
      />
    </div>
  );
}
