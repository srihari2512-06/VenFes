# Data Model Documentation

## Collections and Schemas

### 1. User
- `name`: String, required, trim
- `email`: String, required, unique, lowercase, index: true
- `password`: String, required (bcrypt hash, min 6 chars)
- `role`: Enum `['customer', 'vendor', 'admin']`, default: `'customer'`
- `vendorProfile`:
  - `storeName`: String
  - `storeDescription`: String
  - `status`: Enum `['pending', 'approved', 'rejected']`, default: `'pending'`
  - `kycDocumentUrl`: String
  - `rejectionReason`: String
- `refreshTokens`: Array of strings (rotating refresh token support)
- `timestamps`: true

### 2. Product
- `name`: String, required, text indexed
- `description`: String, required, text indexed
- `price`: Number, required, min: 0
- `category`: String, required, indexed
- `vendorId`: ObjectId (ref: User), required, indexed
- `images`: Array of String URLs
- `stock`: Number, required, min: 0, default: 0
- `lowStockThreshold`: Number, default: 5
- `variants`: Array of SubDocuments:
  - `_id`: ObjectId
  - `sku`: String
  - `size`: String
  - `color`: String
  - `price`: Number
  - `stock`: Number, required, min: 0
- `isPublished`: Boolean, default: true, indexed
- `isFlagged`: Boolean, default: false, indexed
- `averageRating`: Number, default: 0
- `numReviews`: Number, default: 0
- Indexes:
  - Text index: `{ name: 'text', description: 'text' }`
  - Compound index: `{ category: 1, price: 1 }`

### 3. Cart
- `userId`: ObjectId (ref: User), unique index
- `items`: Array of:
  - `productId`: ObjectId (ref: Product)
  - `variantId`: ObjectId (nullable)
  - `quantity`: Number, min: 1

### 4. Order (Parent Order)
- `orderNumber`: String, unique index (e.g. `ORD-1728830000000-1234`)
- `customerId`: ObjectId (ref: User), indexed
- `subOrderIds`: Array of ObjectId (ref: SubOrder)
- `totalAmount`: Number, min: 0
- `paymentStatus`: Enum `['pending', 'paid', 'failed', 'refunded']`, default: `'pending'`, indexed
- `paymentMethod`: String, default: `'razorpay'`
- `paymentDetails`: `{ transactionId, orderId, signature }`
- `shippingAddress`: `{ street, city, state, zip, country }`

### 5. SubOrder
- `subOrderNumber`: String, unique index (e.g. `SUB-1728830000000-1234-1`)
- `parentOrderId`: ObjectId (ref: Order), indexed
- `vendorId`: ObjectId (ref: User), indexed
- `customerId`: ObjectId (ref: User), indexed
- `items`: Array of:
  - `productId`: ObjectId (ref: Product)
  - `productName`: String
  - `variantId`: ObjectId
  - `variantSku`: String
  - `variantInfo`: String
  - `price`: Number
  - `quantity`: Number
  - `subtotal`: Number
- `subtotal`: Number
- `commissionRate`: Number (default: 0.10)
- `commissionAmount`: Number
- `vendorPayoutAmount`: Number
- `status`: Enum `['placed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']`, default: `'placed'`, indexed
- `statusHistory`: Array of `{ status, changedAt, changedBy }`

### 6. PayoutLedger
- `vendorId`: ObjectId (ref: User), indexed
- `subOrderId`: ObjectId (ref: SubOrder), indexed
- `amount`: Number (payout amount)
- `commission`: Number
- `status`: Enum `['accrued', 'settled', 'reversed']`, indexed
- `settledAt`: Date
- `settledBy`: ObjectId (ref: User)

### 7. Review
- `productId`: ObjectId (ref: Product), indexed
- `customerId`: ObjectId (ref: User), indexed
- `subOrderId`: ObjectId (ref: SubOrder)
- `rating`: Number (1 to 5)
- `comment`: String
- `isFlagged`: Boolean, default: false
- Unique index: `{ productId: 1, customerId: 1 }`

### 8. ProcessedEvent
- `eventId`: String, unique index
- `eventType`: String
- `payload`: Mixed
- `processedAt`: Date

### 9. AuditLog
- `action`: String
- `actorId`: ObjectId (ref: User)
- `actorRole`: String
- `targetId`: ObjectId
- `targetType`: String
- `details`: Mixed
- `ip`: String
