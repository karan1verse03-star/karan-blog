# 5. Re-render Optimization

> **Impact: MEDIUM** — unnecessary re-renders waste CPU, cause UI jank, and make profiling harder. Fix only after eliminating waterfalls and bundle issues.

> **Note:** If the project uses [React Compiler](https://react.dev/learn/react-compiler), rules 5.4 and 5.5 are handled automatically. Check before adding manual memoization.

---

## Rule 5.1 — Derive values during render; don't store them in state

If a value can be computed from existing state or props, compute it inline. An extra `useState` + `useEffect` to sync it causes two renders per change and can drift out of sync.

```tsx
// ❌ Extra state + effect = double render per keystroke
function SearchBox() {
  const [query, setQuery] = useState('')
  const [trimmed, setTrimmed] = useState('')
  useEffect(() => { setTrimmed(query.trim()) }, [query])
  return <Results query={trimmed} />
}

// ✅ Derived — one render
function SearchBox() {
  const [query, setQuery] = useState('')
  const trimmed = query.trim()
  return <Results query={trimmed} />
}
```

---

## Rule 5.2 — Don't subscribe to state you only read inside callbacks

`useSearchParams()` and similar hooks cause a re-render every time the value changes. If you only read the value inside a click handler, read it imperatively at that point instead.

```tsx
// ❌ Re-renders on every URL change just to have the ref value available
function ShareButton({ postId }: { postId: string }) {
  const searchParams = useSearchParams()
  const handleShare = () => sharePost(postId, { ref: searchParams.get('ref') })
  return <button onClick={handleShare}>Share</button>
}

// ✅ Read at click time — zero subscription overhead
function ShareButton({ postId }: { postId: string }) {
  const handleShare = () => {
    const ref = new URLSearchParams(window.location.search).get('ref')
    sharePost(postId, { ref })
  }
  return <button onClick={handleShare}>Share</button>
}
```

---

## Rule 5.3 — Don't wrap simple primitive derivations in `useMemo`

`useMemo` has overhead: it stores the deps array, runs comparisons, and holds a reference in the hook list. For simple boolean/number/string expressions the overhead is greater than the computation:

```tsx
// ❌ useMemo overhead > cost of the boolean expression
const isLoading = useMemo(
  () => user.isLoading || posts.isLoading,
  [user.isLoading, posts.isLoading]
)

// ✅ Just compute it
const isLoading = user.isLoading || posts.isLoading
```

Use `useMemo` when: the computation is expensive (sorting large arrays, building search indexes), or the result is an object/array that is passed to a memoized child.

---

## Rule 5.4 — Extract stable default values for memoized components

A memoized component with a non-primitive default prop creates a new instance every render, breaking memoization.

```tsx
// ❌ () => {} creates a new function reference on every render → memo never hits
const PostCard = memo(function PostCard({
  onDelete = () => {},
}: { onDelete?: () => void }) {
  return <div onClick={onDelete}>Delete</div>
})

// ✅ Stable reference — memo works correctly
const NOOP = () => {}

const PostCard = memo(function PostCard({
  onDelete = NOOP,
}: { onDelete?: () => void }) {
  return <div onClick={onDelete}>Delete</div>
})
```

---

## Rule 5.5 — Extract expensive work into memoized child components

`useMemo` inside a parent runs even when an early return skips the render. Moving expensive computation into a `memo`-wrapped child skips it entirely when the parent bails out early.

```tsx
// ❌ computeAvatarId runs even during loading state
function ProfilePage({ user, isLoading }: Props) {
  const avatarUrl = useMemo(() => computeAvatarId(user), [user])
  if (isLoading) return <Skeleton />
  return <Avatar url={avatarUrl} />
}

// ✅ Computation skipped entirely when loading
const Avatar = memo(function Avatar({ user }: { user: User }) {
  const url = useMemo(() => computeAvatarId(user), [user])
  return <img src={url} />
})

function ProfilePage({ user, isLoading }: Props) {
  if (isLoading) return <Skeleton />
  return <Avatar user={user} />
}
```

---

## Rule 5.6 — Use functional setState to avoid stale closures

When updating state that depends on its current value, use the updater function form. This eliminates the state variable from the dependency array and prevents stale closure bugs.

```tsx
// ❌ addItem must be recreated every time items changes
const [items, setItems] = useState<CartItem[]>([])
const addItem = useCallback((item: CartItem) => {
  setItems([...items, item])
}, [items])  // recreated on every items change

// ✅ Stable reference; always operates on latest state
const addItem = useCallback((item: CartItem) => {
  setItems(curr => [...curr, item])
}, [])  // no dependency needed
```

---

## Rule 5.7 — Put event-driven side effects in event handlers, not effects

If a side effect happens because the user did something, run it directly in the event handler. Routing it through `state → effect` causes it to re-run whenever an unrelated dependency changes.

```tsx
// ❌ Re-fires whenever theme changes, not just on submit
function SignupForm() {
  const [submitted, setSubmitted] = useState(false)
  const theme = useContext(ThemeContext)
  useEffect(() => {
    if (submitted) {
      createAccount(formData)
      toast.success('Welcome!', { theme })
    }
  }, [submitted, theme])
  return <button onClick={() => setSubmitted(true)}>Sign up</button>
}

// ✅ Runs exactly once, when the user clicks
function SignupForm() {
  const theme = useContext(ThemeContext)
  function handleSubmit() {
    createAccount(formData)
    toast.success('Welcome!', { theme })
  }
  return <button onClick={handleSubmit}>Sign up</button>
}
```

---

## Rule 5.8 — Use `startTransition` for non-urgent state updates

Wrap state updates that don't need to be synchronous (search results, filter changes, tab content) in `startTransition`. This keeps input and animations responsive while heavier updates yield to urgent renders.

```tsx
// ❌ Every filter change blocks the thread
function FilterPanel({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState('')
  const filtered = items.filter(i => i.tag === filter) // hundreds of items

  return (
    <>
      <input onChange={e => setFilter(e.target.value)} />
      <ItemList items={filtered} />
    </>
  )
}

// ✅ Input stays responsive; list update is interruptible
import { useTransition, useState } from 'react'

function FilterPanel({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState('')
  const [displayFilter, setDisplayFilter] = useState('')
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <input
        onChange={e => {
          setFilter(e.target.value) // urgent — updates immediately
          startTransition(() => setDisplayFilter(e.target.value))
        }}
      />
      {isPending && <Spinner />}
      <ItemList items={items} filter={displayFilter} />
    </>
  )
}
```

---

## Rule 5.9 — Lazy-initialize expensive `useState` values

The argument to `useState(value)` runs on every render even though it's only used once. Pass a function to run the computation only on mount.

```tsx
// ❌ JSON.parse runs on every render
const [prefs, setPrefs] = useState(
  JSON.parse(localStorage.getItem('prefs') || '{}')
)

// ✅ Runs only on initial render
const [prefs, setPrefs] = useState(() => {
  const stored = localStorage.getItem('prefs')
  return stored ? JSON.parse(stored) : {}
})
```

Use lazy init for: `localStorage`/`sessionStorage` reads, building expensive data structures (search indexes, `Map` from array), heavy transformations of props passed at mount.

---

## Rule 5.10 — Subscribe to derived boolean state, not raw continuous values

Subscribing to a value that changes on every event (window width, scroll position) causes a re-render per event. Subscribe to the derived boolean that actually drives the UI change.

```tsx
// ❌ Re-renders on every scroll pixel
function Sidebar() {
  const scrollY = useScrollY()
  const isPinned = scrollY > 80
  return <nav className={isPinned ? 'pinned' : ''} />
}

// ✅ Re-renders only when pinned state crosses the threshold
function Sidebar() {
  const isPinned = useMediaQuery('(scroll-position > 80px)')
  // Or implement a custom hook that returns boolean only
  return <nav className={isPinned ? 'pinned' : ''} />
}
```

---

## Rule 5.11 — Use `useRef` for values that don't need to trigger a render

Frequent read/write values that only drive direct DOM mutations should live in a ref, not state.

```tsx
// ❌ Every mousemove causes a re-render
function Cursor() {
  const [x, setX] = useState(0)
  useEffect(() => {
    window.addEventListener('mousemove', e => setX(e.clientX))
  }, [])
  return <div style={{ transform: `translateX(${x}px)` }} />
}

// ✅ Direct DOM mutation — zero re-renders
function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      dotRef.current?.style.setProperty('transform', `translateX(${e.clientX}px)`)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])
  return <div ref={dotRef} className="w-2 h-2 bg-indigo-500 fixed top-0" />
}
```

---

## Rule 5.12 — Narrow `useEffect` dependencies to primitives

Object references change every render. Extract the primitive field you actually use as the dependency.

```tsx
// ❌ Effect re-runs whenever any user field changes
useEffect(() => {
  analytics.identify(user.id)
}, [user])

// ✅ Only re-runs when the ID changes
useEffect(() => {
  analytics.identify(user.id)
}, [user.id])
```

For computed booleans, derive them before the effect:

```tsx
// ❌ Runs on every width pixel change
const isMobile = width < 768
useEffect(() => {
  if (isMobile) collapseNav()
}, [width])

// ✅ Runs only on boolean transition
const isMobile = width < 768
useEffect(() => {
  if (isMobile) collapseNav()
}, [isMobile])
```
