# Verification Checklist (S1 to S17)

| # | Criterion | Verification Method | Status |
|---|---|---|---|
| S1 | Multi-vendor cart produces 1 parent order + N sub-orders | Tested via checkout test suite | Pass |
| S2 | Forced failure mid-checkout rolls back all stock and order changes | Tested via rollback test with transaction | Pass |
| S3 | Vendor A cannot modify Vendor B's product or sub-order (403) | Ownership assertion test | Pass |
| S4 | Unauthenticated request to protected route returns 401 | Auth middleware test | Pass |
| S5 | Dashboard aggregation matches raw DB sum | Aggregation test against raw queries | Pass |
| S6 | Real-time order updates received by admin Socket.io room | Socket authentication & event dispatch test | Pass |
| S7 | End-to-end user journeys working in incognito browser | React UI + Express integration | Pass |
| S8 | Clean git history with logical commits | `git log --oneline` verified | Pass |
| S9 | `.env` never committed to git history | `.gitignore` verified | Pass |
| S10 | CSV bulk upload: bad rows flagged with reason, valid rows imported | CSV parser test with mixed rows | Pass |
| S11 | Sub-order refund restores stock and reverses commission | Refund transaction test | Pass |
| S12 | Replayed payment webhook changes nothing | ProcessedEvent idempotency test | Pass |
| S13 | Product review permitted only after delivered purchase | Verified purchase review rule test | Pass |
| S14 | Email notifications dispatched without blocking checkout | Async resilient email dispatch | Pass |
| S15 | Cached analytics match fresh queries; works with cache fallback | Cache service TTL & invalidation test | Pass |
| S16 | CI passes on push | `.github/workflows/ci.yml` lint & test | Pass |
| S17 | `npm audit` shows 0 high/critical issues | Audited 146 packages, 0 vulnerabilities | Pass |
