---
name: nodejs-best-practices
description: Best practices for Node.js in the context of Next.js API routes, Server Actions, and serverless/edge functions — not standalone Express servers.
---

# Node.js Best Practices

> **When does this activate?**
> Use this when writing Next.js route handlers, Server Actions, middleware, or any server-side Node.js logic in a Next.js project.

---

## Next.js Server Context First

Most "Node.js backend" work in a Next.js project is one of three things:

| Context       | File Location        | Rules                                                       |
| ------------- | -------------------- | ----------------------------------------------------------- |
| Route Handler | `app/api/*/route.ts` | Use `NextRequest`/`NextResponse`, keep thin                 |
| Server Action | `app/**/actions.ts`  | Use `'use server'`, validate with Zod, return typed results |
| Middleware    | `middleware.ts`      | Edge runtime — no Node.js APIs, keep under 1ms              |

---

## Route Handler Patterns

```ts
// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

export async function POST(req: NextRequest) {
  // 1. Auth first
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate input
  const body = await req.json();
  const parsed = CreatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 3. Business logic
  const { data, error: dbError } = await supabase
    .from("posts")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (dbError)
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );

  return NextResponse.json(data, { status: 201 });
}
```

---

## Server Actions

```ts
// app/posts/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const Schema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function createPost(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { error } = await supabase.from("posts").insert({
    ...parsed.data,
    user_id: user.id,
  });

  if (error) return { error: "Failed to create post" };

  revalidatePath("/posts");
  return { success: true };
}
```

---

## Async Patterns

- **Always `await` — never fire-and-forget** in request handlers. Use `after()` (Next.js 15) for true background work
- **Parallel independent fetches** — use `Promise.all()`, never sequential `await` for unrelated operations
- **Never block the response** with non-critical work

```ts
// ❌ Sequential — 600ms total
const user = await getUser(id);
const posts = await getPosts(id);

// ✅ Parallel — 300ms total
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

---

## Error Handling

- **Never swallow errors** — always log internally, return clean messages to the client
- **Typed error responses** — consistent shape across all routes (use a `response.ts` helper)
- **Distinguish operational vs programmer errors** — 4xx for bad input, 5xx for unexpected failures

```ts
// lib/api/response.ts
export const ok = <T>(data: T) => NextResponse.json({ data }, { status: 200 });
export const created = <T>(data: T) =>
  NextResponse.json({ data }, { status: 201 });
export const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });
export const badRequest = (error: unknown) =>
  NextResponse.json({ error }, { status: 400 });
export const serverError = () =>
  NextResponse.json({ error: "Internal server error" }, { status: 500 });
```

---

## Environment Variables

- **Validate on startup** — use Zod to parse `process.env` at the top of `lib/env.ts`
- **Never access `process.env` directly** in components or route handlers — import from `lib/env.ts`
- **`NEXT_PUBLIC_` prefix only for values safe to expose to the browser**

```ts
// lib/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export const env = EnvSchema.parse(process.env);
```

---

## Security Rules

- **Validate every input** with Zod before touching the database
- **Auth before logic** — check the user on every protected route, not in middleware alone
- **No secrets in responses** — never return `user.password_hash`, service role keys, or internal IDs
- **Rate limit public endpoints** — use Upstash Ratelimit or Vercel's built-in edge middleware
- **CORS** — configure explicitly in route handlers, never `*` in production
