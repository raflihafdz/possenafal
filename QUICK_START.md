# 🚀 QUICK REFERENCE - PossENafal POS

## Current Status
✅ **SERVER RUNNING** at http://localhost:3000

---

## Login Credentials

```
ADMIN:
  Email: admin@possenafal.com
  Password: admin123
  Access: Dashboard, Products, Categories, Stock, Reports

CASHIER:
  Email: cashier@possenafal.com
  Password: cashier123
  Access: POS, Transactions
```

---

## Main Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/` | Home (redirects) | Any |
| `/login` | Login page | Public |
| `/dashboard` | Analytics & metrics | Admin |
| `/products` | Product management | Admin |
| `/categories` | Category management | Admin |
| `/stock` | Stock movements | Admin |
| `/reports` | Sales reports | Admin |
| `/pos` | Cashier checkout | Cashier |
| `/transactions` | Transaction history | Cashier |
| `/receipt/[id]` | Digital receipt | Public |

---

## Database

**Type**: Neon PostgreSQL (Serverless)  
**Connection**: Through `.env.local`  
**Tables**: 6 (users, categories, products, transactions, transaction_items, stock_movements)  
**Status**: ✅ Synced  

---

## Important Files

```
package.json              ← Dependencies (Prisma v6)
.env.local               ← Database connection string
prisma/schema.prisma     ← Database schema
src/middleware.ts        ← Auth routes protection
src/lib/auth.ts          ← NextAuth configuration
src/actions/             ← Server actions (DB operations)
```

---

## When Running New Terminal Commands

Always set DATABASE_URL first:

```powershell
$env:DATABASE_URL = "postgresql://neondb_owner:npg_8rnWZkquK4PI@ep-soft-pond-aqpmm9mp-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

Then run:
- `npm run dev` - Start dev server
- `npm run db:generate` - Regenerate Prisma client
- `npm run db:push` - Sync schema
- `npm run db:seed` - Seed test data
- `npm run db:studio` - Open Prisma Studio

---

## Tech Stack Summary

```
Frontend:  Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
Backend:   Server Actions + Route Handlers
Database:  Prisma v6 ORM
Auth:      NextAuth.js (JWT strategy)
UI:        shadcn/ui + Recharts + TanStack Table
```

---

## Features Overview

✅ Authentication (Admin & Cashier roles)  
✅ Product & Category Management  
✅ Fast POS Cashier Interface  
✅ Shopping Cart with Real-time Calc  
✅ Digital Receipts with QR Codes  
✅ Transaction History & Search  
✅ Stock Movement Tracking  
✅ Sales Analytics & Reports  
✅ Mobile Responsive Design  
✅ Dark/Light Theme Support  

---

## Development Commands

```bash
# Development
npm run dev              # Start dev server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Sync schema with DB
npm run db:seed         # Seed test data
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Full reset (careful!)

# Production
npm run build            # Build for production
npm start               # Start production server

# Linting
npm run lint            # Run ESLint
```

---

## Test Data Included

**Users**: 2 (Admin + Cashier)  
**Categories**: 5 (Minuman, Makanan Ringan, Elektronik, dll)  
**Products**: 21 (various items)  
**Transactions**: 15 (sample sales data)  

---

## Common Issues & Solutions

**Issue**: Database connection error  
**Solution**: Set DATABASE_URL environment variable

**Issue**: "Prisma client not found"  
**Solution**: Run `npm run db:generate`

**Issue**: Schema out of sync  
**Solution**: Run `npm run db:push`

**Issue**: Port 3000 in use  
**Solution**: `npm run dev -- -p 3001`

---

## Documentation Files

- `INSTALLATION_COMPLETE.md` ← You are here
- `GETTING_STARTED.md` - Detailed setup guide
- `PROJECT_SUMMARY.md` - Full project overview
- `SETUP_CHECKLIST.md` - Step-by-step checklist
- `ARCHITECTURE.md` - System architecture details

---

## Next Steps

1. ✅ Test login with both users
2. ✅ Explore the POS interface
3. ✅ Create a test transaction
4. ✅ Check out the digital receipt
5. ✅ Review admin dashboard metrics
6. ✅ Start customizing for your needs!

---

**Status**: 🟢 PRODUCTION READY  
**Version**: 0.1.0  
**Tech**: Next.js 16 + Prisma v6 + Neon  
**Updated**: May 8, 2026
