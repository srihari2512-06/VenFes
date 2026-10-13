# Security Checklist (P10.1, NFR-01 to NFR-08)

| Route / Component | Threat Model | Mitigation Implemented |
|---|---|---|
| `POST /api/auth/register` | Privilege Escalation, Mass Assignment | Whitelisted roles (only `customer` or `vendor`; `admin` cannot be self-registered) |
| `POST /api/auth/login` | Brute Force, Credential Stuffing | In-memory rate limiting (20 req / 15 min), Bcrypt salted hash comparison |
| `POST /api/auth/refresh` | Token Theft, Replay | Refresh token rotation in `httpOnly`, `secure` cookie; invalidated after use |
| `GET /api/products` | NoSQL Injection, Denial of Service | Strict query sanitization, pagination limits (max 50 per page) |
| `POST /api/products` | Unauthorized catalog tampering | `requireAuth` + `requireRole('vendor')` + `requireApprovedVendor`; `vendorId` forced from session |
| `PUT /api/products/:id` | IDOR / Cross-vendor product alteration | Strict ownership verification: `assertOwnership(product.vendorId, req.user)` |
| `POST /api/orders/checkout` | Price Tampering, Stock Race Condition | Prices fetched strictly from DB, atomic stock decrement in MongoDB transaction (rollback on fail) |
| `POST /api/orders/payments/webhook` | Webhook Spoofing, Replay Attack | Signature verification and `ProcessedEvent` table for idempotency |
| `POST /api/orders/sub-orders/:id/status` | Invalid state transitions | Enforced server-side transition state machine |
| `POST /api/orders/sub-orders/:id/refund` | Double Refund, Unauthorized Refund | Admin-only role, atomic stock restoration, ledger reversal, audit log recorded |
| `POST /api/upload` | Malicious File Execution, Zip Bomb | Strict mime-type filter (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`), 5MB cap |
| Global Headers | Clickjacking, MIME sniffing, XSS | `helmet()` enabled on all Express routes |
