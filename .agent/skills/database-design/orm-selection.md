# ORM Selection

> For this stack (Next.js + Supabase + TypeScript), Drizzle is the default. This file explains when to choose something else.

---

## Default choice: Drizzle ORM

Use Drizzle for all new projects unless one of the Prisma conditions below applies.

**Why Drizzle is the default:**
- Smallest bundle size — works correctly in Next.js Edge Runtime and Vercel Edge Functions  
- SQL-like syntax with full TypeScript inference — no "magic" query builder  
- Drizzle Kit generates clean SQL migrations you can review and edit  
- First-class support for Supabase's PostgreSQL connection strings  
- No schema binary / Rust engine process (Prisma requires one)

```ts
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

```ts
// db/index.ts — Drizzle client setup for Next.js
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false, // Required for Supabase's PgBouncer transaction mode
})

export const db = drizzle(client, { schema })
```

---

## Choose Prisma when

- The team has existing Prisma expertise and an existing Prisma schema to maintain  
- You need Prisma Studio for data browsing / QA without writing SQL  
- The project runs exclusively on Node.js (no Edge Runtime) and the Prisma engine overhead is acceptable  
- You prefer schema-first migrations (`prisma migrate dev` feel)

**Prisma limitations to know:**
- Cannot run in Edge Runtime (Next.js Edge middleware, Cloudflare Workers) without Prisma Accelerate  
- Generates a native binary engine; each deployment must bundle it correctly  
- `schema.prisma` syntax is a separate DSL — not TypeScript

```ts
// prisma/schema.prisma — for reference
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Required for Supabase (bypasses PgBouncer for migrations)
}

model Post {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title       String
  authorId    String   @db.Uuid
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now()) @db.Timestamptz
  updatedAt   DateTime @updatedAt @db.Timestamptz
}
```

**Supabase + Prisma**: you need both `DATABASE_URL` (pooled, PgBouncer) and `DIRECT_URL` (direct connection) in your environment:

```
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:password@aws-0-region.supabase.com:5432/postgres
```

---

## Choose raw SQL / Kysely when

- The query is too complex for Drizzle's builder (multi-CTE, complex window functions, dynamic column selection)  
- You need maximum query control and are comfortable writing typed SQL  
- Migrating from an existing raw SQL codebase

```ts
// Drizzle escape hatch for complex queries
import { sql } from 'drizzle-orm'

const result = await db.execute(sql`
  WITH ranked_posts AS (
    SELECT
      id,
      title,
      author_id,
      ROW_NUMBER() OVER (PARTITION BY author_id ORDER BY published_at DESC) AS rn
    FROM posts
    WHERE status = 'published'
  )
  SELECT * FROM ranked_posts WHERE rn = 1
`)
```

---

## Decision summary

| Scenario | Choice |
|---|---|
| New Next.js + Supabase project | **Drizzle** |
| Team already using Prisma | **Prisma** (don't switch mid-project) |
| Edge Runtime required (middleware, edge functions) | **Drizzle** |
| Need a visual schema browser for non-engineers | **Prisma** (Studio) |
| Extremely complex SQL (CTEs, window functions) | Drizzle `sql` tag or **raw SQL** |
| Python / non-TS stack | Not this stack — wrong skill |
