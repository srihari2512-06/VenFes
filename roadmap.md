# ROADMAP.md: path to ~100%

Read `project.md`, `prd.md`, `srs.md`, `skill.md` first. Day counts are my estimates for one owner plus an agent, not measured. One phase at a time; the owner verifies and confirms before the next.

## Rules for every prompt below
Prefix each one with: *"Follow skill.md. Read project.md, prd.md, srs.md. Work only on the stated requirement IDs. Apply the Ponytail ladder. Verify packages/APIs before use, run what you build, commit in small steps, end with the closing report. If something is TBD, ask me."*

## Phase map

| Phase | Theme | Requirements | Est. days |
|---|---|---|---|
| 0 | Repo, scaffold, health check, CI skeleton | NFR-05, 10, 16, 20 | 1 |
| 1 | Auth, roles, ownership middleware | FR-01 to 06, NFR-01 to 04, 08 | 2 |
| 2 | Vendor onboarding, KYC, admin approval, product CRUD, images | FR-07 to 10, 40 | 2 |
| 3 | Variants, search/filters, CSV bulk upload, low-stock | FR-12, 13, 30, 33, 34 | 2 |
| 4 | Cart + cart-split checkout (transaction) | FR-14, 16 to 20 | 2.5 |
| 5 | Payments, webhooks, idempotency | FR-21, 22, 36 | 1.5 |
| 6 | Order pipeline, order history, emails | FR-11, 15, 35 | 1.5 |
| 7 | Commission, payouts, refunds, audit log | FR-23, 37, 38, 42 | 2 |
| 8 | Reviews, wishlist, recently viewed, moderation | FR-24, 31, 32, 39 | 2 |
| 9 | Analytics, cohort, live feed, Redis cache | FR-25 to 29, 41 | 2.5 |
| 10 | Tests, CI, hardening, accessibility, performance | NFR-07, 09, 11 to 14, 19 to 23 | 2 |
| 11 | Deployment, docs, demo data, final audit | NFR-18, 24, S1 to S17 | 1.5 |

Total about 22 days (estimate). Phases 4, 5, 7 and 9 carry the most review-risk: read those diffs line by line.

## Decisions needed before the phase that uses them
D1, D2, D3 before Phase 0/1. D9 before Phase 5. D10 before Phase 6. D5/D6 are now MUST. Ask the agent to list unresolved TBDs at the start of each phase.

---

## Phase 0: Setup
**P0.1** Initialize git, `.gitignore` (node_modules, `.env`, build output), `.env.example`, folders `server/` and `client/`, connect my empty GitHub remote `<URL>`. Small commits, push.
**P0.2** Scaffold the Express server with a health-check route, central error handler (one error shape), config loader that fails fast on missing env vars, connection to Atlas.
**P0.3** Scaffold the React client with routing shell and design tokens file (spacing, type, color) recorded in `docs/design-system.md`.
**P0.4** Add lint, a test runner, and a GitHub Actions workflow running lint + tests. Verify each tool and version exists before pinning.
**Check:** health route responds; CI green; `git log` has several commits; `.env` not in history.

## Phase 1: Auth
**P1.1** Write `docs/data-model.md` (User) and `docs/api-spec.md` (auth routes) first; I review them.
**P1.2** Register/login, password hashing, access JWT + rotating refresh token in httpOnly+secure cookie, input validation, rate limit on auth.
**P1.3** `requireAuth`, `requireRole`, and an ownership-check helper. Tests: 401 without token, 403 wrong role, 403 other user's resource.
**P1.4** Client: login/register, protected routes by role, token refresh handling, loading/error states.
**Check:** S3, S4.

## Phase 2: Vendors and products
**P2.1** Vendor application with store details and mock KYC upload; status pending/approved/rejected.
**P2.2** Admin review screen and approve/reject with audit log entry.
**P2.3** Product CRUD for approved vendors, Cloudinary upload with type/size limits, ownership enforced.
**P2.4** Client: vendor onboarding, vendor product manager, admin vendor queue.

## Phase 3: Catalog depth
**P3.1** Variant model (size/color, per-variant stock). Update docs first, then code.
**P3.2** Paginated catalog list with text search and filters (category, price, vendor); indexes added and checked with `explain()`.
**P3.3** CSV bulk upload: parse, validate each row, import valid rows, return an error report; caps on size and rows. Test with a file containing bad rows (S10).
**P3.4** Low-stock threshold and vendor alert.

## Phase 4: Cart and checkout (core)
**P4.1** Cart model/API supporting variants and multiple vendors.
**P4.2** Checkout service: group by vendor, server-side pricing, one transaction doing stock check/decrement + parent order + sub-orders. Explain each step in comments only where the logic is non-obvious.
**P4.3** Tests: success path (S1), forced failure rollback (S2), two concurrent checkouts for the last unit (FR-19).
**P4.4** Client cart and checkout screens with error states.
**Owner task:** be able to explain P4.2 aloud.

## Phase 5: Payments
**P5.1** Gateway interface + adapter for the chosen provider (D1). Read the provider docs first; list the endpoints and fields you will use and their doc source before coding.
**P5.2** Create payment, verify signature on confirmation/webhook, mark order paid.
**P5.3** Idempotency via stored event IDs; replay test (S12).

## Phase 6: Orders and email
**P6.1** Sub-order status pipeline with one allowed-transitions table enforced server-side; vendor actions.
**P6.2** Customer order history with per-sub-order status.
**P6.3** Email service (D10): confirmation + status change; failures logged and retried, never block checkout (S14).

## Phase 7: Money
**P7.1** Commission setting (admin) and per-sub-order commission record.
**P7.2** Payout calculation from delivered sub-orders; real transfer if D9 says supported, else ledger + admin "mark settled". Label whichever applies in the UI.
**P7.3** Refunds (whole order or sub-order): transaction restoring stock, reversing commission/ledger; gateway refund if supported else simulated and labelled (S11).
**P7.4** Audit log for approvals, commission, refunds, settlements.

## Phase 8: Engagement and moderation
**P8.1** Reviews only after delivery, once per purchase, rating aggregate (S13).
**P8.2** Wishlist and recently viewed.
**P8.3** Flagging, moderation queue, hide/restore/remove with audit entries.

## Phase 9: Analytics
**P9.1** Vendor pipelines: trend, top products, revenue over time, scoped to the vendor.
**P9.2** Admin pipelines: GMV, active vendors, category performance, cohort/retention.
**P9.3** Verify every number against a raw query (S5). Record the comparison.
**P9.4** Socket.io live feed with authenticated connections and role-based rooms (S6).
**P9.5** Redis cache with a stated invalidation/TTL rule and a no-Redis fallback (S15).
**P9.6** Charts in the client with loading/empty/error states.
**Owner task:** be able to explain each pipeline stage.

## Phase 10: Hardening
**P10.1** Security audit of every route: auth, role, ownership, validation, mass assignment. Produce a route table in `docs/security-checklist.md`.
**P10.2** Headers, strict CORS allowlist, upload restrictions, log hygiene (NFR-21), `npm audit` fixes (S17).
**P10.3** Fill test gaps listed in NFR-19; report measured coverage.
**P10.4** Accessibility pass (NFR-23) and index/`explain()` review (NFR-22).
**P10.5** Run `/ponytail-audit` if available; otherwise a repo-wide review with the same checks. Fix "must fix" items.

## Phase 11: Ship
**P11.1** Deploy: Atlas, API host, Vercel client; set production env vars; CORS to the real client URL; update gateway webhook URL.
**P11.2** Seed realistic demo data (named vendors/products, not placeholder text).
**P11.3** README with live links, setup steps, architecture diagram, screenshots; document Atlas backup approach (NFR-24, verify what the plan offers).
**P11.4** Final run of S1 to S17 on the live URLs in an incognito window; record results in `docs/verification-checklist.md`.
**P11.5** `/ponytail-debt` to list every `shortcut:`; decide fix or document. Final `git log`, `git status`, push check.

## Presentation sync
Slides still say Stripe Connect (slides 8 to 12 per your chat). After D1, update them, and update the scope slides to the 100% feature list.

## Honest limits
- Estimates are mine. Gateway payout/refund support is unverified (D9); the plan has a fallback for both outcomes.
- Nothing here is built or tested. Each phase is complete only when its checks pass.
