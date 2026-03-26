# Migrations

> Zero-downtime migration patterns for Supabase + Drizzle projects. Every schema change in production carries risk — these patterns eliminate the most common failure modes.

---

## Drizzle migration workflow

```bash
# 1. Modify your schema in db/schema/*.ts

# 2. Generate the migration SQL
npx drizzle-kit generate

# 3. Review the generated SQL in db/migrations/ before applying

# 4. Apply to local Supabase
npx drizzle-kit migrate

# 5. Test on Supabase branch (not production)
# Push schema to branch, run against branch DB

# 6. Apply to production
# Via your CI/CD pipeline or Supabase dashboard migration runner
```

Never edit generated migration files after running `generate` — create a new migration instead.

---

## Safe migration patterns

### Adding a column

Adding a NOT NULL column without a default locks the table while PostgreSQL rewrites every row.

```sql
-- ❌ Locks table on large datasets
ALTER TABLE posts ADD COLUMN view_count integer NOT NULL DEFAULT 0;

-- ✅ Three-step zero-downtime approach
-- Step 1: Add as nullable (instant, no lock)
ALTER TABLE posts ADD COLUMN view_count integer;

-- Step 2: Backfill (run in batches if table is large)
UPDATE posts SET view_count = 0 WHERE view_count IS NULL;

-- Step 3: Add NOT NULL constraint (fast if no nulls remain)
ALTER TABLE posts ALTER COLUMN view_count SET NOT NULL;
ALTER TABLE posts ALTER COLUMN view_count SET DEFAULT 0;
```

In Drizzle, use two separate migrations for this:

```ts
// Migration 1: add nullable column
export async function up(db: NodePgDatabase) {
  await db.execute(sql`ALTER TABLE posts ADD COLUMN view_count integer`)
}

// Migration 2 (deploy separately after backfill): add constraint
export async function up(db: NodePgDatabase) {
  await db.execute(sql`ALTER TABLE posts ALTER COLUMN view_count SET NOT NULL`)
  await db.execute(sql`ALTER TABLE posts ALTER COLUMN view_count SET DEFAULT 0`)
}
```

### Removing a column

```
Step 1: Stop reading/writing the column in application code → deploy
Step 2: Remove the column in a migration → deploy
```

Never drop a column and remove application references in the same deployment — the app will crash between migration and deploy completion.

### Renaming a column

```
Step 1: Add the new column name as nullable
Step 2: Write to both old and new column (dual-write)
Step 3: Backfill new column from old column
Step 4: Read from new column, stop writing to old → deploy
Step 5: Drop old column
```

### Adding an index

Always add indexes concurrently — non-concurrent index creation locks the table:

```sql
-- ❌ Locks table during index build
CREATE INDEX ON posts (author_id);

-- ✅ Non-blocking (takes longer, but doesn't lock)
CREATE INDEX CONCURRENTLY ON posts (author_id);
```

In a Drizzle migration file:

```ts
export async function up(db: NodePgDatabase) {
  // CONCURRENTLY can't run inside a transaction — use raw execute
  await db.execute(sql`CREATE INDEX CONCURRENTLY idx_posts_author_id ON posts (author_id)`)
}
```

### Renaming a table

Don't rename a table while any running code references the old name. Use a view as a compatibility shim:

```sql
-- Step 1: Create the new table
CREATE TABLE post_revisions AS SELECT * FROM post_versions;

-- Step 2: Add a view with the old name so existing queries still work
CREATE VIEW post_versions AS SELECT * FROM post_revisions;

-- Step 3: Update application code to use new name
-- Step 4: Drop the view
```

---

## Supabase migration tooling

Supabase tracks migrations in `supabase/migrations/`. If you're using Drizzle, output migrations to `supabase/migrations/` so both tools stay in sync:

```ts
// drizzle.config.ts
export default {
  schema: './db/schema',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

**Supabase branching for safe production migrations:**

```bash
# Create a branch tied to your PR
supabase branches create feature/add-view-count

# Apply migrations to branch
supabase db push --linked

# Test against branch database
# Merge PR → Supabase auto-applies migrations to production
```

---

## Migration philosophy

- **Never make breaking changes in one deployment.** Always expand (add) before contract (remove).  
- **Test every migration on a database copy** — use `supabase db dump` to create a local copy with production schema + sample data.  
- **Run destructive changes in a transaction** so they roll back on error. Exception: `CREATE INDEX CONCURRENTLY` cannot run inside a transaction.  
- **Have a rollback plan** — for every migration, know what the reverse SQL looks like before you run forward.
