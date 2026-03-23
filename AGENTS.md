<!-- BEGIN:nextjs-agent-rules -->

# Next.js App Router Guidelines

This project uses the latest Next.js App Router.

- Prefer Server Components by default
- Follow App Router conventions (`app/`, route groups, layouts)
- Avoid outdated Pages Router patterns


# AGENTS.md

## 🧠 Project Context

This is a **Next.js (App Router) + Convex + Better Auth** application for a real estate platform.

Core features:
- public property search (SEO-first)
- realtor onboarding (CEA verification + OTP)
- listings creation and publishing
- billing and payments (HitPay)
- branding placements
- referral system and partner tiers
- admin moderation and reporting

---

## ⚠️ Core Architecture Principles (MUST FOLLOW)

### 1. Convex = backend source of truth
- All business logic MUST live in `convex/modules/*`
- Do NOT put business logic in:
  - React components
  - `page.tsx`
  - API routes

---

### 2. Better Auth = identity only
Better Auth handles:
- sign-in / sign-up
- sessions
- credentials

Convex handles:
- role
- onboardingStage
- accountStatus
- verification flags

👉 NEVER mix these responsibilities

---

### 3. Server-first architecture
- Default to Server Components
- Use `"use client"` ONLY when necessary

---

### 4. Use App Router only
- Use `app/`, NOT `pages/`
- Use route groups:
  - `(public)`
  - `(auth)`
  - `(dashboard)`
  - `admin`

---

## 📁 Folder Rules

### Structure

- `app/` → routes only
- `components/` → shared UI
- `convex/` → backend logic
- `integrations/` → external services
- `lib/` → utilities, validators
- `emails/`, `sms/` → messaging
- `tests/` → testing
- `docs/` → documentation

---

### Route-local components

Use:

app/<route>/_components/

👉 Do NOT promote to global `components/` unless reusable

---

## 🔧 Convex Rules

### Domain-based modules

convex/modules/
  onboarding/
  listings/
  billing/
  referrals/
  branding/
  users/
  realtors/
  otp/
  admin/

---

### Validation (MANDATORY)

- Always validate inputs in backend
- Use Zod in `lib/validators`
- Never trust frontend validation

---

### State machines (REQUIRED)

Must exist for:
- onboarding
- listings lifecycle
- billing
- branding bookings
- referrals

👉 Enforce valid transitions only

---

### Data access rules

- Reads → queries
- Writes → mutations
- Internal workflows → internal functions

👉 Never perform writes outside Convex mutations


## 🔐 Auth Rules

After login, ALWAYS route based on:

- onboardingStage
- role
- accountStatus

### Example

- `pending_cea` → `/onboarding/cea`
- `pending_otp` → `/onboarding/otp`
- `profile_setup` → `/onboarding/profile`
- `completed` → `/dashboard`

---

## 💳 Billing Rules

- Always verify webhook signature
- Always use raw request body (`req.text()`)
- Webhooks must be idempotent
- NEVER trust webhook payload blindly

### Critical rule

👉 Activate listing ONLY after payment success

---

### Idempotency (REQUIRED for payments)

- Webhooks may be retried
- Always check if payment already processed
- Do NOT double-activate listings or duplicate records

## 🎯 Referral Rules

- Create referral at signup
- Store `referredByUserId`
- Initial status = `signup`

### Qualification

- ONLY after first paid action
- NOT during signup

---

## 🔍 Search & SEO Rules

- Public pages must be SEO-ready:
  - metadata
  - sitemap
  - robots
  - Open Graph

### Search must NOT include:
- draft listings
- unpaid listings
- expired listings

---

## 🔒 Security Rules

- Never expose secrets client-side
- Validate all inputs
- Protect against:
  - CSRF
  - XSS
  - injection

- Restrict uploads (type + size)

---

## 📜 Audit Logging

Must log:

- user suspension
- billing/refunds
- referral changes
- listing moderation
- pricing changes

---

## 🧩 Coding Rules

- No `any`
- Small, single-purpose functions
- Clear, descriptive naming
- Extract shared logic (pricing, GST, commissions)

---

## 🚫 DO NOT

- Put business logic in UI
- Mix auth with onboarding logic
- Skip backend validation
- Trust webhook payloads
- Hardcode secrets
- Create large monolithic files

---

## ✅ When Generating Code

Always:

1. Place logic in correct domain module
2. Add types (DTOs)
3. Add validation
4. Keep UI simple
5. Keep API routes thin
6. Respect server/client boundaries

---

## 🧪 Testing Rules

Must cover:

- onboarding flow
- billing logic
- payment integration
- referral logic
- listing lifecycle
- branding bookings
- admin actions

### Structure

tests/
  unit/
  integration/
  e2e/

---

## 🧱 Implementation Order

When building features:

1. schema / types
2. validators
3. Convex logic
4. integrations
5. UI
6. tests

---

## 🧠 If Unsure

Choose the approach that:

- keeps logic in Convex
- keeps UI simple
- improves testability
- enforces validation
- respects architecture boundaries


### API Route Rule

API routes must only:
- parse request
- verify signature
- call backend logic

Do NOT:
- implement business logic inside route handlers


### Module file pattern (recommended)

Each module may include:

- queries.ts
- mutations.ts
- internal.ts
- validators.ts

Keep responsibilities separated


- Never call database logic directly from UI
- Always go through Convex functions




<!-- END:nextjs-agent-rules -->
