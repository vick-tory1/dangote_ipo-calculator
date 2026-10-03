# Dangote IPO Investment Calculator

Standalone Next.js application at `/dangote-ipo-calculator`. The verified offer snapshot is server-only in `lib/ipo-data.ts`; fees, dividends and a market price deliberately remain unavailable.

## Setup

Copy `.env.example` to `.env`, set a PostgreSQL `DATABASE_URL` and a high-entropy `AUTH_SECRET`, then run `npx prisma generate` and `npx prisma migrate deploy`. Accounts are expected to be provisioned by the deployment's approved identity/onboarding process with an Argon2 password hash; do not seed real users through source control.

`GEMINI_API_KEY` is optional. Without it, calculation and history continue to work while the explanation endpoint returns a safe availability message.

## Customer support and administration

After the existing database is configured, deploy the additive support/admin schema with `npx prisma migrate deploy` and regenerate the client with `npx prisma generate`. Customer accounts continue to be provisioned by the deployment's approved onboarding process; the app does not provide public sign-up. Customers sign in at `/login` to create support tickets and see their own conversation history at `/support`.

The `/admin` area and every `/api/admin/*` route require an account whose database role is `ADMIN`. Promote an approved, already-provisioned account through a controlled database administration process, for example:

```sql
UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'approved-admin@example.com';
```

Confirm the email and affected row before running this against the production database. Do not expose a role-change endpoint or promote accounts from client-side code. IPO terms are read-only in the admin UI and remain versioned in `lib/ipo-data.ts`.

The offer badge reloads the deployed, versioned snapshot every 60 seconds. “Snapshot refreshed” is the time this app fetched that snapshot; “Sources verified” is the last date the official sources were reviewed. The official IPO website does not currently expose a structured live-data feed, so changed offer terms must be verified and published in `lib/ipo-data.ts` before the badge and calculator use them.

## Data snapshot

Verified 2026-10-01 against the official Dangote IPO site, SEC Nigeria IPO notice, and NGX opening announcement. The snapshot states ₦525.00 per share, 4.1bn offered shares, minimum/multiples of 10, and 14 September–13 October 2026. Review official terms and update the versioned snapshot before deployment or whenever terms change.
