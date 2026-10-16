# Venfes - Multi-Vendor E-Commerce Platform with Analytics

> Full-Stack College Project (MERN) for Department of Information Technology, Easwari Engineering College. Built under the Ponytail method (lazy senior developer discipline: minimal code, zero dead code, atomic transactions, no cutting of validation or security).

---

## 1. Overview & Key Differentiators

Venfes is an online marketplace platform hosting multiple independent vendors with unified customer discovery and single checkout.

### 🌟 Differentiator 1: Atomic Cart-Splitting Checkout (`FR-16` to `FR-20`)
A customer can place items from multiple independent vendors into a single cart. Upon checkout:
- Prices and stock availability are strictly verified server-side.
- The order is split into **1 Parent Order** (customer total) and **N Sub-Orders** (one per vendor).
- Stock decrements atomically inside a **MongoDB Transaction** (replica set/Atlas); if any item fails or stock runs out, the transaction aborts and rolls back completely with zero side-effects.

### 🌟 Differentiator 2: Real Aggregation Pipeline Analytics (`FR-25` to `FR-29`, `FR-41`)
Dashboards are computed directly from real transactional MongoDB aggregation pipelines:
- **Vendor Dashboard:** Scoped sales trends, daily revenue breakdown, and top-performing products.
- **Admin Dashboard:** Gross Merchandise Value (GMV), active approved vendors, category revenue distribution, and customer cohort retention analysis (`FR-41`).
- **Live Feed over Socket.io (`FR-28`, `S6`):** Authenticated WebSocket rooms broadcast new orders to the administrator live without page refresh.

---

## 2. Technology Stack

- **Frontend:** React 18, Vite, Lucide Icons, Socket.io Client
- **Backend:** Node.js 22, Express 4, Socket.io, Multer, Helmet, CORS
- **Database:** MongoDB Atlas / Replica Set via Mongoose 8
- **Authentication:** JWT Access Token + HTTP-Only Rotating Refresh Token Cookie + Role Middleware (`customer`, `vendor`, `admin`)
- **Payments:** Swappable Gateway Interface (Razorpay Test Mode / Simulated Payment Verification)
- **Testing:** Native `node:test` + `node:assert` + `mongodb-memory-server` (Zero external test runner bloat)

---

## 3. Project Structure

```
├── client/                     # Vite + React SPA
│   ├── src/
│   │   ├── context/            # AuthContext, CartContext
│   │   ├── components/         # Navbar, Layout
│   │   ├── pages/              # Catalog, ProductDetail, CartPage, OrdersPage, WishlistPage, VendorPortal, AdminPortal, AuthPages
│   │   ├── App.jsx
│   │   └── index.css           # Design tokens (NFR-14)
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express API & Socket.io Server
│   ├── src/
│   │   ├── config/             # env.js, db.js
│   │   ├── controllers/        # auth, product, cart, order, vendorAdmin, engagement, analytics
│   │   ├── middleware/         # auth, errorHandler, rateLimit
│   │   ├── models/             # User, Product, Order, SubOrder, Cart, PayoutLedger, Review, Engagement, ProcessedEvent, AuditLog, PlatformSetting
│   │   ├── routes/             # auth, product, cart, order, vendorAdmin, engagement, analytics, upload
│   │   ├── services/           # checkoutService, paymentService, socketService, cacheService, emailService
│   │   ├── utils/              # token.js, csvParser.js
│   │   ├── app.js
│   │   ├── server.js
│   │   └── seed.js             # Realistic demo data seeder
│   ├── tests/                  # Automated test suites (S1, S2, S3, S4, S10, S11, S12, S15, FR-06, FR-21)
│   └── package.json
├── docs/                       # Architecture & compliance specifications
│   ├── data-model.md
│   ├── api-spec.md
│   ├── design-system.md
│   ├── security-checklist.md
│   └── verification-checklist.md
├── .github/workflows/ci.yml     # Automated CI pipeline
├── project.md / prd.md / srs.md / skill.md
└── package.json
```

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js >= 20.x (tested on Node v22.18.0)
- npm >= 10.x
- MongoDB Atlas or local MongoDB replica set

### Installation
```bash
# Clone and install dependencies
cd server && npm install
cd ../client && npm install
```

### Environment Configuration
Copy `.env.example` in `server/.env` or root:
```bash
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/venfes?replicaSet=rs0
JWT_ACCESS_SECRET=your_jwt_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_chars
COOKIE_SECRET=your_cookie_secret_min_32_chars
RAZORPAY_KEY_ID=rzp_test_mock_key
RAZORPAY_KEY_SECRET=rzp_test_mock_secret
```

### Run Tests
```bash
# Runs full test suite using in-memory MongoDB replica set
npm test
```

### Seed Demo Data
```bash
npm run seed
```

### Start Development
```bash
# Terminal 1: Backend API
npm run server:dev

# Terminal 2: Frontend Client
npm run client:dev
```
Open `http://localhost:5173` in your browser.

---

## 5. Demo Review Credentials

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Admin** | `admin@venfes.com` | `admin123` | Vendor KYC approvals, commission configuration, payout settlements, content moderation, live Socket.io feed |
| **Vendor 1** | `vendor@venfes.com` | `vendor123` | Apex Audio store, product CRUD, variants, stock alerts, CSV bulk upload, sub-order pipeline, revenue analytics |
| **Vendor 2** | `fashion@venfes.com` | `vendor123` | Urban Silhouette store, apparel & trail runners |
| **Customer** | `customer@venfes.com` | `customer123` | Multi-vendor cart, atomic checkout, order tracking, verified purchase reviews |

---

## 6. Verification Matrix (S1 - S17)

All 17 success criteria from `prd.md` are verified and passing:
- **S1:** 3-vendor cart produces 1 parent order + 3 sub-orders with accurate line items.
- **S2:** Mid-checkout failures roll back transaction without stock changes.
- **S3:** Ownership check restricts Vendor A from modifying Vendor B's resources (HTTP 403).
- **S4:** Unauthenticated requests rejected with HTTP 401.
- **S5:** Aggregations matched against raw DB queries.
- **S6:** Socket.io room broadcasts live checkout events.
- **S7:** Responsive end-to-end user journeys tested.
- **S8:** Clean, logical Git commit history.
- **S9:** `.env` git-ignored and never committed.
- **S10:** CSV bulk upload validates rows and reports line-numbered errors.
- **S11:** Sub-order refund atomically restores stock and reverses commission/ledger.
- **S12:** Idempotent webhook handling with stored event IDs (`ProcessedEvent`).
- **S13:** Product reviews restricted strictly to verified delivered purchases.
- **S14:** Non-blocking resilient customer notifications.
- **S15:** Analytics caching with TTL and automatic fallback.
- **S16:** GitHub Actions CI workflow config (`.github/workflows/ci.yml`).
- **S17:** Zero high/critical vulnerabilities via `npm audit`.
