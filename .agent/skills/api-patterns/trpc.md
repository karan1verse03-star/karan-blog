# tRPC in Next.js App Router

> tRPC gives end-to-end type safety without code generation: the client knows the exact return type of every server procedure at compile time. Use it for internal APIs where both the caller and callee are TypeScript.

---

## When to use tRPC

**Use tRPC when:**
- Both client and server are TypeScript (same repo)
- You don't need the endpoint to be called by external services or mobile clients
- You want type-inferred mutations and queries with no schema file to maintain

**Use Route Handlers instead when:**
- Third-party services need to call your endpoints (webhooks, partner integrations)
- You need a formal REST contract (public API, mobile clients)
- The route must be callable via `curl` or Postman by other teams

**Don't mix** tRPC and Route Handlers for the same resource — pick one approach per feature area.

---

## Setup

```bash
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query zod
```

```ts
// server/trpc.ts — core tRPC setup
import { initTRPC, TRPCError } from '@trpc/server'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import superjson from 'superjson'
import { ZodError } from 'zod'

interface Context {
  user: User | null
}

export async function createTRPCContext(): Promise<Context> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { user }
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure

// Middleware: rejects unauthenticated callers
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { user: ctx.user } }) // user is now non-null in downstream context
})

export const protectedProcedure = t.procedure.use(isAuthenticated)
```

---

## Defining routers

```ts
// server/routers/posts.ts
import { router, publicProcedure, protectedProcedure } from '@/server/trpc'
import { z } from 'zod'
import { db } from '@/db'
import { posts } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

export const postsRouter = router({
  // Public — no auth required
  list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const items = await db
        .select({ id: posts.id, title: posts.title, publishedAt: posts.publishedAt })
        .from(posts)
        .where(
          input.cursor
            ? and(eq(posts.status, 'published'), lt(posts.publishedAt, new Date(input.cursor)))
            : eq(posts.status, 'published')
        )
        .orderBy(desc(posts.publishedAt))
        .limit(input.limit + 1)

      const hasMore = items.length > input.limit
      return {
        items: items.slice(0, input.limit),
        nextCursor: hasMore ? items[input.limit - 1].publishedAt?.toISOString() : null,
      }
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, input.id),
        with: { author: { columns: { displayName: true, avatarUrl: true } } },
      })
      if (!post) throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' })
      return post
    }),

  // Protected — requires auth
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1),
      status: z.enum(['draft', 'published']).default('draft'),
    }))
    .mutation(async ({ ctx, input }) => {
      const [post] = await db
        .insert(posts)
        .values({ ...input, authorId: ctx.user.id })
        .returning()
      return post
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const post = await db.query.posts.findFirst({ where: eq(posts.id, input.id) })
      if (!post) throw new TRPCError({ code: 'NOT_FOUND' })
      if (post.authorId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' })
      await db.delete(posts).where(eq(posts.id, input.id))
      return { success: true }
    }),
})
```

```ts
// server/routers/index.ts — root router
import { router } from '@/server/trpc'
import { postsRouter } from './posts'
import { usersRouter } from './users'

export const appRouter = router({
  posts: postsRouter,
  users: usersRouter,
})

export type AppRouter = typeof appRouter
```

---

## Next.js App Router adapter

```ts
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/routers'
import { createTRPCContext } from '@/server/trpc'

const handler = (request: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: createTRPCContext,
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ error }) => console.error('tRPC error:', error)
        : undefined,
  })

export { handler as GET, handler as POST }
```

---

## Client setup

```ts
// lib/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/routers'

export const trpc = createTRPCReact<AppRouter>()
```

```tsx
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { trpc } from '@/lib/trpc/client'
import superjson from 'superjson'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson,
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

---

## Usage in components

```tsx
// Client Component — query
'use client'

import { trpc } from '@/lib/trpc/client'

export function PostList() {
  const { data, isLoading, error } = trpc.posts.list.useQuery({ limit: 20 })

  if (isLoading) return <PostListSkeleton />
  if (error) return <ErrorMessage message={error.message} />

  return (
    <ul>
      {data?.items.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}

// Client Component — mutation
export function DeletePostButton({ postId }: { postId: string }) {
  const utils = trpc.useUtils()
  const { mutate, isPending } = trpc.posts.delete.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate() // Refetch the post list
    },
  })

  return (
    <button onClick={() => mutate({ id: postId })} disabled={isPending}>
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
```

---

## Server-side tRPC calls (RSC)

```ts
// app/posts/[id]/page.tsx — call tRPC from a Server Component
import { createCaller } from '@trpc/server'
import { appRouter } from '@/server/routers'
import { createTRPCContext } from '@/server/trpc'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Direct caller — no HTTP overhead, no batching
  const caller = createCaller(appRouter, { ctx: await createTRPCContext() })
  const post = await caller.posts.byId({ id })

  return <PostDetail post={post} />
}
```
