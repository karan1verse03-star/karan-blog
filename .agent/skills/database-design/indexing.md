# Indexing

> Effective indexing is the single highest-impact query optimization. An unindexed foreign key or filter column causes full table scans that grow worse as data scales.

---

## When to create an index

**Always index:**
- Foreign key columns (`author_id`, `org_id`, `user_id`) — PostgreSQL does NOT auto-index FK columns
- Columns used in `WHERE` clauses of frequent queries
- Columns in `ORDER BY` / `LIMIT` patterns (pagination)
- Columns used in `JOIN` conditions

**Avoid indexing:**
- Columns on write-heavy tables where reads are rare — indexes slow down INSERT/UPDATE/DELETE
- Low-cardinality columns (`status` with 3 values, `is_deleted` boolean) — bitmap scan or partial index instead
- Columns that are never filtered or sorted

---

## Drizzle index definitions

```ts
import { pgTable, uuid, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull().references(() => users.id),
  status: text('status').notNull().default('draft'), // 'draft' | 'published' | 'archived'
  publishedAt: timestamp('published_at', { withTimezone: true }),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => ([
  // FK column — always index
  index('idx_posts_author_id').on(t.authorId),

  // Slug must be unique
  uniqueIndex('idx_posts_slug').on(t.slug),

  // Composite: filter by status, sort by publishedAt — common feed query
  index('idx_posts_status_published_at').on(t.status, t.publishedAt),

  // Partial index: only published posts need to be fast-queried
  index('idx_posts_published').on(t.publishedAt).where(sql`published_at IS NOT NULL`),
]))
```

---

## Index type selection

| Type | Use for |
|---|---|
| **B-tree** (default) | Equality and range queries — the right choice for almost everything |
| **GIN** | JSONB column queries, full-text search (`tsvector`), array containment |
| **HNSW** (pgvector) | Vector similarity search (`<->`, `<=>`, `<#>`) |
| **Hash** | Equality-only lookups — rarely worth choosing over B-tree |
| **GiST** | Geometric data, range types, PostGIS — specialized use cases |

```sql
-- Full-text search index (GIN)
CREATE INDEX idx_posts_search ON posts USING GIN (to_tsvector('english', title || ' ' || content));

-- JSONB field index (GIN — for @>, ?, ?| operators)
CREATE INDEX idx_profiles_meta ON profiles USING GIN (metadata);

-- Vector similarity index (HNSW — for pgvector)
CREATE INDEX idx_embeddings_vector ON document_embeddings USING HNSW (embedding vector_cosine_ops);
```

---

## Composite index column ordering

The order of columns in a composite index determines which queries can use it. Follow this rule: **equality columns first, range/sort columns last**.

```sql
-- Query: WHERE author_id = $1 AND status = $2 ORDER BY published_at DESC
-- ✅ Correct order — equality (author_id, status) then range (published_at)
CREATE INDEX ON posts (author_id, status, published_at DESC);

-- ❌ Wrong order — range column first means the index can't be used for status filtering
CREATE INDEX ON posts (published_at, author_id, status);
```

For a query that filters on `author_id = X AND status = 'published' ORDER BY created_at DESC`:

```ts
index('idx_posts_author_status_created').on(t.authorId, t.status, t.createdAt)
// Drizzle doesn't yet support DESC in composite indexes — write as raw SQL migration
```

---

## Partial indexes — the most underused type

Index only the rows that are actually queried. Partial indexes are smaller, faster to update, and fit in memory more easily.

```sql
-- Only index active users (not deleted/banned accounts)
CREATE INDEX idx_users_email_active ON users (email)
WHERE deleted_at IS NULL AND status = 'active';

-- Only index unread notifications (the hot read path)  
CREATE INDEX idx_notifications_unread ON notifications (user_id, created_at DESC)
WHERE read_at IS NULL;

-- Only index published posts for the public feed
CREATE INDEX idx_posts_public_feed ON posts (published_at DESC)
WHERE status = 'published' AND deleted_at IS NULL;
```

---

## Identifying missing indexes

After queries are slow, check with `EXPLAIN ANALYZE`:

```sql
EXPLAIN ANALYZE
SELECT * FROM posts
WHERE author_id = 'some-uuid'
AND status = 'published'
ORDER BY published_at DESC
LIMIT 20;
```

Look for:
- `Seq Scan` on a large table — almost always means a missing index
- High `actual rows` vs low `estimated rows` — stale statistics, run `ANALYZE posts`
- `Sort` without `Index Scan` on the ORDER BY column — add the sort column to the index

In Supabase, run EXPLAIN ANALYZE via the SQL Editor in the dashboard or the Supabase CLI:

```bash
supabase db execute --query "EXPLAIN ANALYZE SELECT ..."
```

---

## Index maintenance

- Run `ANALYZE table_name` after large bulk inserts to update planner statistics  
- Run `REINDEX CONCURRENTLY index_name` if an index becomes bloated after many updates/deletes  
- Monitor index usage in Supabase dashboard → Database → Indexes to find unused indexes (wasted write overhead)
