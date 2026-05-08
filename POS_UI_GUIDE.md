# POS Cashier UI Layout - Visual Guide

## Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           POS CASHIER INTERFACE                              │
│  Press F2 to search • Press F9 to checkout                                   │
├──────────────────────────────────────────────────────────────────┬───────────┤
│                                                                  │           │
│ [🔍] Search products by name, code, or scan barcode...  🔄      │  ORDER    │
│                                                                  │ SUMMARY   │
├──────────────────────────────────────────────────────────────────┤           │
│                                                                  │ Subtotal  │
│ Categories                                                       │ ₱12,450   │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ →       │           │
│ │ ACTIVE │ │ Food   │ │ Beverage│ │Supplies│ │ Other  │         │ Discount  │
│ │✓ Elect │ │        │ │ (hover) │ │        │ │        │         │ ₱500      │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘         │           │
│                                                                  │ Total     │
│ Products                                                         │ ₱11,950   │
│ ┌──────────┬──────────┬──────────┐                              │           │
│ │ Mouse    │ Keyboard │ Monitor  │ ← Clickable product cards   │ Paid      │
│ │ ₱599     │ ₱1,299   │ ₱8,999   │                              │ ₱15,000   │
│ │ Stk: 15  │ Stk: 8   │ Stk: 3   │                              │           │
│ ├──────────┼──────────┼──────────┤                              │ Change    │
│ │ Speaker  │ Cable    │ Hub      │                              │ ₱3,050    │
│ │ ₱1,899   │ ₱299     │ ₱2,999   │                              │           │
│ │ Stk: 12  │ Stk: 50  │ Stk: 7   │                              ├───────────┤
│ └──────────┴──────────┴──────────┘                              │           │
│                                                                  │   CART    │
│ CART (Shopping Items)                                            │           │
│ ┌────────────────────────────────────────────────────────────┐  │ Item 1:   │
│ │ Mouse              ₱599 × 1    [−] 1 [+]    ₱599      [✕]  │  │ Mouse × 1 │
│ │ Keyboard         ₱1,299 × 1    [−] 1 [+]  ₱1,299      [✕]  │  │ ₱599      │
│ │ Monitor          ₱8,999 × 1    [−] 1 [+]  ₱8,999      [✕]  │  │           │
│ │ ────────────────────────────────────────────────────────   │  │ Item 2:   │
│ │ Speaker          ₱1,899 × 1    [−] 1 [+]  ₱1,899      [✕]  │  │ Keyboard  │
│ │                                                             │  │ × 1       │
│ │                                                  [🗑️ Clear] │  │ ₱1,299    │
│ └────────────────────────────────────────────────────────────┘  │           │
│                                                                  │ Item 3:   │
│                                                                  │ Monitor   │
│                                                                  │ × 1       │
│                                                                  │ ₱8,999    │
│                                                                  │           │
│                                                                  │ [🛒 PLACE │
│                                                                  │  ORDER]   │
│                                                                  └───────────┘
```

## Mobile Layout

```
┌─────────────────────────────┐
│ POS CASHIER                 │
│ F2: search • F9: checkout   │
├─────────────────────────────┤
│ [🔍] Search...          🔄  │
│                             │
│ Categories                  │
│ ┌────┐ ┌────┐ ┌────┐ →    │
│ │ ACT│ │Food│ │Bev │       │
│ └────┘ └────┘ └────┘       │
│                             │
│ Products (2 cols)           │
│ ┌──────┬──────┐             │
│ │Mouse │Keybo │             │
│ │₱599  │₱1299 │             │
│ │Stk:15│Stk:8 │             │
│ ├──────┼──────┤             │
│ │Monitor│Speak │             │
│ │₱8999 │₱1899 │             │
│ │Stk:3 │Stk:12│             │
│ └──────┴──────┘             │
│                             │
│ CART (4 items)              │
│ ┌─────────────────────────┐ │
│ │ Mouse    ₱599 [−]1[+]   │ │
│ │ Keyboard ₱1299 [−]1[+]  │ │
│ │ Monitor  ₱8999 [−]1[+]  │ │
│ │ Speaker  ₱1899 [−]1[+]  │ │
│ │ ─────────────────────── │ │
│ │ Subtotal:    ₱12,696   │ │
│ │ Discount:       -₱500  │ │
│ │ TOTAL:       ₱12,196   │ │
│ │                        │ │
│ │ Paid: ₱15,000         │ │
│ │ Change: ₱2,804        │ │
│ │                        │ │
│ │ [💳 CHECKOUT]         │ │
│ └─────────────────────┘ │ │
└─────────────────────────────┘
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│           CATEGORY SELECTION STATE MACHINE                   │
└─────────────────────────────────────────────────────────────┘

    MOUNT
      ↓
      └→ [Load Categories]
           ↓
           setCategories([...])
           Select first category
           ↓
           setSelectedCategoryId(categories[0].id)
           ↓
    ┌─────────────────────────────────────────────┐
    │  CATEGORY SELECTED STATE                    │
    │  - categoryId = "cat_123"                    │
    │  - Display category cards                   │
    │  - Load products for category               │
    └─────────────────────────────────────────────┘
           ↓
    [Load Products]
           ↓
      setCategoryProducts([...])
      ↓
    ┌─────────────────────────────────────────────┐
    │  PRODUCTS LOADED STATE                      │
    │  - Display product grid                     │
    │  - Ready for clicks                         │
    └─────────────────────────────────────────────┘
           ↓
    USER CLICKS CATEGORY CARD
      ↓
      setSelectedCategoryId("cat_456")
      ↓
      (useEffect triggered)
      ↓
    [Load Products for New Category]
      ↓
      setCategoryProducts([...new products...])
      ↓
      (Cycle repeats)

┌─────────────────────────────────────────────────────────────┐
│           SEARCH OVERRIDE STATE MACHINE                      │
└─────────────────────────────────────────────────────────────┘

    USER TYPES IN SEARCH
      ↓
      setSearchQuery("mouse")
      ↓
    ┌─────────────────────────────────────────────┐
    │  SEARCH ACTIVE STATE                        │
    │  - Hide category cards                      │
    │  - Hide product grid                        │
    │  - Show search results dropdown             │
    │  - setShowResults(true)                     │
    └─────────────────────────────────────────────┘
           ↓
    USER CLEARS SEARCH
      ↓
      setSearchQuery("")
      ↓
    ┌─────────────────────────────────────────────┐
    │  CATEGORY VIEW RESTORED STATE               │
    │  - Show category cards                      │
    │  - Show product grid                        │
    │  - Hide search results                      │
    │  - setShowResults(false)                    │
    └─────────────────────────────────────────────┘
           ↓
      (Back to category selection)
```

## Add to Cart Flow

```
1. PRODUCT CARD CLICKED
   ↓
2. addToCart(product) called
   ↓
3. Check if product already in cart
   ├─ YES: Increment quantity by 1
   └─ NO: Add new item with qty = 1
   ↓
4. Update cart state
   ↓
5. Show toast: "✓ Product added to cart"
   ↓
6. Clear search query
   ↓
7. Reset search dropdown
   ↓
8. PRODUCT APPEARS IN CART PANEL
```

## Category Card States

```
┌─────────────────────────────────────────────────────────┐
│ CATEGORY CARD VISUAL STATES                             │
└─────────────────────────────────────────────────────────┘

1. SELECTED STATE (Active)
   ┌──────────────┐
   │ 📦 Electronics│  ← Primary blue background
   │              │     White text
   └──────────────┘     Shadow effect
   
2. HOVER STATE (Inactive, Mouse Over)
   ┌──────────────┐
   │ 👕 Clothing  │  ← Muted background
   │              │     Brighter on hover
   └──────────────┘     

3. DEFAULT STATE (Inactive)
   ┌──────────────┐
   │ 🍕 Food      │  ← Muted background
   │              │     Muted text
   └──────────────┘     
```

## Product Card States

```
┌─────────────────────────────────────────────────────────┐
│ PRODUCT CARD VISUAL STATES                              │
└─────────────────────────────────────────────────────────┘

1. DEFAULT STATE
   ┌────────────────┐
   │ Mouse          │  ← Border
   │ ₱599           │     Text
   │ Stock: 15      │
   └────────────────┘

2. HOVER STATE
   ┌────────────────┐
   │ Mouse          │  ← Primary border
   │ ₱599           │     Light background
   │ Stock: 15      │
   └────────────────┘

3. LOADING STATE (Grid)
   ┌────────────────┐
   │      ▓▓▓▓▓▓     │  ← Animated
   │      ▓▓▓▓      │     skeleton
   │      ▓▓▓       │     loaders
   └────────────────┘
```

## Responsive Breakpoints

```
┌─────────────────────────────────────────────────────────┐
│ RESPONSIVE GRID LAYOUT                                  │
└─────────────────────────────────────────────────────────┘

Mobile (< 768px):
- Product Grid: 2 columns
- Categories: Horizontal scroll
- Cart: Full width below products

Tablet (768px - 1024px):
- Product Grid: 3 columns
- Categories: Horizontal scroll
- Cart: Full width below products

Desktop (> 1024px):
- Product Grid: 3 columns
- Categories: Horizontal scroll
- Cart: Fixed right sidebar (380px width)

Layout:
Desktop: [Products | Cart]
Mobile:  [Products]
         [Cart]
```

## Keyboard Shortcuts

```
F2   → Focus search input (jump to search)
F9   → Open checkout dialog (if cart has items)
Esc  → Close search results dropdown (existing behavior)
```

---

**Note**: Colors and exact dimensions follow your Tailwind CSS configuration from `tailwind.config.ts`
