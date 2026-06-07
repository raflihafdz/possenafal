# 🎯 PossENafal POS - Alur Bisnis Sistem

Dokumentasi High-Level Business Flow untuk sistem POS PossENafal

---

## 📊 Gambaran Umum Sistem

PossENafal adalah sistem Point of Sale (POS) terintegrasi yang memungkinkan:
- **Admin**: Mengelola produk, kategori, stock, dan melihat laporan penjualan
- **Cashier**: Melakukan transaksi penjualan, checkout, dan mencetak receipt

---

## 🔄 Alur Bisnis Utama

### 1️⃣ ONBOARDING PENGGUNA

```
┌──────────────────────────────┐
│   Setup Awal Sistem           │
│                              │
│ Admin Setup:                 │
│ • Buat akun Admin           │
│ • Input kategori produk     │
│ • Input daftar produk       │
│ • Set harga jual/beli       │
│ • Set stock awal            │
│                              │
│ Cashier Setup:              │
│ • Buat akun Cashier         │
│ • Assign ke outlet          │
│ • Training penggunaan       │
└──────────────────────────────┘
```

---

### 2️⃣ KELOLA MASTER DATA (Admin Responsibilities)

#### A. KATEGORI PRODUK
```
Login (Admin) 
  ↓
Menu Kategori 
  ├─ Tambah Kategori Baru (misal: Elektronik, Makanan, dll)
  ├─ Edit Kategori
  ├─ Aktivasi/Deaktivasi Kategori
  └─ Lihat Daftar Kategori Aktif
```

#### B. PRODUK
```
Login (Admin)
  ↓
Menu Produk
  ├─ Tambah Produk:
  │  ├─ Pilih kategori
  │  ├─ Input kode produk (unik)
  │  ├─ Scan/input barcode (opsional)
  │  ├─ Nama produk
  │  ├─ Harga beli (purchase price)
  │  ├─ Harga jual (selling price)
  │  ├─ Stock awal
  │  ├─ Minimum stock threshold
  │  └─ Upload foto produk
  │
  ├─ Edit Produk (update harga, stock, info)
  ├─ Hapus Produk (soft delete - tetap untuk audit)
  └─ Lihat Daftar Semua Produk
```

#### C. STOCK MANAGEMENT
```
Login (Admin)
  ↓
Menu Stock
  ├─ Lihat Stock Semua Produk (real-time)
  ├─ Penyesuaian Stock Manual:
  │  ├─ Stock opname (adjustment)
  │  ├─ Penerimaan barang (IN)
  │  ├─ Pengeluaran non-penjualan (OUT)
  │  └─ Catat alasan penyesuaian
  │
  ├─ View Riwayat Pergerakan Stock (audit trail)
  │  ├─ Jenis pergerakan: IN, OUT, ADJUSTMENT, SALE
  │  ├─ Siapa yang melakukan
  │  ├─ Kapan dilakukan
  │  └─ Stock before/after
  │
  └─ Alert: Produk dengan stock di bawah minimum
```

---

### 3️⃣ TRANSAKSI PENJUALAN (Cashier Responsibilities)

#### A. PROSES CHECKOUT
```
┌─────────────────────────────────────┐
│  CASHIER MEMULAI TRANSAKSI          │
│  (Login → Menu POS)                 │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│  PILIH PRODUK (2 METODE)            │
│                                     │
│  Metode 1: Kategori Browsing        │
│  • Lihat kategori produk            │
│  • Click kategori → lihat produk    │
│  • Click produk → add ke cart       │
│                                     │
│  Metode 2: Search/Barcode Scan      │
│  • Ketik kode/nama produk           │
│  • Scan barcode dengan scanner      │
│  • Produk otomatis masuk cart       │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│  KELOLA CART                        │
│                                     │
│  • Ubah quantity item               │
│  • Hapus item dari cart             │
│  • Lihat subtotal real-time         │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│  INPUT DISCOUNT (OPSIONAL)          │
│                                     │
│  • Discount per item atau total     │
│  • Alasan discount (optional)       │
│  • Kalkulasi ulang grand total      │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│  PROSES PEMBAYARAN                  │
│                                     │
│  Pilih Metode Pembayaran:           │
│  • CASH (Tunai)                     │
│  • DEBIT (Kartu Debit)              │
│  • QRIS (E-wallet)                  │
│  • TRANSFER (Bank Transfer)         │
│                                     │
│  Input Jumlah Pembayaran:           │
│  • Cek apakah >= grand total        │
│  • Kalkulasi kembalian otomatis     │
│  • Warning jika kurang pembayaran   │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│  FINALISASI TRANSAKSI               │
│                                     │
│  1. Sistem membuat Transaction      │
│     record di database              │
│  2. Buat TransactionItem untuk      │
│     setiap produk di cart           │
│  3. Generate nomor invoice unik     │
│  4. Update stock produk otomatis    │
│  5. Buat StockMovement audit        │
│  6. Catat cashier & waktu transaksi│
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│  RECEIPT/INVOICE GENERATION         │
│                                     │
│  • Generate QR code                 │
│  • Tampilkan di screen              │
│  • Opsi cetak receipt               │
│  • Opsi download PDF                │
│  • Opsi kirim via email (future)    │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│  TRANSAKSI SELESAI ✅               │
│                                     │
│  Status: COMPLETED                  │
│  Siap untuk transaksi berikutnya    │
└─────────────────────────────────────┘
```

#### B. DATA TRANSAKSI YANG DISIMPAN
```
Transaction Record:
├─ Invoice Number (unik, auto-generated)
├─ Cashier (user yang melakukan)
├─ Tanggal & waktu
├─ Daftar item:
│  ├─ Nama produk
│  ├─ Harga satuan
│  ├─ Quantity
│  ├─ Discount per item
│  └─ Subtotal per item
├─ Total amount (sebelum diskon)
├─ Discount (total)
├─ Grand total (total bayar)
├─ Jumlah pembayaran dari customer
├─ Kembalian
├─ Metode pembayaran
└─ Notes/keterangan tambahan (optional)
```

---

### 4️⃣ STOCK OTOMATIS BERKURANG

```
Saat Transaksi Berhasil:

Produk A: qty 2 dipesan
  ├─ Stock sebelum: 50 unit
  ├─ Dikurangi: -2 unit (SALE)
  ├─ Stock sesudah: 48 unit
  └─ Catat di StockMovement:
     ├─ Type: SALE
     ├─ Quantity: 2
     ├─ StockBefore: 50
     ├─ StockAfter: 48
     ├─ ReferenceId: invoice_number
     └─ Timestamp: [waktu transaksi]

⚠️ Alert otomatis jika stock < minimum:
   └─ "Produk X stock sudah di bawah minimum"
```

---

### 5️⃣ LAPORAN & ANALITIK (Admin Dashboard)

#### A. DASHBOARD METRICS
```
Admin melihat ringkasan harian:
├─ Total penjualan hari ini (Rp)
├─ Jumlah transaksi hari ini
├─ Produk paling laris
├─ Metode pembayaran terbanyak
├─ Rata-rata transaksi
└─ Top 5 products sold
```

#### B. SALES REPORT
```
Menu Reports:
├─ Filter by date range
├─ Filter by payment method
├─ Filter by cashier (siapa yg checkout)
├─ Download sebagai PDF/Excel
│
└─ Data ditampilkan:
   ├─ Nomor invoice
   ├─ Tanggal & waktu
   ├─ Cashier name
   ├─ Daftar item & qty
   ├─ Total amount
   ├─ Metode pembayaran
   └─ Status transaksi
```

#### C. TRANSACTION HISTORY
```
Menu Transactions:
├─ Lihat semua transaksi (sorted by date)
├─ Search by invoice number
├─ Filter by date range
├─ Filter by payment method
├─ Filter by status (COMPLETED/CANCELLED)
│
└─ Aksi:
   ├─ View detail transaksi
   ├─ Print receipt ulang
   ├─ Download receipt PDF
   └─ Cancel transaksi (future feature)
```

---

## 🔐 Access Control / Otorisasi

```
┌─────────────────────────────────────────────────────────┐
│                   ADMIN ACCESS                          │
├─────────────────────────────────────────────────────────┤
│ ✅ Dashboard (view metrics & charts)                    │
│ ✅ Kategori (CRUD)                                      │
│ ✅ Produk (CRUD)                                        │
│ ✅ Stock Management (view & adjustment)                 │
│ ✅ Reports & Analytics                                  │
│ ✅ Transactions (view only)                             │
│ ✅ User Management (future)                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  CASHIER ACCESS                         │
├─────────────────────────────────────────────────────────┤
│ ✅ POS Checkout (create transaction)                    │
│ ✅ View Own Transactions                                │
│ ✅ Print Receipt                                        │
│ ❌ Cannot access Dashboard                              │
│ ❌ Cannot manage Products/Categories/Stock              │
│ ❌ Cannot see other cashier's transactions (future)     │
└─────────────────────────────────────────────────────────┘
```

---

## 💾 Data Storage & Persistence

```
Database Tables (Neon PostgreSQL):

1. users
   ├─ Admin & Cashier accounts
   ├─ Password tersimpan bcrypt (hashed)
   └─ Role-based access

2. categories
   ├─ Daftar kategori produk
   └─ Can activate/deactivate

3. products
   ├─ Master produk
   ├─ Harga jual/beli
   ├─ Stock real-time
   ├─ Foto produk
   └─ Barcode (optional)

4. transactions
   ├─ Setiap checkout menjadi record
   ├─ Nomor invoice (unique)
   ├─ Payment method
   ├─ Discount & amount
   └─ Permanent record (audit trail)

5. transaction_items
   ├─ Detail setiap item di transaksi
   ├─ Quantity & harga saat transaksi
   ├─ Discount per item
   └─ Linked to transaction & product

6. stock_movements
   ├─ Audit trail lengkap stock
   ├─ Setiap perubahan dicatat
   ├─ Type: IN, OUT, ADJUSTMENT, SALE
   ├─ Stock before & after
   └─ Siapa & kapan perubahan
```

---

## 🔄 Alur Integrasi Sistem

```
CUSTOMER TRANSACTION FLOW:
Customer masuk toko
         ↓
Cashier scan/select produk
         ↓
Produk ditambah ke cart
         ↓
Customer review pesanan
         ↓
Cashier input discount (if any)
         ↓
Customer memilih metode pembayaran
         ↓
Cashier input jumlah pembayaran
         ↓
[SERVER ACTION: createTransaction]
         ├─ Insert transaction record
         ├─ Insert transaction_items
         ├─ Generate invoice number
         ├─ Update product stock
         ├─ Create stock_movement records
         └─ Return transaction data
         ↓
Receipt generated + QR code
         ↓
Cetak atau download receipt
         ↓
Transaksi selesai ✅
```

---

## 📈 Business Insights yang Bisa Dilihat

### Dari Dashboard:
- Total revenue hari ini/minggu/bulan
- Produk best seller
- Jam-jam peak sales
- Metode pembayaran preferensi customer
- Average transaction value

### Dari Reports:
- Trend penjualan over time
- Performance per cashier
- Payment method breakdown
- Stock performance
- Discount patterns

### Dari Stock Movement:
- Inventory accuracy
- Loss tracking
- Adjustment patterns
- Supplier performance (if integrated)

---

## ⚠️ Business Rules & Constraints

```
1. PRODUK
   ├─ Kode produk harus unik
   ├─ Barcode bisa duplikat/kosong (optional)
   ├─ Harga jual tidak boleh < harga beli
   ├─ Stock tidak boleh negative
   └─ Kategori harus aktif untuk create produk

2. TRANSAKSI
   ├─ Pembayaran harus >= grand total
   ├─ Minimal 1 item dalam transaksi
   ├─ Invoice number auto-generated & unik
   ├─ Discount tidak boleh > grand total
   └─ Hanya cashier & admin bisa create

3. STOCK
   ├─ Stock adjustment harus via StockMovement
   ├─ Setiap penjualan auto-update stock
   ├─ Minimum stock alert jika qty < threshold
   ├─ Stock opname untuk reconciliation
   └─ History tercatat permanent (audit trail)

4. USER
   ├─ Email unique
   ├─ Password min 6 character (bcrypt hashed)
   ├─ Role: ADMIN atau CASHIER
   ├─ Status: active/inactive (soft delete)
   └─ Session timeout: 24 hours
```

---

## 🎯 Key Performance Indicators (KPIs)

Bisnis bisa monitor melalui sistem:

```
SALES:
├─ Daily Revenue (Rp)
├─ Transaction Count
├─ Average Transaction Value
└─ Revenue Growth %

PRODUCTS:
├─ Top 5 Best Sellers
├─ Slow Moving Items
├─ Stock Turn Rate
└─ Margin by Product

EFFICIENCY:
├─ Transaction Time (checkout duration)
├─ Payment Method Distribution
├─ Discount Impact
└─ Cashier Productivity

OPERATIONS:
├─ Stock Accuracy
├─ Low Stock Alerts
├─ Adjustment Frequency
└─ Inventory Value
```

---

## 🔄 Workflow Ringkas (30 detik)

```
┌─ SETUP (Admin) ────────────────────────────┐
│ Kategori → Produk → Harga → Stock awal    │
└────────────────────────────────────────────┘
           ↓
┌─ DAILY OPERATION (Cashier) ────────────────┐
│ POS → Select Produk → Checkout → Receipt  │
│     ↓                                      │
│   Stock auto berkurang                    │
│   Invoice disimpan permanent              │
│   Stock Movement dicatat                  │
└────────────────────────────────────────────┘
           ↓
┌─ ANALYTICS (Admin) ────────────────────────┐
│ Dashboard → Reports → Insights            │
│ Monitor penjualan, stock, performa        │
└────────────────────────────────────────────┘
```

---

## 📱 Teknologi yang Mendukung Alur Ini

```
Frontend:     React 19 → Interaksi user smooth & real-time
Next.js:      Route handling & server actions
Database:     PostgreSQL → Data persistent & relational
ORM (Prisma): Query simple & type-safe
Auth:         NextAuth → Session management secure
UI:           Tailwind CSS → Interface modern & responsive
```

---

**Dokumen ini menjelaskan alur bisnis dari perspektif high-level tanpa masuk ke teknis implementasi kode. Fokus pada: APA yang terjadi, SIAPA yang melakukan, dan KAPAN terjadi dalam sistem.**
