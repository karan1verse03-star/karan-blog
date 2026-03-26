# Auth Patterns — Supabase Auth + JWT

> Authentication in this stack runs through Supabase Auth. JWTs are issued and rotated by Supabase; we validate them on the server using the Supabase server client. Never manually parse or verify JWTs yourself.

---

## How Supabase Auth works in Next.js

1. User signs in via `supabase.auth.signInWith*()` on the client  
2. Supabase sets `sb-*` session cookies (access token + refresh token)  
3. Every server request reads the cookie via `@supabase/ssr`'s server client  
4. `supabase.auth.getUser()` validates the token with Supabase's server — **this is the only trusted source of identity**

**Never use `getSession()` for authorization decisions on the server** — it reads from the cookie without server-side validation and can be spoofed. Always use `getUser()`.

---

## Supabase client setup

```ts
// lib/supabase/server.ts — server-side client (Route Handlers, Server Actions, RSC)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/db/database.types'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {} // Server Components can't set cookies — safe to ignore
        },
      },
    }
  )
}
```

```ts
// lib/supabase/client.ts — browser client (Client Components)
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/db/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## Protecting Route Handlers

```ts
// app/api/posts/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // ✅ getUser() — server-validates the JWT with Supabase
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // user.id is now trusted — use it as the authorId
  const body = await request.json()
  // ... validate + insert
}
```

---

## Protecting Server Actions

```ts
// app/actions/posts.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
})

export async function createPost(formData: FormData) {
  // 1. Authenticate
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Validate
  const result = schema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  })
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  // 3. Mutate — user.id is trusted, never take it from formData
  await db.insert(posts).values({
    ...result.data,
    authorId: user.id,
  })

  redirect('/dashboard/posts')
}
```

---

## Auth helper — reusable `requireAuth`

Create a helper to avoid repeating the auth boilerplate in every Route Handler:

```ts
// lib/auth.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

export async function requireAuth(): Promise<
  { user: User; error: null } | { user: null; error: NextResponse }
> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { user, error: null }
}

// Usage in Route Handler
export async function DELETE(request: Request) {
  const { user, error } = await requireAuth()
  if (error) return error
  // user is typed as User here
}
```

---

## Supabase Auth providers

```ts
// Client Component — sign in with OAuth
const supabase = createClient()

await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    scopes: 'read:user user:email',
  },
})

// Magic link (passwordless email)
await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})

// Email + password
await supabase.auth.signInWithPassword({ email, password })
```

```ts
// app/auth/callback/route.ts — handle OAuth redirect
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
```

---

## API key authentication (server-to-server)

For programmatic access from other services (cron jobs, third-party integrations), use API keys stored in the database — not Supabase JWTs.

```ts
// lib/api-key.ts
import { db } from '@/db'
import { apiKeys } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createHash } from 'crypto'

export async function validateApiKey(rawKey: string) {
  // Hash the key before comparing — never store raw keys
  const hash = createHash('sha256').update(rawKey).digest('hex')

  const key = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.keyHash, hash),
    with: { owner: true },
  })

  if (!key || key.revokedAt || (key.expiresAt && key.expiresAt < new Date())) {
    return null
  }

  // Update last-used timestamp without blocking the response
  void db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id))

  return key.owner
}

// Usage in Route Handler
export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const rawKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!rawKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
  }

  const owner = await validateApiKey(rawKey)
  if (!owner) {
    return NextResponse.json({ error: 'Invalid or expired API key' }, { status: 401 })
  }

  // owner is the service/user that owns this key
}
```

```ts
// db/schema/api-keys.ts
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  keyHash: text('key_hash').notNull().unique(), // sha256 of raw key
  name: text('name').notNull(),                  // "Production cron job"
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
```

---

## JWT custom claims (role + org in token)

Add custom claims to the Supabase JWT so you can read the user's role without a DB query in hot paths:

```sql
-- Supabase Auth Hook: runs after every token mint
CREATE OR REPLACE FUNCTION add_custom_claims(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(COALESCE(user_role, 'user')));

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Access in server code after `getUser()`:

```ts
const { data: { user } } = await supabase.auth.getUser()
const role = user?.app_metadata?.user_role ?? 'user'
```

**Important:** JWT claims are not re-evaluated on every request — they're embedded at sign-in and refresh. Don't use them for frequently-changing data (user status, ban flags). Use a DB lookup for those.
