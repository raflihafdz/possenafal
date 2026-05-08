# POS Cashier Quick Reference Guide

## 🏪 POS Interface Overview

The cashier dashboard (`/dashboard/pos`) provides a streamlined point-of-sale interface with category-based product browsing.

---

## 🎯 Main Features

### 1. Category Selection
**Where**: Top of left panel  
**How**: Click any category card to view its products  
**Visual**: Selected category highlighted in primary color  
**Auto-Action**: First category automatically selected on page load

**Example**:
```
Categories
┌──────────┐ ┌──────────┐ ┌──────────┐
│Electronics│ │   Food  │ │Beverage │ ← Click to select
│ (ACTIVE) │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘
```

### 2. Product Grid
**Where**: Below category cards  
**Shows**: All products in selected category  
**Columns**: 2 (mobile) / 3 (tablet/desktop)  
**Per Card**: Product name, price, stock availability

**How to Add**: Click any product card → automatically added to cart

```
Products
┌─────────┬─────────┬─────────┐
│ Mouse   │Keyboard │Monitor  │
│ ₱599    │ ₱1,299  │ ₱8,999  │
│Stk: 15  │ Stk: 8  │ Stk: 3  │ ← Click to add
└─────────┴─────────┴─────────┘
```

### 3. Search Bar
**Where**: Top of panel  
**Use**: Quick product lookup if you know the name/code  
**Trigger**: Type to search → Results dropdown appears  
**Clear**: Delete search text → Reverts to category view

**Note**: When search is active, category cards hide

**Keyboard Shortcut**: Press `F2` to focus search

```
[🔍] Search products by name, code, or scan barcode...
     ↓
     Shows matching products as you type
```

### 4. Shopping Cart
**Where**: Left panel below products  
**Shows**: All items added to cart  
**Per Item**: Name, price, quantity, subtotal

**Actions**:
- `[−]` button: Decrease quantity (minimum 1)
- `[+]` button: Increase quantity (maximum available stock)
- `[✕]` button: Remove item from cart
- `[Clear]` button: Remove all items

```
CART (4 items)
┌────────────────────────────────────────┐
│ Mouse    ₱599  [−] 1 [+]  ₱599   [✕] │
│ Keyboard ₱1299 [−] 1 [+]  ₱1,299 [✕] │
│ Monitor  ₱8999 [−] 1 [+]  ₱8,999 [✕] │
│ Speaker  ₱1899 [−] 1 [+]  ₱1,899 [✕] │
│                       [🗑️ Clear]     │
└────────────────────────────────────────┘
```

### 5. Order Summary
**Where**: Right panel (fixed on desktop, below cart on mobile)  
**Shows**: Real-time transaction totals

**Fields**:
- Subtotal: Sum of all item subtotals
- Discount: Applied discount (enter custom amount)
- Total: Final amount to be paid
- Paid: Amount paid by customer
- Change: Remaining cash

**Payment Methods**: CASH, CHECK, CREDIT_CARD, DEBIT_CARD, INSTALLMENT

```
ORDER SUMMARY
┌──────────────────────┐
│ Subtotal    ₱12,450  │
│ Discount    −₱500    │
│ ─────────────────── │
│ Total       ₱11,950  │
│                      │
│ Paid        ₱15,000  │
│ Change      ₱3,050   │
│                      │
│ Payment Method       │
│ [CASH ▼]             │
│                      │
│ Notes                │
│ [Enter notes...]     │
│                      │
│ [💳 PLACE ORDER]    │
└──────────────────────┘
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Where |
|----------|--------|-------|
| `F2` | Focus search input | Search bar |
| `F9` | Open checkout (if cart has items) | Anywhere |
| `ESC` | Close search results | Search dropdown |

---

## 🛠️ Common Tasks

### Add Product to Cart
1. **Option A - By Category**:
   - Click category card
   - Click product card
   - Product adds to cart ✓

2. **Option B - By Search**:
   - Type product name in search
   - Click product in dropdown
   - Product adds to cart ✓

### Modify Quantity
1. Click `[−]` to decrease or `[+]` to increase
2. Quantity updates instantly
3. Subtotal recalculates automatically

### Remove Item
1. Click `[✕]` on cart item
2. Item removed from cart
3. Totals recalculate

### Clear All Items
1. Click `[Clear]` button in cart header
2. Entire cart empties
3. Discount and paid amount reset

### Apply Discount
1. Enter discount amount in "Discount" field
2. Total updates instantly
3. Change recalculates if paid amount set

### Complete Transaction
1. Ensure all items in cart
2. Enter customer name (optional)
3. Select payment method
4. Enter paid amount (if CASH)
5. Add notes if needed
6. Click `[PLACE ORDER]`
7. Receipt dialog appears
8. Print receipt if needed

### Search for Specific Product
1. Press `F2` or click search bar
2. Type product name, code, or scan barcode
3. Results appear below search bar
4. Click any result to add to cart
5. Delete search text to return to categories

---

## 📊 Understanding the Display

### Product Card Information
```
┌──────────────────┐
│ Mouse            │ ← Product name
│ ₱599             │ ← Selling price
│ Stk: 15          │ ← Available stock
└──────────────────┘
```

### Cart Item Breakdown
```
Mouse         ₱599  [−] 1 [+]  ₱599      [✕]
↑            ↑     ↑   ↑ ↑     ↑        ↑
Name      Price  Dec Qty Inc Subtotal  Delete
```

### Order Summary Calculation
```
Subtotal = Sum of (Price × Quantity) for all items
Discount = User-entered discount amount
Total = Subtotal - Discount
Change = Paid Amount - Total
```

---

## 💡 Pro Tips

1. **Fast Add**: Use categories to quickly find and add products
2. **Bulk Search**: Use search for products you can't remember the category
3. **F2 + Type**: Fastest way to search - press F2, start typing
4. **Keyboard**: Use Tab to navigate through form fields
5. **Multiple Discounts**: Edit discount field to apply transaction-wide discount
6. **Quick Amounts**: Pre-set quick amounts available in checkout dialog
7. **Notes Field**: Add customer notes or special instructions in notes field

---

## ⚠️ Important Notes

### Stock Limits
- Can't add more items than available stock
- System prevents over-ordering
- Shows warning: "Only X items available"

### Minimum Paid Amount
- For CASH: Must pay at least the total amount
- For other methods: Paid amount automatically set to total
- System prevents under-payment for cash

### Auto-Clear on Success
- Cart clears after successful transaction
- Discount and paid amount reset
- Ready for next transaction

### Receipt Printing
- After checkout, receipt dialog appears
- Contains all transaction details
- Includes invoice number for reference
- Can be printed or saved as PDF

---

## 🎨 Visual States

### Category Card States
```
SELECTED (Active)      UNSELECTED (Inactive)      UNSELECTED (Hover)
┌──────────┐          ┌──────────┐               ┌──────────┐
│Electronics│ ← Blue  │   Food   │ ← Gray       │   Food   │ ← Lighter Gray
│  White   │ bg      │Gray text │              │Gray text │
└──────────┘          └──────────┘              └──────────┘
```

### Product Card States
```
DEFAULT              HOVER                    LOADING
┌────────────┐      ┌────────────┐           ┌────────────┐
│ Mouse      │      │ Mouse      │           │    ▓▓▓▓▓   │
│ ₱599       │  →   │ ₱599       │           │    ▓▓▓▓    │
│ Stk: 15    │      │ Stk: 15    │           │    ▓▓▓     │
└────────────┘      └────────────┘           └────────────┘
Gray border      Blue border + Light bg     Animated skeleton
```

---

## 🚀 Performance Tips

1. **Category Selection**: Faster than searching every time
2. **Recent Categories**: Browser remembers your selection
3. **Loading**: Wait for products to load before clicking
4. **Search**: Use specific keywords for faster results
5. **Mobile**: Tap category cards instead of scrolling categories

---

## 📱 Mobile-Specific Notes

**Layout**: Stack vertical (no side-by-side panels)  
**Grid**: 2-column product grid (vs 3 on desktop)  
**Scrolling**: Swipe horizontally for categories  
**Buttons**: Larger touch targets for easier interaction  
**Display**: All features accessible, just vertically arranged

---

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| No products showing | Select different category or try search |
| "Stock unavailable" warning | Product out of stock, try different item |
| Search returning no results | Check product name spelling, try category browsing |
| Can't decrease quantity | Minimum quantity is 1, delete item instead |
| Cart empty after checkout | Transaction completed successfully, new sale ready |

---

## 📞 Need Help?

- **Search Not Working**: Type full or partial product name
- **Category Empty**: Check if products assigned to that category
- **Payment Issues**: Ensure paid amount ≥ total for cash
- **Receipt Missing**: Check browser print preview
- **Performance Slow**: Refresh page, check internet connection

---

**Last Updated**: Today  
**Version**: 2.0 (With Category-Based Selection)  
**Status**: Ready for Daily Use ✅
