# Architecture Overview - PossENafal POS

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│  Next.js 16.2.5 (React 19) + TypeScript + Tailwind CSS 4   │
│  - Pages (App Router)                                        │
│  - Components (shadcn/ui)                                    │
│  - Forms (React Hook Form + Zod)                             │
│  - Tables (TanStack Table)                                   │
│  - Charts (Recharts)                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   API LAYER                                  │
│  Next.js Server Actions + Route Handlers                     │
│  - /src/actions/* (Server Actions)                           │
│  - /src/app/api/* (Route Handlers)                           │
│  - NextAuth API Routes                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC                              │
│  - Prisma ORM (v6)                                           │
│  - Validation (Zod Schemas)                                  │
│  - Authentication (NextAuth)                                 │
│  - Authorization (Middleware)                                │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE LAYER                               │
│  Neon PostgreSQL                                             │
│  - 6 Main Tables (users, categories, products, etc.)         │
│  - Relationships & Cascade Rules                             │
│  - Automatic Timestamps (createdAt, updatedAt)               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Transaction Example

```
1. CASHIER SELECTS PRODUCTS
   ├─ Frontend: Search/barcode input
   └─ Server Action: getProducts() → Database Query

2. ITEM ADDED TO CART
   ├─ Frontend: Cart state management
   └─ Real-time: Subtotal calculation

3. CHECKOUT INITIATED
   ├─ Frontend: Payment form submission
   └─ Server Action: createTransaction()

4. TRANSACTION CREATED
   ├─ Database: Transaction record + TransactionItem records
   ├─ Stock Update: Reduce inventory
   ├─ Stock Movement: Log audit trail
   └─ Invoice: Generate invoice number

5. RECEIPT GENERATED
   ├─ QR Code: Generated on client (qrcode.react)
   ├─ Receipt Page: /receipt/[invoiceNumber]
   └─ Customer: Can print/download/share
```

## Authentication Flow

```
LOGIN PAGE
   ↓
Submit Credentials (email, password)
   ↓
Server Action: validateCredentials()
   ├─ Find user in DB
   ├─ Compare password with bcrypt
   └─ Return user data + role

JWT Token Generated
   ├─ Contains: user.id, user.role, user.isActive
   ├─ Strategy: JWT (24-hour expiration)
   └─ Storage: Secure HTTP-only cookie

Session Created
   ├─ Frontend: Can access session.user
   ├─ Backend: Can access req.auth
   └─ Middleware: Validates on every request

Protected Routes
   ├─ Admin: /dashboard, /products, /categories, /stock, /reports
   ├─ Cashier: /pos, /transactions
   └─ Public: /login, /receipt
```

## File Structure & Responsibilities

```
src/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home (redirects to dashboard/pos)
│   ├── login/page.tsx           # Login page
│   ├── receipt/[invoiceNumber]/ # Public receipt page
│   ├── (dashboard)/             # Grouped protected admin routes
│   │   ├── layout.tsx           # Dashboard layout
│   │   ├── dashboard/           # Admin dashboard
│   │   ├── categories/          # Category management
│   │   ├── products/            # Product management
│   │   ├── stock/               # Stock management
│   │   ├── reports/             # Sales reports
│   │   └── transactions/        # Transaction history
│   └── api/
│       └── auth/[...nextauth]/  # NextAuth routes
│
├── actions/                      # Server Actions (DB operations)
│   ├── auth.ts                  # Login/Auth actions
│   ├── products.ts              # Product CRUD + search
│   ├── categories.ts            # Category CRUD
│   ├── stock.ts                 # Stock movements
│   ├── transactions.ts          # Transaction CRUD
│   └── dashboard.ts             # Dashboard metrics
│
├── components/
│   ├── layout/                  # Layout components
│   │   ├── dashboard-layout.tsx # Sidebar + navbar
│   │   ├── navbar.tsx
│   │   └── sidebar.tsx
│   ├── shared/                  # Reusable components
│   │   ├── data-table.tsx       # TanStack table wrapper
│   │   ├── empty-state.tsx
│   │   ├── loading-skeletons.tsx
│   │   ├── stats-card.tsx
│   │   └── toaster.tsx
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       ├── table.tsx
│       └── ... (other UI components)
│
├── lib/
│   ├── auth.ts                  # NextAuth configuration
│   ├── prisma.ts                # Prisma singleton instance
│   └── utils.ts                 # Helper functions
│
├── schemas/
│   └── index.ts                 # Zod validation schemas
│
├── middleware.ts                # NextAuth + route protection
│
└── utils/
    └── index.ts                 # General utilities

prisma/
├── schema.prisma                # Database schema (6 tables)
└── seed.ts                      # Database seeding
```

## Database Relationships

```
User (1) ─────── (N) Transaction
  │                   │
  ├─ isActive        └─ transactionItems (cascade delete)
  │                      └─ Product
  └─ StockMovement

Category (1) ───── (N) Product
                      │
                      ├─ TransactionItem
                      ├─ StockMovement
                      └─ minStock (warning threshold)

Transaction (1) ─── (N) TransactionItem
                        ├─ Product
                        └─ productName (denormalized for history)
```

## Key Technologies & Why

| Technology | Purpose | Why Used |
|-----------|---------|----------|
| **Next.js 16** | Full-stack framework | Server actions, optimized routing, edge functions |
| **TypeScript** | Type safety | Catch errors early, better IDE support |
| **Prisma v6** | Database ORM | Type-safe queries, migrations, relations |
| **Neon PostgreSQL** | Database | Serverless, auto-scaling, free tier |
| **NextAuth.js** | Authentication | JWT sessions, credentials provider, middleware |
| **React Hook Form** | Form management | Performance, minimal re-renders |
| **Zod** | Validation | Type inference, composable schemas |
| **TanStack Table** | Data tables | Headless, flexible, powerful sorting/filtering |
| **shadcn/ui** | UI components | Accessible, customizable, Tailwind-based |
| **Recharts** | Charts | React-friendly, responsive, interactive |
| **bcryptjs** | Password hashing | Secure password storage |
| **QRCode** | Receipt sharing | Easy QR generation for digital receipts |

## Security Measures Implemented

✅ **Password Security**
- Bcrypt hashing with salt rounds
- Never store plain-text passwords

✅ **Authentication**
- JWT tokens with 24-hour expiration
- Secure HTTP-only cookies
- NextAuth middleware validation

✅ **Authorization**
- Role-based access control (ADMIN, CASHIER)
- Route protection via middleware
- Server-side validation on all actions

✅ **Database**
- SQL injection prevention (Prisma parameterized queries)
- Data validation with Zod schemas
- Cascade deletes to prevent orphaned records

✅ **API Security**
- Server Actions only (no exposed endpoints by default)
- CSRF protection (NextAuth built-in)
- Type-safe arguments

## Scalability Considerations

✅ **Database**
- Neon provides auto-scaling & connection pooling
- Indexed fields (unique email, category name, product code/barcode)
- Efficient queries with pagination

✅ **Frontend**
- Component-based architecture
- Lazy loading pages
- Optimized images
- CSS-in-JS (Tailwind, shadcn/ui)

✅ **Backend**
- Server Actions (no HTTP overhead)
- Database query optimization
- Pagination for large datasets
- Reusable action functions

✅ **Caching**
- Next.js revalidatePath() for ISR
- Client-side query deduplication
- Browser cache headers

---

**Architecture Follows**:
- ✅ Clean Architecture (separation of concerns)
- ✅ DRY Principle (reusable components & actions)
- ✅ SOLID Principles (single responsibility)
- ✅ Modern React patterns (hooks, server components)
