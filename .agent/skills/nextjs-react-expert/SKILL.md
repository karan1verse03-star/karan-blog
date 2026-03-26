---
name: nextjs-react-expert
description: Next.js 14+ App Router and React 18/19 performance patterns — activate when building, reviewing, or optimising any Next.js or React component, route, or data-fetching layer.
---

# Next.js & React Expert

> **When does this activate?**
> Any task involving React components, Next.js App Router pages/layouts, Server Actions, Route Handlers, data fetching strategy, bundle size, or render performance. This is the default skill for all Next.js / React work.

## Sub-file map

Load the sub-file that matches your current problem. You do not need to read all of them.

| Sub-file                     | When to read                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| `1-async-waterfalls.md`      | Sequential `await` chains, slow page loads, waterfall data fetching                  |
| `2-bundle-optimization.md`   | Large bundle, slow TTI, barrel imports, dynamic import decisions                     |
| `3-server-performance.md`    | Slow SSR, Server Actions auth, RSC boundary serialization, `React.cache()`           |
| `4-client-data-fetching.md`  | SWR patterns, event listener deduplication, `localStorage` access                    |
| `5-rerender-optimization.md` | Excessive re-renders, `useMemo`/`useCallback` decisions, derived state               |
| `6-rendering-performance.md` | Hydration mismatches, `useTransition`, `content-visibility`, conditional render bugs |
| `7-js-performance.md`        | Hot-path loops, Set/Map vs arrays, layout thrashing, RegExp hoisting                 |
| `8-advanced-patterns.md`     | `useEffectEvent`, stable subscriptions, app-init guards                              |

## Optimization priority

When doing a full performance review, work in this order — each level has 10× more impact than the next:

1. **Eliminate waterfalls** — every sequential `await` for independent data adds 100–500 ms
2. **Reduce bundle size** — barrel imports alone cost 200–800 ms on cold starts
3. **Server-side performance** — RSC composition, `React.cache()`, `after()`
4. **Client data fetching** — SWR deduplication, storage caching
5. **Re-render reduction** — memoization, derived state, transitions
6. **Rendering efficiency** — hydration, `content-visibility`, conditional render bugs
7. **JS micro-optimizations** — loops, data structures, RegExp, immutable arrays

## Pre-ship checklist

**Must fix:**

- [ ] No sequential `await` for independent operations — use `Promise.all()` or start promises early
- [ ] No barrel imports from large libraries — use `optimizePackageImports` or direct imports
- [ ] No `fetch` / DB queries inside a `useEffect` without SWR or React Query
- [ ] Every Server Action has auth + input validation inside the action body

**Should fix:**

- [ ] Server Components used by default; `'use client'` added only when necessary
- [ ] Heavy components lazy-loaded with `next/dynamic`
- [ ] Suspense boundaries placed at the right granularity (not wrapping everything)
- [ ] `React.cache()` applied to DB queries called from multiple RSC tree nodes

**Nice to have:**

- [ ] `startTransition` / `useTransition` for search, filters, tab switches
- [ ] `content-visibility: auto` on long scrollable lists
- [ ] `useRef` instead of `useState` for values that drive DOM mutations directly

## Anti-patterns — never do these

```ts
// ❌ Sequential independent awaits
const user = await getUser(id);
const posts = await getPosts(id); // waits for user unnecessarily

// ✅ Parallel
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

```ts
// ❌ Barrel import
import { Button, Input, Modal } from "@/components";

// ✅ Direct import
import { Button } from "@/components/button";
```

```ts
// ❌ Unauthenticated Server Action
"use server";
export async function deletePost(id: string) {
  await db.post.delete({ where: { id } });
}

// ✅ Always guard inside the action
("use server");
export async function deletePost(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  await db.post.delete({ where: { id, authorId: session.user.id } });
}
```
