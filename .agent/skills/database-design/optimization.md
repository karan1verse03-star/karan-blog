# Query Optimization

> Fix slow queries systematically: identify the problem with EXPLAIN ANALYZE, then apply the correct pattern. Profile before optimizing.

---

## The N+1 problem

N+1 occurs when you fetch a list of records, then run a separate query per record to fetch related data.

```ts
// ❌ N+1 — 1 query for posts + N queries for authors
const posts = await db.select().from(postsTable)

for (const post of posts) {
  const author = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, post.authorId))
    .then(r => r[0])
  
  post.author = author // 100 posts = 101 queries
}
```

**Fix 1: JOIN (single query)**

```ts
// ✅ One query — always prefer this for simple one-to-many
const postsWithAuthors = await db
  .select({
    id: postsTable.id,
    title: postsTable.title,
    authorName: usersTable.displayName,
    authorAvatarUrl: usersTable.avatarUrl,
  })
  .from(postsTable)
  .innerJoin(usersTable, eq(postsTable.authorId, usersTable.id))
  .where(eq(postsTable.status, 'published'))
  .orderBy(desc(postsTable.publishedAt))
  .limit(20)
```

**Fix 2: Drizzle relational query (eager loading)**

```ts
// ✅ Drizzle handles the join automatically
const postsWithAuthors = await db.query.posts.findMany({
  where: eq(posts.status, 'published'),
  orderBy: desc(posts.publishedAt),
  limit: 20,
  with: {
    author: {
      columns: { displayName: true, avatarUrl: true },
    },
    tags: true,
  },
})
```

**Fix 3: Batch fetch then join in code (for complex cases)**

```ts
// ✅ 2 queries total, joined in TypeScript
const posts = await db.select().from(postsTable).limit(20)
const authorIds = [...new Set(posts.map(p => p.authorId))]

const authors = await db
  .select()
  .from(usersTable)
  .where(inArray(usersTable.id, authorIds))

const authorById = new Map(authors.map(a => [a.id, a]))
const result = posts.map(p => ({ ...p, author: authorById.get(p.authorId) }))
```

Use Fix 3 when: the relationship is many-to-many, the related set is large and would make a JOIN expensive, or the related data comes from a different data source.

---

## SELECT only what you need

`SELECT *` serializes all columns across the network and through the ORM. On tables with `text`/`jsonb` columns, this adds meaningful overhead.

```ts
// ❌ Fetches all 15 columns including content, metadata, embeddings
const posts = await db.select().from(postsTable)

// ✅ Fetch only what the component needs
const posts = await db
  .select({
    id: postsTable.id,
    title: postsTable.title,
    slug: postsTable.slug,
    publishedAt: postsTable.publishedAt,
    authorId: postsTable.authorId,
  })
  .from(postsTable)
  .where(eq(postsTable.status, 'published'))
```

---

## Pagination — always paginate at the database level

Never fetch all rows and paginate in JavaScript.

**Offset pagination (simple, for low page numbers):**

```ts
const PAGE_SIZE = 20

async function getPosts(page: number) {
  return db
    .select({ id: posts.id, title: posts.title, publishedAt: posts.publishedAt })
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt))
    .limit(PAGE_SIZE)
    .offset(page * PAGE_SIZE)
}
```

Offset pagination becomes slow at high page numbers (PostgreSQL must scan and discard all previous rows). Use cursor pagination for feeds, infinite scroll, and large datasets.

**Cursor pagination (correct for feeds and infinite scroll):**

```ts
async function getPostsFeed(cursor?: string) {
  const PAGE_SIZE = 20

  return db
    .select({ id: posts.id, title: posts.title, publishedAt: posts.publishedAt })
    .from(posts)
    .where(
      cursor
        ? and(
            eq(posts.status, 'published'),
            lt(posts.publishedAt, new Date(cursor)) // items before the cursor date
          )
        : eq(posts.status, 'published')
    )
    .orderBy(desc(posts.publishedAt))
    .limit(PAGE_SIZE + 1) // fetch one extra to know if there's a next page
    .then(rows => ({
      items: rows.slice(0, PAGE_SIZE),
      nextCursor: rows.length > PAGE_SIZE
        ? rows[PAGE_SIZE - 1].publishedAt?.toISOString()
        : null,
    }))
}
```

---

## Supabase query optimization

**Use Supabase's built-in EXPLAIN via the dashboard:**

Dashboard → Database → Query Performance shows slow queries automatically. For ad-hoc analysis:

```sql
-- In Supabase SQL Editor
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT p.id, p.title, u.display_name
FROM posts p
JOIN users u ON u.id = p.author_id
WHERE p.status = 'published'
ORDER BY p.published_at DESC
LIMIT 20;
```

**What to look for:**
- `Seq Scan` on the main table → missing index on `status` or `published_at`  
- `Hash Join` vs `Nested Loop` — Hash Join is better for large result sets; Nested Loop is better when the inner set is small  
- `actual rows=1000 / estimated rows=10` — stale statistics; run `ANALYZE posts`  
- `Sort (cost=X)` without an index → add `ORDER BY` column to the index

---

## Drizzle query patterns to avoid

```ts
// ❌ Load-then-filter in TypeScript — fetches entire table
const allPosts = await db.select().from(posts)
const published = allPosts.filter(p => p.status === 'published')

// ✅ Filter in the database
const published = await db
  .select()
  .from(posts)
  .where(eq(posts.status, 'published'))

// ❌ Compute aggregates in code
const posts = await db.select().from(posts)
const total = posts.length

// ✅ Compute in database
const [{ count }] = await db
  .select({ count: sql<number>`count(*)::int` })
  .from(posts)
  .where(eq(posts.status, 'published'))

// ❌ Deeply nested N+1 via repeated queries
for (const post of posts) {
  for (const comment of post.comments) {
    comment.author = await getUser(comment.authorId) // N×M queries
  }
}

// ✅ Drizzle relational query handles nesting
const result = await db.query.posts.findMany({
  with: { comments: { with: { author: true } } },
})
```
