---
name: marketplace-build
description: Use for every task in the multi-vendor MERN marketplace project (Express API, React client, MongoDB checkout and analytics, security, git, deployment). Reads project.md, prd.md and srs.md first, applies the Ponytail ladder before writing code, and never invents facts, packages or APIs.
---

# marketplace-build (skill.md)

Project skill that layers the **Ponytail** method (github.com/DietrichGebert/ponytail) on top of this project's requirements. It does not replace Ponytail's own skill; install that too (see "Setup").

## 0. Read first, every session

1. `project.md`: identity, decisions, TBDs, contract.
2. `prd.md`: what to build and priority (MUST / STRETCH).
3. `srs.md`: testable requirements (FR/NFR IDs).
4. `docs/` files if present (data model, API spec, design system, security checklist).

If a needed fact is missing: state it as **TBD**, ask the owner, and do not proceed on a guess. Work on the current phase only.

## 1. Ponytail ladder (run before writing code)

Understand the problem and read the code the change touches first. Then stop at the first rung that holds:

1. Does this need to exist? (check `prd.md`; if it is not a requirement, do not build it)
2. Already in this codebase?
3. Does the standard library do it?
4. A native platform feature (browser or Node)?
5. An already-installed dependency?
6. Can it be one line?
7. Only then, the minimum that works, plus one small test if it has logic.

Lazy about the solution, never about reading. Example: use `<input type="date">` and the repo's existing Input component instead of a hand-built calendar.

**Ponytail trims the how, not the what.** Required features in `prd.md` are never removed by the ladder.

## 2. Never cut

Trust-boundary validation, data-loss handling, security, accessibility, and error handling. These stay even when the ladder says "less code."

## 3. Project hard rules

**Checkout (FR-16 to FR-22):** group by vendorId; one parent order + one sub-order per vendor; stock check/decrement and order creation in one MongoDB transaction; server-computed prices; rollback on any failure. Needs Atlas (replica set).

**Authorization (FR-03 to FR-05):** every route checks authentication, role and resource ownership. Never trust client-sent role, price, stock or status.

**Analytics (FR-25 to FR-28):** aggregation pipelines over real orders; vendor sees own data only; verify a figure against a raw query before calling it done.

**Security (NFR-01 to NFR-08):** schema validation on every input; rate limits; helmet-style headers; CORS allowlist; httpOnly+secure refresh cookie; upload limits; no secrets in git; `npm audit` before deploy.

**Payments and money (FR-21, FR-22, FR-36 to FR-38):** swappable gateway interface; test mode; verify webhook signatures; idempotent event handling; refunds restore stock and reverse commission in one transaction. Payout/refund through the gateway only after reading its docs and confirming it is supported in test mode (D9); otherwise ledger/simulated and labelled as such. Never guess gateway API fields.

**Code quality (NFR-15 to NFR-17):** domain names (`vendorId`, `subOrder`, not `data`/`item`); no filler comments, no dead code, no placeholder copy; one consistent error response shape; every screen has loading, empty and error states; shortcuts marked `shortcut: <why> / revisit when <condition>`.

**Tests:** one small test for any branch, loop, parser, money or security logic. Checkout rollback and ownership checks are mandatory tests.

## 4. Anti-hallucination protocol

- Verify before using: `npm view <pkg> version`, read the package docs, or run it. Never invent package names, versions, flags, env vars or API shapes.
- Run before claiming: do not say "works" unless you ran it. Otherwise write "not run".
- Cite requirement IDs (FR-xx/NFR-xx) in commits and replies.
- Do not invent statistics, benchmarks or citations.
- If docs and code disagree, report it; do not silently pick one.
- When unsure between two options, list both with trade-offs and ask.

## 5. Git protocol

Small commits (feat/fix/chore/test/docs style) tied to one logical change; commit after each working step; push after each phase. Never commit `.env`. After each phase report: `git log --oneline` (last commits), `git status`, push status.

## 6. Phase loop

For each phase: (1) restate scope from `prd.md`/`srs.md` and list the FR/NFR IDs; (2) plan in a few lines, apply the ladder; (3) build in small steps, test as you go; (4) run the checks; (5) commit and push; (6) run `/ponytail-review` if available, or self-review the diff for bugs, security, load, missing tests and what to cut; (7) reply with the closing report below. Do not start the next phase until the owner confirms.

Phase order lives in `roadmap.md` (Phases 0 to 11). Do the phase the owner names; never jump ahead.

## 7. Closing report (every reply ends with this)

- **Done:** what was built, with FR/NFR IDs.
- **Verified:** what was run and the result.
- **Not checked / skipped:** anything unrun or deliberately deferred (with a `shortcut:` note).
- **Risks and TBDs:** anything the owner must decide.

## 8. Ponytail commands (if the host supports them)

`/ponytail [lite|full|ultra|off]` sets intensity. `/ponytail-review` after each phase. `/ponytail-audit` before deployment. `/ponytail-debt` at the end to list `shortcut:` items. `/ponytail-gain` and `/ponytail-help` are informational.

## 9. Setup (verify each step; I could not confirm Antigravity specifics)

- Ponytail's README lists Antigravity CLI as a skill-capable host and says Antigravity's `AGENTS.md` fallback loads the ruleset without the commands. Read the repo's `INSTALL.md` for exact Antigravity steps before relying on this.
- Fallback that always works: copy Ponytail's `AGENTS.md` into the project root and keep this `skill.md` beside `project.md`.
- Install Ponytail only from `DietrichGebert/ponytail` on GitHub or `@dietrichgebert/ponytail` on npm.
- Where Antigravity expects skill files (folder and frontmatter format) is **unverified**. If it rejects this file, check its docs and adjust the header only.

## 10. Definition of done (~100%)

Every MUST in `prd.md` has passing evidence; success criteria S1 to S17 pass; CI is green; code is on GitHub with a clean tree; live URLs work in an incognito window.
