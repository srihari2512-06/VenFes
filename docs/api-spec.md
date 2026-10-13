# API Specification

Base URL: `/api`

## Error Response Envelope
Every error returns HTTP status >= 400 with:
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Human readable description",
    "details": null
  }
}
```

## 1. Authentication (`/api/auth`)
- `POST /register`: Register user `{ name, email, password, role?: 'customer'|'vendor', storeName?: string, storeDescription?: string }` -> 201 `{ success: true, data: { user, accessToken } }`
- `POST /login`: Log in `{ email, password }` -> 200 `{ success: true, data: { user, accessToken } }`
- `POST /refresh`: Rotate refresh token (via cookie `refreshToken` or body) -> 200 `{ success: true, data: { accessToken, user } }`
- `POST /logout`: Clear token cookie & invalidate -> 200 `{ success: true }`
- `GET /me`: Get current user -> 200 `{ success: true, data: { user } }`

## 2. Products (`/api/products`)
- `GET /`: List products (query: `page, limit, search, category, minPrice, maxPrice, vendorId`) -> 200 `{ success: true, data: { products, pagination } }`
- `GET /:id`: Get single product -> 200 `{ success: true, data: { product } }`
- `POST /`: Create product (Vendor only) -> 201 `{ success: true, data: { product } }`
- `PUT /:id`: Update product (Vendor/Admin) -> 200 `{ success: true, data: { product } }`
- `DELETE /:id`: Delete product (Vendor/Admin) -> 200 `{ success: true }`
- `POST /bulk-csv`: Bulk CSV upload (Vendor only) -> 200 `{ success: true, data: { totalProcessed, importedCount, errors } }`
- `GET /vendor/mine`: Vendor's own products -> 200 `{ success: true, data: { products } }`
- `GET /vendor/low-stock`: Vendor low stock alerts -> 200 `{ success: true, data: { products, count } }`

## 3. Cart (`/api/cart`)
- `GET /`: Get active cart -> 200 `{ success: true, data: { cart } }`
- `POST /add`: Add item `{ productId, variantId?, quantity }` -> 200 `{ success: true, data: { cart } }`
- `PUT /items/:itemId`: Update quantity `{ quantity }` -> 200 `{ success: true, data: { cart } }`
- `DELETE /items/:itemId`: Remove item -> 200 `{ success: true, data: { cart } }`

## 4. Orders & Checkout (`/api/orders`)
- `POST /checkout`: Cart split checkout `{ items, shippingAddress, paymentMethod }` -> 201 `{ success: true, data: { order, subOrders, paymentOrder } }`
- `POST /confirm-payment`: Confirm payment `{ orderId, paymentId, signature }` -> 200 `{ success: true, data: { order } }`
- `POST /payments/webhook`: Webhook handler with signature & idempotency -> 200 `{ success: true }`
- `GET /customer`: Customer order history -> 200 `{ success: true, data: { orders } }`
- `GET /vendor/sub-orders`: Vendor sub-orders -> 200 `{ success: true, data: { subOrders } }`
- `PUT /sub-orders/:id/status`: Update status `{ status }` -> 200 `{ success: true, data: { subOrder } }`
- `POST /sub-orders/:id/refund`: Admin refund sub-order -> 200 `{ success: true, data: { subOrder } }`

## 5. Vendor & Admin Management (`/api/vendors`)
- `POST /kyc/apply`: Vendor KYC submit -> 200 `{ success: true, data: { vendorProfile } }`
- `GET /admin/vendors`: Admin list vendors -> 200 `{ success: true, data: { vendors } }`
- `PUT /admin/vendors/:id/status`: Admin approve/reject vendor -> 200 `{ success: true, data: { vendor } }`
- `GET /finance/commission`: Current platform commission -> 200 `{ success: true, data: { commissionRate } }`
- `PUT /finance/commission`: Update commission -> 200 `{ success: true, data: { commissionRate } }`
- `GET /finance/ledger`: Payout ledger -> 200 `{ success: true, data: { ledger } }`
- `PUT /finance/ledger/:id/settle`: Settle ledger entry -> 200 `{ success: true, data: { entry } }`
- `GET /admin/audit-logs`: Audit logs -> 200 `{ success: true, data: { logs } }`

## 6. Engagement (`/api/engagement`)
- `POST /reviews`: Create verified review `{ productId, rating, comment }` -> 201 `{ success: true, data: { review } }`
- `GET /reviews/:productId`: Product reviews -> 200 `{ success: true, data: { reviews } }`
- `GET /wishlist`: Customer wishlist -> 200 `{ success: true, data: { wishlist } }`
- `POST /wishlist/toggle`: Toggle item in wishlist `{ productId }` -> 200 `{ success: true, data: { inWishlist } }`
- `POST /flag`: Flag product or review -> 201 `{ success: true, data: { flag } }`
- `GET /admin/moderation`: Moderation queue -> 200 `{ success: true, data: { flags } }`
- `PUT /admin/moderation/:id`: Resolve flag -> 200 `{ success: true, data: { flag } }`

## 7. Analytics (`/api/analytics`)
- `GET /vendor`: Vendor sales trend, revenue, top products (cached 60s) -> 200 `{ success: true, data }`
- `GET /admin`: Admin GMV, active vendors, category stats, cohort retention (cached 60s) -> 200 `{ success: true, data }`

## 8. Uploads (`/api/upload`)
- `POST /`: Multipart file upload (max 5MB) -> 200 `{ success: true, data: { url, fileName, size } }`
