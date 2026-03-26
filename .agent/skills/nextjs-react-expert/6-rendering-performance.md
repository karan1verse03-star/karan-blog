# 6. Rendering Performance

> **Impact: MEDIUM** — these rules prevent the most common browser rendering pitfalls: hydration mismatches, layout thrashing from conditional renders, and missed GPU-acceleration opportunities.

---

## Rule 6.1 — Prevent hydration mismatch without a flash

Reading `localStorage` or `document.cookie` inside a component that also renders on the server causes either a server crash or a visible flash from light → dark (or vice versa). The fix is a synchronous inline script that patches the DOM before React hydrates, so the first paint already has the correct value.

```tsx
// ❌ Crashes on server — localStorage is undefined
function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = localStorage.getItem('theme') || 'light'
  return <div className={theme}>{children}</div>
}

// ❌ Correct SSR but flashes — effect runs after hydration
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('light')
  useEffect(() => {
    setTheme(localStorage.getItem('theme') ?? 'light')
  }, [])
  return <div className={theme}>{children}</div>
}

// ✅ No flash, no mismatch — inline script runs before paint
function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <div id="theme-root">{children}</div>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{
            var t=localStorage.getItem('theme')||'light';
            document.getElementById('theme-root').className=t;
          }catch(e){}}())`,
        }}
      />
    </>
  )
}
```

Use `suppressHydrationWarning` only for known expected mismatches (timestamps, locale-formatted dates) — not to silence real bugs:

```tsx
function LiveTimestamp() {
  return <time suppressHydrationWarning>{new Date().toLocaleString()}</time>
}
```

---

## Rule 6.2 — Use `useTransition` instead of manual loading state

Manual `isLoading` state requires three `setState` calls (set true, fetch, set false) and leaves the state inconsistent if the fetch throws. `useTransition` handles pending state automatically and interrupts superseded transitions.

```tsx
// ❌ Manual loading state — error-prone, doesn't interrupt stale fetches
function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadCategory = async (category: string) => {
    setIsLoading(true)
    const data = await getPostsByCategory(category)
    setPosts(data)
    setIsLoading(false) // Not called if getPostsByCategory throws
  }

  return (
    <>
      <CategoryTabs onSelect={loadCategory} />
      {isLoading && <Spinner />}
      <PostList posts={posts} />
    </>
  )
}

// ✅ useTransition — pending auto-resets on throw, interrupts stale fetches
import { useTransition, useState } from 'react'

function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isPending, startTransition] = useTransition()

  const loadCategory = (category: string) => {
    startTransition(async () => {
      const data = await getPostsByCategory(category)
      setPosts(data)
    })
  }

  return (
    <>
      <CategoryTabs onSelect={loadCategory} />
      {isPending && <Spinner />}
      <PostList posts={posts} />
    </>
  )
}
```

---

## Rule 6.3 — Use `content-visibility: auto` for long scrollable lists

The browser renders all DOM nodes even when they're off-screen. `content-visibility: auto` skips layout and paint for off-screen items. For a 1,000-item feed, this gives ~10× faster initial render.

```css
/* globals.css */
.feed-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 96px; /* estimated row height — prevents scroll jump */
}
```

```tsx
function ActivityFeed({ events }: { events: AuditEvent[] }) {
  return (
    <div className="overflow-y-auto h-screen">
      {events.map(event => (
        <div key={event.id} className="feed-item">
          <EventRow event={event} />
        </div>
      ))}
    </div>
  )
}
```

Use this when rendering > 100 off-screen rows. Not needed when virtualizing with `react-window` or `@tanstack/virtual`.

---

## Rule 6.4 — Use explicit ternaries for conditional rendering of falsy numbers

The `&&` short-circuit renders the left operand when it's `0` or `NaN`:

```tsx
// ❌ Renders "0" when count is 0
function NotificationDot({ count }: { count: number }) {
  return <div>{count && <span className="badge">{count}</span>}</div>
}

// ✅ Renders nothing when count is 0
function NotificationDot({ count }: { count: number }) {
  return <div>{count > 0 ? <span className="badge">{count}</span> : null}</div>
}
```

---

## Rule 6.5 — Use `<Activity>` to preserve state when toggling visibility

Conditionally removing and re-adding an expensive component (modal, drawer, rich editor) destroys and recreates its state. `<Activity>` hides it visually while preserving the DOM and React state.

```tsx
import { Activity } from 'react'

function Workspace({ sidebarOpen }: { sidebarOpen: boolean }) {
  return (
    <div className="flex">
      <Activity mode={sidebarOpen ? 'visible' : 'hidden'}>
        <EditorSidebar />  {/* State preserved even when hidden */}
      </Activity>
      <main>
        <Editor />
      </main>
    </div>
  )
}
```

---

## Rule 6.6 — Animate wrapper divs instead of SVG elements

Many browsers don't GPU-accelerate CSS transforms on `<svg>` elements directly. Wrap the SVG and animate the wrapper:

```tsx
// ❌ animate-spin on svg — no hardware acceleration in some browsers
function Spinner() {
  return <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">...</svg>
}

// ✅ animate-spin on div wrapper — GPU accelerated
function Spinner() {
  return (
    <div className="animate-spin w-5 h-5">
      <svg viewBox="0 0 24 24">...</svg>
    </div>
  )
}
```

This applies to all `transform`, `opacity`, `translate`, `scale`, and `rotate` animations on SVG.

---

## Rule 6.7 — Hoist static JSX to module constants

JSX created inside a component body is re-created on every render even if it's identical. Hoist genuinely static elements to module scope.

```tsx
// ❌ New React element object on every render
function CommentBox({ loading }: { loading: boolean }) {
  return <div>{loading && <div className="animate-pulse h-4 bg-slate-200 rounded" />}</div>
}

// ✅ Same object reference reused across renders
const skeleton = <div className="animate-pulse h-4 bg-slate-200 rounded" />

function CommentBox({ loading }: { loading: boolean }) {
  return <div>{loading && skeleton}</div>
}
```

> React Compiler handles this automatically if enabled.
