# Row Level Security (RLS) Policies

> RLS is Supabase's primary access control mechanism. Every table accessible from client code must have RLS enabled with explicit policies. An absent policy means no row is accessible — not that all rows are accessible.

---

## RLS fundamentals

**Enable RLS on every table (required):**

```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
```

Without policies, RLS blocks all access. With `FORCE ROW LEVEL SECURITY`, even table owners are restricted. Supabase enables RLS on tables you create via the dashboard, but if you create tables via migration you must enable it explicitly.

**The authenticated user is always `auth.uid()`** — never trust a user-supplied ID in a WHERE clause without checking it against `auth.uid()`.

---

## Common policy patterns

### Users can only see their own rows

```sql
-- Policy: users read their own orders
CREATE POLICY "users_read_own_orders"
ON orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: users insert only for themselves
CREATE POLICY "users_insert_own_orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy: users update only their own orders
CREATE POLICY "users_update_own_orders"
ON orders FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

### Public read, authenticated write

```sql
-- Anyone can read published posts
CREATE POLICY "public_read_published_posts"
ON posts FOR SELECT
USING (published_at IS NOT NULL);

-- Authors create posts for themselves
CREATE POLICY "authors_create_posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

-- Authors edit only their own posts
CREATE POLICY "authors_update_own_posts"
ON posts FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

-- Authors delete only their own posts
CREATE POLICY "authors_delete_own_posts"
ON posts FOR DELETE
TO authenticated
USING (author_id = auth.uid());
```

### Role-based access (admin vs user)

Store roles on the `profiles` table and reference them in policies:

```sql
-- Admins can read all orders; users read their own
CREATE POLICY "order_select_policy"
ON orders FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

**Performance note:** EXISTS subqueries against `profiles` run per-row. For high-traffic tables, cache the role in a JWT claim instead (see Supabase custom claims).

### Organization / team access

```sql
-- Users can read posts from their organization
CREATE POLICY "org_members_read_posts"
ON posts FOR SELECT
TO authenticated
USING (
  org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  )
);
```

---

## `USING` vs `WITH CHECK`

| Clause | Applies to | Purpose |
|---|---|---|
| `USING` | SELECT, UPDATE, DELETE | Filter which rows the operation can see/affect |
| `WITH CHECK` | INSERT, UPDATE | Validate the row being written |

Always include both for INSERT and UPDATE policies. A `WITH CHECK`-only INSERT policy lets users read all rows; a `USING`-only UPDATE policy lets users update rows they can't see.

---

## Service role bypass

The Supabase `service_role` key bypasses RLS entirely. Use it only in trusted server-side code (Server Actions, Route Handlers, cron jobs) — never in client components or exposed to the browser.

```ts
// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js'

// Only for server-side, privileged operations
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Never expose this to the client
  { auth: { persistSession: false } }
)
```

For normal server-side code that should still respect RLS (reading data on behalf of a logged-in user), use the server client with the user's session cookie:

```ts
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

---

## Drizzle + RLS

Drizzle doesn't generate RLS policies from TypeScript — write them as raw SQL migrations. Keep policy SQL alongside your Drizzle schema files:

```
db/
  schema/
    posts.ts         ← Drizzle table definition
    posts.sql        ← RLS policies for this table (run via migration)
  migrations/
    0001_initial.sql
    0002_posts_rls.sql
```

When using Drizzle's `db.query` API on the server with the anon key, RLS applies automatically based on the requesting user's JWT.

---

## RLS policy checklist

Before shipping any table:

- [ ] `ALTER TABLE x ENABLE ROW LEVEL SECURITY` in migration
- [ ] SELECT policy: who can read rows (authenticated / public / owner-only)
- [ ] INSERT policy with `WITH CHECK` referencing `auth.uid()`
- [ ] UPDATE policy with both `USING` and `WITH CHECK`
- [ ] DELETE policy: is cascade sufficient, or explicit policy needed?
- [ ] Tested with anon key + authenticated user key (not service role)
