# PROJECT.md: Multi-Vendor E-Commerce Platform with Analytics

> Master context file. Agents read this FIRST, then `prd.md`, `srs.md`, `skill.md`.
> Every fact here comes from the owner's planning chat (see "Source of truth").
> Anything not decided in that chat is marked **TBD**. Do not fill TBDs by guessing; ask the owner.

## 1. Identity

| Item | Value |
|---|---|
| Name | Multi-Vendor E-Commerce Platform with Analytics |
| Type | Full-stack college project (Full Stack Development) |
| Institution | Easwari Engineering College, Department of Information Technology |
| Owner / presenter / guide | TBD (owner fills in) |
| Repo name / GitHub URL | TBD (owner creates an empty GitHub repo first) |
| Stack | MERN: MongoDB, Express, React, Node.js |
| Build tool | Antigravity IDE (agent) + Ponytail framework |
| Target | ~100% of the planned scope (definition in section 7), about 18-22 working days (estimate; see roadmap.md) |

## 2. One-paragraph summary

An online marketplace where many independent vendors run their own stores under one platform. Customers browse one storefront and check out once. The system splits a mixed cart into one sub-order per vendor and decrements stock inside a MongoDB transaction. Vendors and admins get live analytics from MongoDB aggregation pipelines, plus a real-time order feed over Socket.io.

## 3. The two differentiators (protect these)

1. **Cart-splitting checkout**: cart grouped by vendor into one parent order plus one sub-order per vendor. Stock decrement is atomic (transaction); if any step fails, nothing is written.
2. **Aggregation-pipeline analytics**: dashboards computed from real transactional data, not fake numbers or scheduled scripts.

The owner must be able to explain both line by line at a review. The agent must build them readably and explain them.

## 4. Roles

Admin, Vendor, Customer. (A fourth, Delivery partner, was only an optional idea in the chat: **out of scope unless owner says otherwise**.)

## 5. Decided technology (from the chat)

- Auth: JWT + refresh tokens, role-based middleware; refresh cookie `httpOnly` + `secure`.
- Database: MongoDB **Atlas** for development (transactions need a replica set; plain local `mongod` fails).
- Images: Cloudinary.
- Real-time: Socket.io.
- Payments: **Razorpay test mode behind a swappable payment interface** (kit default, because Stripe signup for Indian businesses has historically been restricted). Vendor payout is a **ledger**, not real money transfer.
- Hosting: MongoDB Atlas + Render (or Railway) for the API + Vercel for the client.
- Caching: Redis is **optional**, only if time remains.

## 6. Open decisions (TBD: ask the owner, do not guess)

| # | Decision | Options mentioned in chat |
|---|---|---|
| D1 | Payment gateway final | Razorpay (kit default) vs Stripe Connect (PPT slides 8-12 say Stripe) |
| D2 | Client state | Redux Toolkit **or** Zustand, plus React Query |
| D3 | Client shape | One React SPA with role routing **or** separate customer/vendor/admin apps **or** Next.js for public pages |
| D4 | Search | MongoDB text search (default) vs Algolia/Elasticsearch |
| D5 | Product variants (size/color) | Now MUST for 100%; owner confirms the variant model |
| D6 | Reviews, wishlist, recently viewed | Now MUST for 100%; owner confirms |
| D9 | Real vendor payouts and refunds | Depends on what the chosen gateway supports in test mode; verify in its docs. Fallback: ledger + simulated refund |
| D10 | Email provider for order emails | Not decided; verify a free tier exists before choosing |
| D11 | Stretch items (delivery role, Algolia/Elasticsearch, push) | Mentioned in chat as optional; excluded from 100% unless owner adds them |
| D7 | Phase/prompt contents of the earlier 9-phase kit | Kit files were not visible when this file was written |
| D8 | Frontend bundler, test runner, lint config | Not specified |

## 7. Scope boundary: what "100%" means

"100%" = every feature suggested in the owner's chat except items the chat itself called optional. This definition is mine; **owner to confirm.**

**In (100%):** auth + roles; vendor onboarding/KYC (mock documents) and approval; product CRUD with variants; CSV bulk upload; inventory with low-stock alerts; catalog search/filters; cart + cart-split checkout; order status pipeline; reviews tied to verified purchases; wishlist and recently viewed; moderation; commission and payouts (real transfer only if the gateway supports it, D9, otherwise ledger); refunds (gateway test mode if supported, otherwise simulated); order emails; vendor and admin analytics incl. cohort/retention; live order feed; Redis cache and rate limiting on analytics; tests, CI, deployment, documentation.

**Stretch (beyond 100%, only if owner adds):** delivery-partner role, Algolia/Elasticsearch, push notifications.

## 8. Working method: Ponytail

Ponytail (github.com/DietrichGebert/ponytail) is a prompt that makes the agent write only what the task needs and never cut validation, error handling, security or accessibility. Full rules in `skill.md`. Summary:
- Run the ladder before each piece of code (exists? in repo? stdlib? native? installed dep? one line? else minimum).
- Ponytail trims *how* a requirement is implemented, never *which* requirement exists. Features in `prd.md` are not up for deletion by the agent.
- One small test for any logic with a branch, loop, parser, money or security.
- Every reply ends with what was skipped or not checked.
- Review with `/ponytail-review` after each phase, `/ponytail-audit` before deploy, `/ponytail-debt` at the end (if the host supports commands).

## 9. Anti-hallucination contract

1. Never invent package names, versions, API signatures or env vars. Verify with `npm view <pkg>`, the package's own docs, or by running it.
2. Never state something works without running it. Say "not run" if not run.
3. If a requirement is missing or ambiguous, mark **TBD** and ask. Do not choose silently.
4. Cite the requirement ID (e.g. `FR-12`) in commits and PR notes.
5. Do not copy citations or statistics from memory; the PPT's references are the only citations in scope.
6. Do not claim features exist that are not in the repo.

## 10. Repository layout (proposed; confirm in Phase 0)

```
/            project.md  prd.md  srs.md  skill.md  AGENTS.md  README.md
/docs        architecture, data model, API spec, design system, security, deployment, verification
/server      Express API
/client      React app
```
Exact internal structure: **TBD**, decided at scaffold time and recorded in `docs/`.

## 11. Git discipline

Repo created empty on GitHub by the owner. Small commits with clear messages (conventional style), pushed after every phase. `.env` never committed. After each phase: `git log --oneline` shows several commits, `git status` clean, `git log origin/main..main` empty.

## 12. Source of truth

The owner's chat "Multi-vendor e-commerce platform project ideas" (created 9/6/2026, exported 10/13/2026), plus the Ponytail README. If this file disagrees with the owner's latest instruction, the owner wins; update this file.
