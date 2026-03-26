---
name: documentation-templates
description: Templates and standards for writing READMEs, JSDoc/TSDoc, changelogs, and Architecture Decision Records in a TypeScript/Next.js project.
---

# Documentation Templates

> **When does this activate?**
> Use this when writing any documentation — a README, inline JSDoc comments, a CHANGELOG, or an ADR. Loaded with the documentation-writer agent.

---

## README Template

````md
# Project Name

One sentence describing what this is and who it's for.

## Quick Start

\```bash
npm install
cp .env.example .env.local

# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

npm run dev
\```

Open [http://localhost:3000](http://localhost:3000)

## Features

- Feature 1
- Feature 2
- Feature 3

## Tech Stack

| Layer     | Technology              |
| --------- | ----------------------- |
| Framework | Next.js 14 (App Router) |
| Database  | Supabase (PostgreSQL)   |
| ORM       | Drizzle                 |
| Styling   | Tailwind CSS            |
| Auth      | Supabase Auth           |

## Environment Variables

| Variable                        | Required | Description                  |
| ------------------------------- | -------- | ---------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅       | Your Supabase project URL    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅       | Supabase anon/public key     |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✅       | Server-only service role key |

## Project Structure

\```
app/ → Next.js App Router pages and layouts
components/ → Reusable UI components
lib/ → Utilities, Supabase client, helpers
db/ → Drizzle schema and migrations
\```
````

---

## JSDoc / TSDoc Standards

```ts
/**
 * Fetches all published posts for a given user.
 * Requires an authenticated Supabase session.
 *
 * @param userId - The UUID of the user whose posts to fetch
 * @param options - Optional pagination and filter config
 * @returns Array of Post objects ordered by createdAt descending
 * @throws {AuthError} If the current session is invalid
 * @throws {DatabaseError} If the query fails
 *
 * @example
 * const posts = await getUserPosts('uuid-here', { limit: 10, page: 1 })
 */
export async function getUserPosts(
  userId: string,
  options?: { limit?: number; page?: number },
): Promise<Post[]>;
```

**Rules:**

- All exported functions get a JSDoc block
- `@param` and `@returns` on all public functions
- `@throws` for any function that can throw a known error
- `@example` for any function with non-obvious usage
- Comment **why**, never **what** — the code says what

---

## Inline Comment Rules

```ts
// ✅ Explains WHY — not obvious from the code
// getUser() validates against the auth server on every call.
// getSession() only reads the cookie — don't use it in server contexts.
const {
  data: { user },
} = await supabase.auth.getUser();

// ✅ Documents a gotcha
// prepare: false required for Supabase with PgBouncer connection pooling
export const db = drizzle(pool, { logger: true });

// ❌ States the obvious — delete this
// increment the count
count++;
```

---

## CHANGELOG Format

Follow [Keep a Changelog](https://keepachangelog.com):

```md
# Changelog

## [Unreleased]

## [1.2.0] - 2026-03-14

### Added

- User profile page with avatar upload
- Dark mode support

### Changed

- Improved login form error messages

### Fixed

- Auth redirect loop on session expiry

### Removed

- Legacy REST endpoint /api/v1/user (use /api/user)
```

**Rules:**

- Every PR that changes user-facing behavior gets a CHANGELOG entry
- Use past tense: "Added", "Fixed", "Changed", not "Add", "Fix", "Change"
- Never add entries for refactors that don't change behavior

---

## ADR (Architecture Decision Record)

```md
# ADR-001: Use Supabase for Auth and Database

## Status

Accepted — 2026-03-14

## Context

We need auth, a database, and file storage for the project.
Evaluating: Supabase, Firebase, PlanetScale + Auth.js.

## Decision

Use Supabase for all three: PostgreSQL database, Auth, and Storage.

## Reasons

- Single vendor reduces integration complexity
- Row Level Security removes the need for a separate auth middleware layer
- Generous free tier for early development
- Native Next.js support via @supabase/ssr

## Trade-offs

- Vendor lock-in for auth and storage
- RLS policies require learning PostgreSQL policy syntax
- Local development requires Supabase CLI

## Consequences

All database queries use the Supabase client or Drizzle with Supabase's connection string.
Auth is handled exclusively through Supabase Auth — no custom auth logic.
```
