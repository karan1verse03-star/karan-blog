# Response Format

> Consistency in response shape is more important than which shape you pick. Pick one and use it everywhere in the project.

---

## Standard response envelope

Use this shape for all Route Handler responses:

```ts
// lib/api/response.ts — helpers that enforce consistency

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

type SuccessResponse<T> = { data: T; meta?: Record<string, unknown> }
type ErrorResponse = { error: string; code?: string; details?: unknown }

export function ok<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  const body: SuccessResponse<T> = meta ? { data, meta } : { data }
  return NextResponse.json(body, { status })
}

export function created<T>(data: T) {
  return NextResponse.json({ data } satisfies SuccessResponse<T>, { status: 201 })
}

export function noContent() {
  return new NextResponse(null, { status: 204 })
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { error: message, details } satisfies ErrorResponse,
    { status: 400 }
  )
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message } satisfies ErrorResponse, { status: 401 })
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message } satisfies ErrorResponse, { status: 403 })
}

export function notFound(resource = 'Resource') {
  return NextResponse.json(
    { error: `${resource} not found` } satisfies ErrorResponse,
    { status: 404 }
  )
}

export function validationError(error: ZodError) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.flatten().fieldErrors,
    } satisfies ErrorResponse,
    { status: 422 }
  )
}

export function serverError(message = 'Internal server error') {
  // Log the real error server-side; return a generic message to the client
  return NextResponse.json({ error: message } satisfies ErrorResponse, { status: 500 })
}
```

**Using the helpers:**

```ts
// app/api/posts/[id]/route.ts
import { ok, notFound, unauthorized, validationError } from '@/lib/api/response'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) })
  if (!post) return notFound('Post')
  return ok(post)
}
```

---

## Error response shape

All error responses follow this structure:

```json
{
  "error": "Human-readable message safe to display",
  "code": "MACHINE_READABLE_CODE",  // optional, for programmatic handling
  "details": { "field": ["error message"] }  // optional, for validation errors
}
```

**What to include:**
- `error` — a safe, user-friendly message (never a DB error, stack trace, or internal ID)
- `code` — optional machine-readable code for the client to branch on (`DUPLICATE_SLUG`, `INSUFFICIENT_CREDITS`)
- `details` — Zod field errors for validation failures (422 only)

**What to never include:**
- SQL error messages (`duplicate key value violates unique constraint`)
- Stack traces
- Internal table names, column names, or query strings
- Supabase error codes or HTTP internals

```ts
// ❌ Leaks internal details
return NextResponse.json({ error: err.message }, { status: 500 })

// ✅ Generic message; log the real error server-side
console.error('[POST /api/posts]', err)
return serverError()
```

---

## Pagination format

**Offset pagination response:**

```ts
// Consistent paginated response shape
type PaginatedResponse<T> = {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')))
  const offset = (page - 1) * limit

  const [items, [{ count }]] = await Promise.all([
    db.select().from(posts).limit(limit).offset(offset).orderBy(desc(posts.createdAt)),
    db.select({ count: sql<number>`count(*)::int` }).from(posts),
  ])

  const totalPages = Math.ceil(count / limit)

  return ok(items, {
    page,
    limit,
    total: count,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  })
}
```

Response:
```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 94,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

**Cursor pagination response (for feeds and infinite scroll):**

```ts
type CursorResponse<T> = {
  data: T[]
  meta: { nextCursor: string | null; hasMore: boolean }
}

export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get('cursor')
  const limit = 20

  const items = await db
    .select()
    .from(posts)
    .where(
      cursor
        ? and(eq(posts.status, 'published'), lt(posts.createdAt, new Date(cursor)))
        : eq(posts.status, 'published')
    )
    .orderBy(desc(posts.createdAt))
    .limit(limit + 1) // +1 to detect if there are more

  const hasMore = items.length > limit
  const data = items.slice(0, limit)
  const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null

  return ok(data, { nextCursor, hasMore })
}
```

**When to use which:**

| Pattern | Use when |
|---|---|
| Offset | Admin tables, search results where users jump to page N |
| Cursor | Feeds, notifications, timeline — data sorted by time and frequently updated |

---

## Server Action response format

Server Actions can't use `NextResponse` — return a plain object or throw:

```ts
// Pattern: return { data } on success, { error } on failure
'use server'

type ActionResult<T> =
  | { data: T; error?: never }
  | { error: string; details?: Record<string, string[]>; data?: never }

export async function createPost(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in' }

  const result = schema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return { error: 'Validation failed', details: result.error.flatten().fieldErrors }
  }

  try {
    const [post] = await db.insert(posts).values({ ...result.data, authorId: user.id }).returning()
    return { data: { id: post.id } }
  } catch {
    return { error: 'Failed to create post. Please try again.' }
  }
}
```

Client usage:

```tsx
'use client'
const result = await createPost(formData)
if (result.error) {
  toast.error(result.error)
} else {
  router.push(`/posts/${result.data.id}`)
}
```
