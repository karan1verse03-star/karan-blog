# 1. Eliminating Async Waterfalls

> **Impact: CRITICAL** — every sequential `await` for independent data adds one full round-trip of latency (100–500 ms in production). Fix these before anything else.

---

## Rule 1.1 — Defer `await` until the value is actually needed

Don't `await` a value in a code path that may return before using it.

```ts
// ❌ Fetches permissions even when resource is missing
async function updatePost(postId: string, userId: string) {
  const permissions = await getPermissions(userId)
  const post = await getPost(postId)
  if (!post) return { error: 'Not found' }
  if (!permissions.canEdit) return { error: 'Forbidden' }
  return updatePostData(post, permissions)
}

// ✅ Only fetches what each branch needs
async function updatePost(postId: string, userId: string) {
  const post = await getPost(postId)
  if (!post) return { error: 'Not found' }

  const permissions = await getPermissions(userId)
  if (!permissions.canEdit) return { error: 'Forbidden' }

  return updatePostData(post, permissions)
}
```

---

## Rule 1.2 — Run independent operations in parallel with `Promise.all()`

```ts
// ❌ Three sequential round-trips
const profile = await getProfile(userId)
const posts = await getUserPosts(userId)
const followers = await getFollowers(userId)

// ✅ One round-trip
const [profile, posts, followers] = await Promise.all([
  getProfile(userId),
  getUserPosts(userId),
  getFollowers(userId),
])
```

---

## Rule 1.3 — Start promises early when there are partial dependencies

When operation C depends on A but not B, start A and B immediately, then await A before starting C.

```ts
// ❌ Config waits for session even though it doesn't need it
export async function GET() {
  const session = await auth()
  const config = await getConfig()
  const feed = await getFeed(session.user.id)
  return Response.json({ feed, config })
}

// ✅ Session and config start simultaneously
export async function GET() {
  const sessionPromise = auth()
  const configPromise = getConfig()
  const session = await sessionPromise
  const [config, feed] = await Promise.all([
    configPromise,
    getFeed(session.user.id),
  ])
  return Response.json({ feed, config })
}
```

For complex dependency graphs, start each promise as a chain from its dependency:

```ts
const userPromise = getUser(userId)
const postsPromise = userPromise.then(u => getUserPosts(u.id))

const [user, config, posts] = await Promise.all([
  userPromise,
  getConfig(),
  postsPromise,
])
```

---

## Rule 1.4 — Use Suspense boundaries so the page shell renders immediately

Awaiting data inside a page component blocks the entire layout. Move fetching into child Server Components and wrap them in `<Suspense>`.

```tsx
// ❌ Entire page blocked while dashboard data loads
export default async function DashboardPage() {
  const stats = await getDashboardStats(userId)
  return (
    <div>
      <Sidebar />
      <StatsGrid stats={stats} />
    </div>
  )
}

// ✅ Shell renders immediately; stats stream in
export default function DashboardPage() {
  return (
    <div>
      <Sidebar />
      <Suspense fallback={<StatsGridSkeleton />}>
        <StatsGrid />
      </Suspense>
    </div>
  )
}

async function StatsGrid() {
  const stats = await getDashboardStats(userId)
  return <StatsGridUI stats={stats} />
}
```

**Share one promise across multiple suspended children** to avoid duplicate fetches:

```tsx
export default function FeedPage() {
  const feedPromise = getFeed(userId) // started once, not awaited

  return (
    <Suspense fallback={<FeedSkeleton />}>
      <FeedList feedPromise={feedPromise} />
      <FeedSidebar feedPromise={feedPromise} />
    </Suspense>
  )
}

function FeedList({ feedPromise }: { feedPromise: Promise<Feed> }) {
  const feed = use(feedPromise) // React 19 — unwraps the shared promise
  return <ul>{feed.items.map(renderItem)}</ul>
}
```

**When NOT to use Suspense:** critical above-the-fold content, SEO-essential data, or queries fast enough that the skeleton flash hurts more than it helps.

---

## Rule 1.5 — Parallel RSC composition

React Server Components execute sequentially when a parent `await`s before rendering children. Remove the `await` from the parent and delegate fetching to leaf components.

```tsx
// ❌ Sidebar waits for the header fetch to finish
export default async function Page() {
  const header = await getHeader()
  return (
    <div>
      <div>{header.title}</div>
      <Sidebar />   {/* Sidebar can't start until header resolves */}
    </div>
  )
}

// ✅ Both fetch in parallel
async function Header() {
  const header = await getHeader()
  return <div>{header.title}</div>
}

async function Sidebar() {
  const items = await getSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

export default function Page() {
  return (
    <div>
      <Header />
      <Sidebar />
    </div>
  )
}
```
