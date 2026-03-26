# 7. JavaScript Performance

> **Impact: LOW-MEDIUM** — micro-optimizations only matter in hot paths. Profile first; then apply these rules where data shows a bottleneck.

---

## Rule 7.1 — Avoid layout thrashing: batch DOM reads and writes

Reading layout properties (`offsetWidth`, `getBoundingClientRect`, `getComputedStyle`) after a style write forces the browser into a synchronous reflow. Batch all reads before all writes.

```ts
// ❌ Each read after write forces a synchronous reflow
function positionTooltip(anchor: HTMLElement, tooltip: HTMLElement) {
  tooltip.style.display = 'block'
  const rect = anchor.getBoundingClientRect() // forces reflow
  tooltip.style.top = `${rect.bottom + 8}px`
  const tooltipWidth = tooltip.offsetWidth // forces another reflow
  tooltip.style.left = `${rect.left - tooltipWidth / 2}px`
}

// ✅ Read everything first, then write
function positionTooltip(anchor: HTMLElement, tooltip: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect() // read
  tooltip.style.display = 'block' // write (no read in between)
  const tooltipWidth = tooltip.offsetWidth  // read — but only needed if display must be block first
  // Better: use CSS and a class toggle instead
}

// ✅ Best: let CSS do layout; just toggle a class
function positionTooltip(anchor: HTMLElement) {
  anchor.classList.add('tooltip-visible')
}
```

In React, avoid reading layout properties inside `useEffect` when a cascading write follows — or use `useLayoutEffect` which runs synchronously before paint.

---

## Rule 7.2 — Build index Maps for repeated lookups

Array `.find()` is O(n). If you call it repeatedly with the same key, build a Map once in O(n) and look up in O(1).

```ts
// ❌ O(n) per order — O(n²) total
function enrichOrders(orders: Order[], users: User[]) {
  return orders.map(order => ({
    ...order,
    user: users.find(u => u.id === order.userId),
  }))
}

// ✅ O(n) to build map + O(1) per lookup = O(n) total
function enrichOrders(orders: Order[], users: User[]) {
  const userById = new Map(users.map(u => [u.id, u]))
  return orders.map(order => ({
    ...order,
    user: userById.get(order.userId),
  }))
}
```

---

## Rule 7.3 — Use `Set` for membership checks

`Array.includes` is O(n); `Set.has` is O(1).

```ts
// ❌ O(n) per check
const allowedRoles = ['admin', 'editor', 'moderator']
const canEdit = allowedRoles.includes(user.role)

// ✅ O(1)
const EDITABLE_ROLES = new Set(['admin', 'editor', 'moderator'])
const canEdit = EDITABLE_ROLES.has(user.role)
```

---

## Rule 7.4 — Use a single loop instead of chained `.filter().map()`

Each method iterates the array independently. For large arrays or hot render paths, combine into one `for...of` loop.

```ts
// ❌ Three iterations over the same users array
const activeAdmins = users
  .filter(u => u.isActive)
  .filter(u => u.role === 'admin')
  .map(u => u.email)

// ✅ One iteration
const activeAdminEmails: string[] = []
for (const u of users) {
  if (u.isActive && u.role === 'admin') {
    activeAdminEmails.push(u.email)
  }
}
```

---

## Rule 7.5 — Use `toSorted()` / `toReversed()` (immutable array methods)

`.sort()` and `.reverse()` mutate in place. Mutating props or state arrays breaks React's immutability model.

```ts
// ❌ Mutates the posts prop array — breaks React state assumptions
function PostList({ posts }: { posts: Post[] }) {
  const sorted = useMemo(
    () => posts.sort((a, b) => b.createdAt - a.createdAt),
    [posts]
  )
  return sorted.map(renderPost)
}

// ✅ Returns a new sorted array
function PostList({ posts }: { posts: Post[] }) {
  const sorted = useMemo(
    () => posts.toSorted((a, b) => b.createdAt - a.createdAt),
    [posts]
  )
  return sorted.map(renderPost)
}
```

Browser support: Chrome 110+, Safari 16+, Firefox 115+, Node 20+. For older envs: `[...posts].sort(...)`.

Also available: `.toReversed()`, `.toSpliced()`, `.with()`.

---

## Rule 7.6 — Find max/min with a single loop, not by sorting

Sorting to extract the first/last element is O(n log n). A single pass is O(n).

```ts
// ❌ O(n log n) — sorts everything to get one value
function latestPost(posts: Post[]) {
  return [...posts].sort((a, b) => b.publishedAt - a.publishedAt)[0]
}

// ✅ O(n)
function latestPost(posts: Post[]) {
  if (posts.length === 0) return null
  let latest = posts[0]
  for (let i = 1; i < posts.length; i++) {
    if (posts[i].publishedAt > latest.publishedAt) latest = posts[i]
  }
  return latest
}
```

---

## Rule 7.7 — Hoist RegExp and module-level caches outside render

Creating a `RegExp` inside a component body allocates a new object on every render. Hoist static patterns to module scope; memoize dynamic patterns.

```tsx
// ❌ New RegExp every render
function TagHighlighter({ text, tag }: { text: string; tag: string }) {
  const regex = new RegExp(`\\b${tag}\\b`, 'gi')
  return <span dangerouslySetInnerHTML={{ __html: text.replace(regex, '<mark>$&</mark>') }} />
}

// ✅ Memoize by tag value
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function TagHighlighter({ text, tag }: { text: string; tag: string }) {
  const regex = useMemo(
    () => new RegExp(`\\b${escapeRegex(tag)}\\b`, 'gi'),
    [tag]
  )
  return <span dangerouslySetInnerHTML={{ __html: text.replace(regex, '<mark>$&</mark>') }} />
}

// Static patterns — always hoist to module scope
const SLUG_REGEX = /[^a-z0-9-]/g
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

---

## Rule 7.8 — Cache expensive function calls at module scope

For pure functions called repeatedly with the same arguments, cache results in a module-level `Map`.

```ts
// ❌ slugify() called for every render of every post card
function PostGrid({ posts }: { posts: Post[] }) {
  return posts.map(p => <PostCard key={p.id} slug={slugify(p.title)} />)
}

// ✅ Cached — each unique title is slugified once per session
const slugCache = new Map<string, string>()

function cachedSlugify(title: string): string {
  if (!slugCache.has(title)) slugCache.set(title, slugify(title))
  return slugCache.get(title)!
}
```

---

## Rule 7.9 — Early return to skip unnecessary work

Check the cheapest conditions first. If the answer can be known from a length check, return before computing anything expensive.

```ts
// ❌ Always sorts and joins even when lengths differ
function tagsChanged(current: string[], original: string[]) {
  return current.toSorted().join() !== original.toSorted().join()
}

// ✅ O(1) early exit for the common case
function tagsChanged(current: string[], original: string[]) {
  if (current.length !== original.length) return true
  const a = current.toSorted()
  const b = original.toSorted()
  return a.some((tag, i) => tag !== b[i])
}
```

---

## Rule 7.10 — Cache `localStorage` / `sessionStorage` reads

Storage API calls are synchronous and slower than a `Map` lookup. Cache reads in memory; invalidate on write.

```ts
const storageCache = new Map<string, string | null>()

export function getItem(key: string): string | null {
  if (!storageCache.has(key)) {
    try {
      storageCache.set(key, localStorage.getItem(key))
    } catch {
      return null
    }
  }
  return storageCache.get(key) ?? null
}

export function setItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
    storageCache.set(key, value)
  } catch {}
}

// Invalidate when another tab modifies storage
window.addEventListener('storage', e => {
  if (e.key) storageCache.delete(e.key)
})
```
