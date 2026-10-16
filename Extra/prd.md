# PRD: Multi-Vendor E-Commerce Platform with Analytics

Status: Draft v1. Derived only from the owner's planning chat. TBD = not decided; ask the owner.
Priority key: Target is ~100% (see `project.md` section 7). **MUST** = in the 100% scope. **STRETCH** = only if the owner adds it. Nothing is WON'T except the delivery-partner role, Algolia/Elasticsearch and push notifications (STRETCH).

## 1. Problem

Most student e-commerce projects model one seller: one catalog, one admin, one order table. Real marketplaces host many independent sellers. That brings two hard problems: (a) one customer checkout that spans several vendors, and (b) reporting for each vendor and the platform without manual spreadsheets.

## 2. Goals

1. A working marketplace with three roles (Admin, Vendor, Customer).
2. Correct, atomic cart-splitting checkout.
3. Live analytics from real data via aggregation pipelines.
4. Secure by default (authentication, authorization, input validation).
5. Deployed on a public URL and pushed to GitHub with a clean commit history.
6. Explainable end to end by the owner in a college review.

## 3. Non-goals

STRETCH: delivery-partner role, Algolia/Elasticsearch, push notifications. Native mobile app: not mentioned, out of scope.

## 4. Users and needs

| Role | Needs |
|---|---|
| Customer | Browse all vendors in one storefront, search/filter, one cart across vendors, one checkout, track each sub-order |
| Vendor | Apply to sell, manage own products and stock, process own orders, see own sales analytics |
| Admin | Approve/reject vendors, set commission, moderate, see platform analytics and a live order feed |

## 5. Features

### 5.1 Accounts and access
- **MUST** Register/login for all roles; JWT access + refresh tokens; role-based route protection.
- **MUST** Ownership checks: a vendor can only touch their own products and orders.

### 5.2 Vendor side
- **MUST** Vendor onboarding with store details (document upload may be mocked).
- **MUST** Product CRUD with image upload (Cloudinary).
- **MUST** Inventory count with low-stock indication.
- **MUST** Order management: accept / reject / ship on own sub-orders.
- **MUST** Product variants (size/color), each with its own stock.
- **MUST** CSV bulk upload with row-level validation and an error report (bad rows never silently skipped).
- **MUST** Low-stock alerts to the vendor (in-app, plus email if D10 is resolved).

### 5.3 Customer side
- **MUST** Catalog browsing; search plus filters (category, price, vendor; rating if reviews are built).
- **MUST** Multi-vendor cart and cart-split checkout (see 5.6).
- **MUST** Order history with per-sub-order status.
- **MUST** Reviews/ratings tied to verified purchases.
- **MUST** Wishlist and recently viewed.
- **MUST** Order confirmation and status emails (provider D10).

### 5.4 Admin side
- **MUST** Vendor approval workflow.
- **MUST** Commission setting and a simulated payout **ledger** (records only).
- **MUST** Moderation of flagged products/reviews.
- **MUST** Vendor KYC review screen (documents may be mock).

### 5.5 Analytics (differentiator)
- **MUST** Vendor dashboard: sales trend, top products, revenue over time.
- **MUST** Admin dashboard: GMV, active vendors, category performance.
- **MUST** Live order feed via Socket.io on the admin dashboard.
- **MUST** Cohort/retention view in the admin dashboard.
- **MUST** Redis cache on analytics endpoints with a defined invalidation or TTL rule.
- All figures come from MongoDB aggregation pipelines over real orders.

### 5.6 Cart-splitting checkout (core)
Cart grouped by `vendorId`. One parent order for the customer total plus one sub-order per vendor group. Stock decrement happens inside a MongoDB transaction: whole checkout succeeds or nothing is written. No overselling.

### 5.7 Payments
- **MUST** Payment in test mode behind a swappable gateway interface (Razorpay default, D1).
- **MUST** Webhook/confirmation handling that is verified, not trusted blindly.
- **MUST** Vendor payouts: real transfer if the gateway supports it in test mode (D9), otherwise a ledger with admin-marked settlement.
- **MUST** Refunds: full and per-sub-order, restoring stock and reversing commission; gateway refund if supported, otherwise simulated and clearly labelled.
- **MUST** Idempotent payment handling (a repeated webhook never double-creates or double-refunds).

### 5.8 Delivery
- **MUST** Public deployment: Atlas + Render/Railway + Vercel; README with real live links.
- **MUST** Code on GitHub with incremental commits.

## 6. Success criteria (checkable)

| # | Criterion | How verified |
|---|---|---|
| S1 | A 3-vendor cart produces 1 parent order + 3 sub-orders | Run checkout, inspect DB |
| S2 | Forced failure mid-checkout leaves stock unchanged | Test that throws inside transaction |
| S3 | Vendor A cannot read/modify Vendor B's product or order (403) | Manual/automated request |
| S4 | No-token request to protected route returns 401 | Manual request |
| S5 | Dashboard numbers match a manual sum from the DB | Compare aggregate vs. raw query |
| S6 | New order appears on admin feed without refresh | Two browser windows |
| S7 | Full flow works on live URLs in an incognito window | Register, browse, pay with test card, see order |
| S8 | `git log` shows many small commits; tree clean; all pushed | Git commands |
| S9 | `.env` never appears in history | `git log --all --full-history -- .env` is empty |
| S10 | CSV with 1 bad row among 100: 99 import, bad row reported with reason | Upload test file |
| S11 | Refund of one sub-order restores its stock and reverses its commission only | Run and inspect DB |
| S12 | Replayed payment webhook changes nothing | Send same event twice |
| S13 | Review allowed only after delivery of that product | Try before/after |
| S14 | Order email arrives for a test order | Check inbox/provider log |
| S15 | Cached analytics equal uncached after invalidation | Compare responses |
| S16 | CI passes on every push to main | GitHub Actions |
| S17 | `npm audit` shows no unaddressed high/critical issues | Run it |

## 7. Constraints and assumptions

- MongoDB Atlas required for transactions.
- Timeline about 11-12 working days; solo owner plus agent.
- Assumption: single currency and single region. **TBD:** confirm (INR is likely but not stated in the chat).
- Assumption: desktop-first responsive UI. **TBD:** confirm.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Agent output reads as generic/AI | Domain naming, no filler comments, owner reads every diff, small commits |
| Gateway mismatch with the PPT (Stripe vs Razorpay) | Decide D1; edit slides or word as "payment gateway in test mode" |
| Transaction failures on local DB | Use Atlas in dev |
| Scope creep | MUST/SHOULD/WON'T list above; Ponytail "does this need to exist?" |
| Agent invents APIs or packages | Anti-hallucination contract in `project.md` |

## 9. Open questions for the owner

D1 to D8 in `project.md` section 6, plus: currency, mobile-first or desktop-first, D9 to D11 (payout/refund ability of the gateway, email provider, stretch items).
