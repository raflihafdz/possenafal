import { z } from "zod";

// ============ Auth Schemas ============

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ============ Category Schemas ============

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

// ============ Product Schemas ============

export const productSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  code: z.string().min(2, "Code must be at least 2 characters").max(50),
  barcode: z.string().max(100).optional().or(z.literal("")),
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  description: z.string().max(1000).optional().or(z.literal("")),
  purchasePrice: z.coerce.number().min(0, "Purchase price must be positive"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be positive"),
  stock: z.coerce.number().int().min(0, "Stock must be positive"),
  minStock: z.coerce.number().int().min(0, "Min stock must be positive"),
  image: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

// ============ Transaction Schemas ============

export const cartItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number().int().min(1),
  discount: z.number().min(0).default(0),
  subtotal: z.number(),
  maxStock: z.number(),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Cart must not be empty"),
  totalAmount: z.number().min(0),
  discount: z.number().min(0).default(0),
  grandTotal: z.number().min(0),
  paidAmount: z.number().min(0, "Paid amount is required"),
  paymentMethod: z.enum(["CASH", "TRANSFER", "QRIS"]),
  notes: z.string().optional().or(z.literal("")),
});

// ============ Stock Movement Schemas ============

export const stockMovementSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

// ============ User Schemas ============

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "CASHIER"]),
  isActive: z.boolean().default(true),
});

export const userUpdateSchema = userSchema.partial({ password: true });

// ============ Types ============

export type LoginInput = z.infer<typeof loginSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
export type UserInput = z.infer<typeof userSchema>;
