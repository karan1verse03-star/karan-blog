---
name: systematic-debugging
description: Practical debugging techniques for Next.js and Supabase projects — complements the debugger agent with concrete strategies for the most common failure patterns.
---

# Systematic Debugging

> **When does this activate?**
> Use this when investigating a bug, error, or unexpected behavior in a Next.js or Supabase project. Loaded alongside the debugger agent.

---

## The One Rule

**Never make a change without first forming a hypothesis.** A change without a hypothesis is a guess. Guesses compound into confusion.

---

## Next.js Specific Failures

### Hydration Mismatch

```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

**Cause:** Server and client render different HTML.
**Fix pattern:**

```tsx
// ❌ Renders differently server vs client
<div>{new Date().toLocaleString()}</div>

// ✅ Suppress hydration for truly dynamic content
<div suppressHydrationWarning>{new Date().toLocaleString()}</div>

// ✅ Or use useEffect to render client-only content
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null
```

### Server Component Importing Client Module

```
Error: You're importing a component that needs useState. It only works in a Client Component.
```

**Fix:** Add `'use client'` at the top of the component file, or extract the interactive part into a separate Client Component.

### Stale Cache in Development

**Symptom:** Data doesn't update despite code changes.
**Fix:** Delete `.next/` folder and restart: `rm -rf .next && npm run dev`

---

## Supabase Specific Failures

### RLS Blocking Queries (Silent Empty Results)

**Symptom:** Query returns `[]` or `null` with no error.
**Diagnosis:**

```sql
-- Run in Supabase SQL editor with your user's JWT to test RLS
SELECT * FROM posts WHERE user_id = 'your-user-id';
```

**Fix checklist:**

- Is RLS enabled on the table? (`ALTER TABLE posts ENABLE ROW LEVEL SECURITY`)
- Does a SELECT policy exist for this role?
- Is the `user_id` column matching `auth.uid()`?
- Are you using the server client (not anon client) for admin operations?

### `getSession()` Returns Null in Route Handler

**Cause:** `getSession()` reads from cookies — requires `@supabase/ssr` server client.
**Fix:** Always use `getUser()` instead of `getSession()` in server contexts. `getUser()` validates against the auth server, `getSession()` only reads the cookie.

### Drizzle Query Returns Unexpected Shape

**Diagnosis:** Log the raw query with `.toSQL()` before executing:

```ts
const query = db.select().from(posts).where(eq(posts.userId, userId));
console.log(query.toSQL()); // inspect the generated SQL
const result = await query;
```

---

## React / State Failures

### State Update on Unmounted Component

**Symptom:** Warning in console after navigating away mid-fetch.
**Fix:** Use TanStack Query (handles this automatically) or an `AbortController`:

```ts
useEffect(() => {
  const controller = new AbortController()
  fetch('/api/data', { signal: controller.signal }).then(...)
  return () => controller.abort()
}, [])
```

### Infinite Re-render Loop

**Symptom:** Component renders endlessly, browser freezes.
**Diagnosis:** Check `useEffect` dependencies — an object or array created inline is a new reference every render.

```ts
// ❌ options is a new object every render → infinite loop
useEffect(() => {
  fetchData(options);
}, [options]);

// ✅ Depend on primitives, not objects
useEffect(() => {
  fetchData({ page, limit });
}, [page, limit]);
```

---

## Network / API Failures

### Diagnosing a 500 From a Route Handler

1. Check the Next.js server terminal — the full error stack is there, not in the browser
2. Add structured logging at each step (auth → validate → query)
3. Test the route directly with `curl` or a REST client to isolate from the UI

### CORS Error in Development

**Cause:** Calling an external API directly from the browser.
**Fix:** Proxy through a Next.js route handler — the server has no CORS restrictions.

---

## The Debugging Checklist

When stuck on any bug for more than 10 minutes:

1. Can I reproduce it consistently? If not — is it timing, auth state, or data-dependent?
2. What is the exact error message and stack trace? (Don't paraphrase — read every line)
3. What changed most recently? (git log, recent deploys, data changes)
4. Have I isolated which layer it's in? (UI, route handler, service, database)
5. Have I tested my hypothesis with one targeted change?
