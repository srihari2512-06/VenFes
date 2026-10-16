# SRS: Multi-Vendor E-Commerce Platform with Analytics

Status: Draft v1. Based on `prd.md`. Requirements are testable ("shall"). Details the chat never fixed (schemas, endpoint paths, limits) are **TBD** and must be decided and recorded in `docs/` at Phase 0/1, not invented per file.

## 1. Introduction
- **Purpose:** specify behavior and quality of the MERN marketplace.
- **Scope:** see `prd.md` sections 3 and 5.
- **Definitions:** GMV = gross merchandise value. Sub-order = the part of an order belonging to one vendor. Ledger = recorded payout entries with no real transfer.

## 2. Overall description
- Web application: React client, Express REST API, MongoDB Atlas, Socket.io channel.
- External services: Cloudinary (images), payment gateway in test mode (D1), optional Redis.
- Users: Admin, Vendor, Customer.
- Environment: Node.js server; modern evergreen browsers. Versions **TBD**; pin real versions at scaffold time and verify they exist.

## 3. Functional requirements

### Auth and access
- **FR-01** The system shall register and log in users with a role of admin, vendor or customer.
- **FR-02** The system shall issue a short-lived access JWT and a refresh token; the refresh token shall be stored in an `httpOnly`, `secure` cookie and rotated on use.
- **FR-03** The system shall reject unauthenticated requests to protected routes with 401.
- **FR-04** The system shall reject authenticated requests lacking the required role with 403.
- **FR-05** The system shall verify resource ownership; a vendor shall not read or modify another vendor's products or sub-orders (403).
- **FR-06** Passwords shall be stored only as salted hashes (algorithm choice TBD, recorded in `docs/`).

### Vendors
- **FR-07** A user shall be able to apply as a vendor with store details; status starts as `pending`.
- **FR-08** An admin shall approve or reject vendor applications; only approved vendors can publish products.
- **FR-09** A vendor shall create, read, update and delete their own products with images.
- **FR-10** The system shall track stock per product and flag low stock (threshold TBD).
- **FR-11** A vendor shall accept, reject or ship their own sub-orders; allowed status transitions shall be defined in one place and enforced server-side.

### Customer and catalog
- **FR-12** The system shall list products from all approved vendors with pagination.
- **FR-13** The system shall support search and filters (category, price range, vendor).
- **FR-14** A customer shall maintain a cart containing items from multiple vendors.
- **FR-15** A customer shall view order history with per-sub-order status.

### Checkout (core)
- **FR-16** On checkout the system shall group cart items by vendor and create one parent order and one sub-order per vendor.
- **FR-17** Stock validation and decrement, and creation of the parent order and all sub-orders, shall execute in a single MongoDB transaction.
- **FR-18** If any step fails, the system shall roll back and leave stock and orders unchanged, and return a clear error.
- **FR-19** The system shall not allow stock to go below zero under concurrent checkouts.
- **FR-20** Prices and totals shall be computed server-side from stored product data, never trusted from the client.
- **FR-21** Payment shall go through a gateway interface so the provider can be swapped (D1); confirmations/webhooks shall be signature-verified.
- **FR-22** The system shall record a commission per sub-order and a vendor payout ledger entry. No real transfer.

### Admin
- **FR-23** An admin shall set the platform commission rate (granularity TBD).
- **FR-24** An admin shall view vendors, orders and flagged content, and act on flags (hide/restore/remove).

### Analytics
- **FR-25** The vendor dashboard shall show sales trend, top products and revenue over time for that vendor only.
- **FR-26** The admin dashboard shall show GMV, active vendors and category performance.
- **FR-27** Analytics shall be computed with MongoDB aggregation pipelines over order data.
- **FR-28** New orders shall be pushed to the admin dashboard in real time via Socket.io; sockets shall authenticate before joining rooms.
- **FR-29** Analytics endpoints shall be cached in Redis with an explicit invalidation or TTL rule; the system shall work (uncached) if Redis is down.

### Catalog extensions (100% scope)
- **FR-30** Products shall support variants (size/color) with per-variant price (optional) and stock; the cart and checkout shall operate on variants.
- **FR-31** A customer shall be able to review a product only after a delivered sub-order containing it, once per purchase; ratings shall aggregate per product.
- **FR-32** Wishlist and recently-viewed shall persist per customer.
- **FR-33** A vendor shall bulk-upload products by CSV; each row shall be validated, valid rows imported, invalid rows listed with a reason; file size and row count capped (limits TBD).
- **FR-34** The system shall alert vendors when stock falls to the low-stock threshold.

### Notifications
- **FR-35** The system shall email the customer on order confirmation and on each sub-order status change, via a provider (D10). Failures shall be logged and retried or surfaced, not silently dropped, and shall never block checkout.

### Money flows
- **FR-36** Webhook/event processing shall be idempotent (store processed event IDs).
- **FR-37** Refunds shall be possible for a whole order or a single sub-order; each refund shall restore stock in a transaction, reverse the commission and ledger entry, and be auditable.
- **FR-38** Vendor payouts shall be computed from delivered sub-orders minus commission; transfer is real if supported (D9), otherwise an admin marks the ledger entry settled.

### Moderation and admin
- **FR-39** Users shall be able to flag products and reviews; admins shall review a moderation queue.
- **FR-40** Admins shall review vendor KYC submissions (mock documents allowed).

### Analytics extension
- **FR-41** The admin dashboard shall show a cohort/retention view computed by aggregation.

### Audit
- **FR-42** Sensitive actions (approval, commission change, refund, payout settlement, moderation) shall be written to an audit log with actor and time.

## 4. Non-functional requirements

### Security
- **NFR-01** All inputs shall be validated server-side with a schema validator (library TBD, verified at install).
- **NFR-02** Mass-assignment shall be prevented; clients cannot set role, price, stock or status directly.
- **NFR-03** Rate limiting on auth routes and sensitive endpoints; limits TBD.
- **NFR-04** Security headers, strict CORS allowlist, and no wildcard origins in production.
- **NFR-05** Secrets only in environment variables; `.env` is git-ignored and never in history; an `.env.example` is committed.
- **NFR-06** NoSQL-injection and XSS defenses on inputs and rendered content; uploads restricted by type and size.
- **NFR-07** Dependencies checked with `npm audit` before each deploy.
- **NFR-08** Errors returned in one consistent shape; stack traces never exposed in production.

### Reliability and correctness
- **NFR-09** Checkout atomicity per FR-17 to FR-19.
- **NFR-10** Health-check endpoint available (path TBD, Phase 0).

### Performance (targets TBD, to be measured not assumed)
- **NFR-11** List and analytics endpoints use indexes; index choices recorded in the data model doc. Numeric latency targets: TBD.

### Usability and accessibility
- **NFR-12** Every screen has loading, empty and error states.
- **NFR-13** Accessible basics: labels on inputs, keyboard operability, sufficient contrast, alt text.
- **NFR-14** Consistent design tokens (spacing, type, color) across pages.

### Maintainability
- **NFR-15** Domain-specific naming; no commented-out dead code; no placeholder copy.
- **NFR-16** Small logical commits; one test minimum for logic with branches, loops, parsers, money or security.
- **NFR-17** Deliberate shortcuts are marked `shortcut:` with when to revisit (Ponytail convention).

### Quality (100% scope)
- **NFR-19** Automated tests cover checkout rollback, ownership/authorization, refund, idempotency, CSV validation and analytics correctness; coverage target TBD (measured, not assumed).
- **NFR-20** CI (GitHub Actions) runs lint, tests and `npm audit` on each push/PR.
- **NFR-21** Structured logging with request IDs; no secrets or personal data in logs.
- **NFR-22** Database indexes verified with `explain()` on the main list and analytics queries; findings recorded.
- **NFR-23** Accessibility pass on core flows (keyboard, labels, contrast), recorded in `docs/`.
- **NFR-24** Backups/export approach for Atlas documented (what the plan provides: verify).

### Deployment
- **NFR-18** Deployed on Atlas + Render/Railway + Vercel; production env vars set per platform; README lists live URLs.

## 5. Data model (outline only; full schema TBD)

Entities implied by the chat: User, VendorProfile, Product, Cart, Order (parent), SubOrder, PayoutLedgerEntry, plus Review, Wishlist, Variant, RefundRecord, ProcessedEvent, AuditLog, ModerationFlag, CsvImportReport. Fields, indexes and relations shall be defined in `docs/data-model.md` before coding the models.

## 6. API (outline only)

REST over JSON plus one Socket.io channel. Route list, request/response shapes and error codes: **TBD**, written to `docs/api-spec.md` in Phase 1 and treated as the contract afterwards.

## 7. Traceability

| PRD feature | Requirements |
|---|---|
| 5.1 Accounts/access | FR-01 to FR-06 |
| 5.2 Vendor side | FR-07 to FR-11 |
| 5.3 Customer side | FR-12 to FR-15 |
| 5.6 Checkout | FR-16 to FR-22 |
| 5.4 Admin | FR-23, FR-24 |
| 5.5 Analytics | FR-25 to FR-29 |
| Catalog extensions, notifications, money flows, moderation, audit | FR-30 to FR-42 |
| Security/quality | NFR-01 to NFR-24 |

## 8. Acceptance

The product is accepted at ~100% when every MUST in `prd.md` has passing evidence and success criteria S1 to S17 pass.
