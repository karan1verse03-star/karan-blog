# 3. Server-Side Performance

> **Impact: HIGH** — correct RSC composition, request deduplication, and non-blocking side-effects significantly reduce server response times.

---

## Rule 3.1 — Always authenticate inside every Server Action

Server Actions are public HTTP endpoints. Middleware and layout guards are not sufficient — call them directly and they bypass all guards.

```ts
// ❌ No authentication — anyone can invoke this directly
'use server'
export async function deleteComment(commentId: string) {
  await db.comment.delete({ where: { id: commentId } })
}

// ✅ Auth + authorization + input validation inside the action
'use server'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({ commentId: z.string().uuid() })

export async function deleteComment(input: unknown) {
  const { commentId } = schema.parse(input)

  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const comment = await db.comment.findUnique({ where: { id: commentId } })
  if (!comment) throw new Error('Not found')
  if (comment.authorId !== session.user.id && session.user.role !== 'admin') {
    throw new Error('Forbidden')
  }

  await db.comment.delete({ where: { id: commentId } })
}
```

**Order:** validate input → verify authentication → check authorization → mutate.

---

## Rule 3.2 — Deduplicate DB / auth calls with `React.cache()`

`React.cache()` memoizes calls within a single server request. Multiple RSC tree nodes that call `getCurrentUser()` only hit the database once.

```ts
// lib/session.ts
import { cache } from 'react'
import { auth } from '@/lib/auth'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return db.user.findUnique({ where: { id: session.user.id } })
})
```

**Use primitive arguments** — `React.cache()` uses `Object.is` for cache keys. Inline objects always miss:

```ts
// ❌ Always a cache miss — new object reference each call
const getPost = cache(async (params: { id: string }) => ...)
getPost({ id: '1' }) // miss
getPost({ id: '1' }) // miss again

// ✅ Primitive arg hits cache correctly
const getPost = cache(async (id: string) => ...)
getPost('1') // miss — runs query
getPost('1') // hit — returns cached result
```

`React.cache()` is for: DB queries, auth checks, heavy computations, file reads. Next.js already deduplicates `fetch()` calls automatically.

---

## Rule 3.3 — Cross-request caching with LRU

`React.cache()` resets per request. For data that consecutive requests share (e.g., user clicks button A then B, both need the same config), use an in-process LRU cache.

```ts
import { LRUCache } from 'lru-cache'

const postCache = new LRUCache<string, Post>({
  max: 500,
  ttl: 5 * 60 * 1000, // 5 minutes
})

export async function getPost(id: string): Promise<Post | null> {
  const cached = postCache.get(id)
  if (cached) return cached

  const post = await db.post.findUnique({ where: { id } })
  if (post) postCache.set(id, post)
  return post
}
```

On Vercel with Fluid Compute, multiple concurrent requests share the same function instance — the LRU cache is shared across them automatically.

---

## Rule 3.4 — Only pass fields the client actually uses across RSC boundaries

Every prop you pass through a Server → Client boundary is serialized into the HTML payload. Excess fields bloat every page response.

```tsx
// ❌ Serializes all 40 fields of user
async function ProfilePage() {
  const user = await getCurrentUser() // 40 fields
  return <ProfileCard user={user} />  // client component uses 3 fields
}

// ✅ Only serialize what's needed
async function ProfilePage() {
  const user = await getCurrentUser()
  return (
    <ProfileCard
      name={user.name}
      avatarUrl={user.avatarUrl}
      handle={user.handle}
    />
  )
}
```

Also: don't transform arrays on the server and pass both original and derived to the client — transforms break RSC's reference-based deduplication:

```tsx
// ❌ Sends 6 strings (two arrays × 3 items)
<TagList tags={tags} tagsSorted={tags.toSorted()} />

// ✅ Send once; sort in the client component
<TagList tags={tags} />
// Inside TagList: const sorted = useMemo(() => [...tags].sort(), [tags])
```

---

## Rule 3.5 — Use `after()` for non-blocking side-effects

Analytics, audit logging, and notifications should not delay the response. `next/server`'s `after()` runs the callback after the response is sent.

```ts
import { after } from 'next/server'

export async function POST(request: Request) {
  const data = await request.json()
  const post = await createPost(data)

  // This runs after the 201 is already sent to the client
  after(async () => {
    await logAuditEvent({ action: 'post.created', postId: post.id })
    await invalidateCache(`user:${post.authorId}:posts`)
  })

  return Response.json(post, { status: 201 })
}
```

`after()` also works in Server Actions and Server Components. It runs even if the response redirects or throws.
