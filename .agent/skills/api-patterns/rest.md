# REST Route Handlers

> Next.js App Router Route Handlers are the standard for external-facing REST APIs. This covers structure, naming, HTTP method/status semantics, and input validation.

---

## Route Handler anatomy

```ts
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { db } from '@/db'
import { posts } from '@/db/schema'

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  status: z.enum(['draft', 'published']).default('draft'),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') ?? '1')
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 100)

  const result = await db
    .select({ id: posts.id, title: posts.title, status: posts.status })
    .from(posts)
    .limit(limit)
    .offset((page - 1) * limit)

  return NextResponse.json({ data: result })
}

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Validate input
  const body = await request.json()
  const result = createPostSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  // 3. Mutate
  const [post] = await db
    .insert(posts)
    .values({ ...result.data, authorId: user.id })
    .returning({ id: posts.id, title: posts.title })

  return NextResponse.json({ data: post }, { status: 201 })
}
```

---

## Resource naming rules

| Rule | Wrong | Right |
|---|---|---|
| Nouns not verbs | `/api/getUser` | `/api/users` |
| Plural resources | `/api/user` | `/api/users` |
| Lowercase hyphenated | `/api/userProfiles` | `/api/user-profiles` |
| Nest for ownership | `/api/getUserPosts` | `/api/users/[userId]/posts` |
| Max 3 levels deep | `/api/a/b/c/d/e` | `/api/posts/[id]/comments` |

```
/api/posts                     → collection
/api/posts/[id]                → single resource
/api/posts/[id]/comments       → nested collection (owned by post)
/api/users/[id]/posts          → posts belonging to a user
```

---

## HTTP method semantics

| Method | Semantics | Idempotent | Use in Next.js |
|---|---|---|---|
| `GET` | Read — never side-effects | Yes | Route Handler |
| `POST` | Create new resource | No | Route Handler or Server Action |
| `PUT` | Replace entire resource | Yes | Route Handler |
| `PATCH` | Partial update | No | Route Handler or Server Action |
| `DELETE` | Remove resource | Yes | Route Handler or Server Action |

Use Server Actions for mutations triggered from React components (form submits, button clicks). Use Route Handlers for mutations called from external systems, webhooks, or mobile clients.

---

## Status code selection

Use the correct code — don't return `200` for errors.

| Situation | Code | Notes |
|---|---|---|
| Successful read | `200 OK` | |
| Resource created | `201 Created` | Return the created resource |
| Successful delete / no body | `204 No Content` | |
| Bad request shape | `400 Bad Request` | Malformed JSON, missing required field |
| Missing or invalid auth token | `401 Unauthorized` | Session expired, no cookie |
| Valid auth, wrong permission | `403 Forbidden` | Authenticated but not authorized |
| Resource not found | `404 Not Found` | |
| State conflict | `409 Conflict` | Duplicate slug, concurrent edit conflict |
| Zod validation failure | `422 Unprocessable Entity` | Valid JSON, invalid values |
| Server crash | `500 Internal Server Error` | Never expose stack trace |

---

## Dynamic route segments

```
app/api/posts/route.ts          → GET /api/posts, POST /api/posts
app/api/posts/[id]/route.ts     → GET /api/posts/123, PATCH /api/posts/123, DELETE /api/posts/123
```

```ts
// app/api/posts/[id]/route.ts
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: { author: { columns: { displayName: true } } },
  })

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json({ data: post })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (post.authorId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.delete(posts).where(eq(posts.id, id))
  return new NextResponse(null, { status: 204 })
}
```

---

## Webhook handlers

For inbound webhooks (Stripe, GitHub, Supabase), verify the signature before processing:

```ts
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object)
      break
  }

  return NextResponse.json({ received: true })
}
```
