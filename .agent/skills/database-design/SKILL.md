---
name: database-design
description: Database schema design, indexing, query optimization, and ORM patterns for Next.js + Supabase projects — activate when designing tables, writing migrations, choosing an ORM, or fixing slow queries.
---

# Database Design

> **When does this activate?**
> Any task involving schema design, table creation, migrations, query performance, ORM selection, or Supabase-specific patterns (RLS, storage, auth). This is the primary skill for all data-layer work.

## Stack defaults

- **Database:** Supabase (PostgreSQL) for all persistent relational data  
- **ORM (primary):** Drizzle — type-safe, edge-compatible, SQL-like syntax  
- **ORM (alternative):** Prisma — when team prefers schema-first DX or needs Prisma Studio  
- **Local dev:** Supabase CLI + local Docker instance via `supabase start`  

Do not default to raw SQL for new work. Use Drizzle unless there is a specific reason (extremely complex query that Drizzle can't express cleanly).

## Sub-file map

| Sub-file | When to read |
|---|---|
| `schema-design.md` | Designing tables, choosing primary keys, timestamps, relationships |
| `rls-policies.md` | Row Level Security — any access control at the database layer |
| `migrations.md` | Adding/removing columns, zero-downtime changes, Drizzle migrations |
| `indexing.md` | Slow queries, missing indexes, composite index ordering |
| `optimization.md` | N+1 problems, EXPLAIN ANALYZE, Drizzle/Prisma query patterns |
| `orm-selection.md` | Choosing between Drizzle, Prisma, or raw SQL for a new project |

## Non-negotiable rules

- **Never `SELECT *`** — always select specific columns in production queries  
- **Always use `timestampz`** — never bare `timestamp` (timezone-unaware)  
- **Every table gets `created_at` and `updated_at`** — no exceptions  
- **All Server Actions must validate input before touching the database** — use Zod  
- **RLS must be enabled** on every Supabase table exposed to client queries  
- **Never run migrations against production without testing on a branch first** — use Supabase branching  

## Anti-patterns

```
❌ SELECT * in any production query
❌ Storing auth tokens or PII in localStorage — store in DB + Supabase Auth
❌ Skipping RLS on tables accessed by client-side code
❌ N+1 queries — fetch related data with joins or eager loading
❌ Trusting client-supplied user IDs — always derive from auth.uid() in RLS
❌ JSON columns when a normalized table would be more queryable
❌ SQLAlchemy — we are TypeScript-only
```
