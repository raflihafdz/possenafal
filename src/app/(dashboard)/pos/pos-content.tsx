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
  stock: number;
  category: { name: string };
}

interface POSCategory {
  id: string;
  name: string;
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
        toast.error("Failed to load categories");
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
        toast.error("Failed to load products");
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
      toast.error("Search failed");
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

  const addToCart = (product: SearchProduct) => {
    const existing = cart.find((item) => item.productId === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(`Only ${product.stock} items available`);
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
          discount: 0,
          subtotal: product.sellingPrice,
          maxStock: product.stock,
        },
      ]);
    }

    setSearchQuery("");
    setShowResults(false);
    searchRef.current?.focus();
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.productId !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item;
          if (newQty > item.maxStock) {
            toast.error(`Only ${item.maxStock} items available`);
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
      toast.error("Paid amount must be at least " + formatCurrency(grandTotal));
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

      toast.success("Transaction completed!");
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
      toast.error("Transaction failed");
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
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">POS Cashier</h1>
          <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">F2</kbd> to search
            {" • "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">F9</kbd> to checkout
          </p>
        </div>

        {/* Search */}
        <div ref={searchContainerRef} className="relative mb-2 md:mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Search products..."
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
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.code} • {product.category.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {formatCurrency(product.sellingPrice)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {product.stock}
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
                No products found
              </CardContent>
            </Card>
          )}
        </div>

        {/* Category Selection */}
        {!searchQuery && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Categories</h3>
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
              Products {isLoadingProducts && "• Loading..."}
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
                    <p className="font-medium truncate w-full">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(product.sellingPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {product.stock}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <Card className="mb-4">
                <CardContent className="p-4 text-center text-muted-foreground text-sm">
                  No products in this category
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Cart Items */}
        <Card className="flex-1 min-h-0 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length} items)
              </CardTitle>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <Separator />
          <ScrollArea className="flex-1">
            <CardContent className="p-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-muted-foreground">
                    Cart is empty. Search and add products.
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
                        <p className="font-medium truncate">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
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
          <CardTitle className="text-base md:text-lg">Order Summary</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="flex-1 flex flex-col p-3 md:p-4 gap-3 md:gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">Discount</span>
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
              <span>Grand Total</span>
              <span className="text-primary">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-xs md:text-sm font-medium">Payment Method</Label>
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {[
                { value: "CASH", label: "Cash", icon: Banknote },
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
              <Label className="text-sm font-medium">Paid Amount</Label>
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
                    Change
                  </span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(changeAmount)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
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
              Complete Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Confirmation */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between">
                <span>Items</span>
                <span>{cart.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Grand Total</span>
                <span className="text-primary">{formatCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment</span>
                <Badge>{paymentMethod}</Badge>
              </div>
              {paymentMethod === "CASH" && (
                <>
                  <div className="flex justify-between">
                    <span>Paid</span>
                    <span>{formatCurrency(paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Change</span>
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
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Confirm
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <ReceiptDialog
        open={receiptDialogOpen}
        onOpenChange={setReceiptDialogOpen}
        invoiceNumber={lastInvoice}
      />
    </div>
  );
}
