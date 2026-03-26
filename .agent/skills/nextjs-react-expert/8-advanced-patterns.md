# 8. Advanced Patterns

> **Impact: VARIABLE** — these patterns solve specific correctness problems that arise in production React apps. Use them only when you encounter the exact scenario described.

---

## Rule 8.1 — Guard app-wide initialization against double execution

`useEffect` with an empty deps array runs twice in React 18 development mode (Strict Mode mounts → unmounts → remounts). It also re-runs if the component unmounts and remounts in production (route navigations, tab switching). App-wide initialization (analytics boot, auth token check, SDK setup) must run exactly once per session.

```tsx
// ❌ Runs twice in dev (Strict Mode), re-runs on remount in prod
function AppRoot() {
  useEffect(() => {
    initAnalytics()
    checkAuthSession()
  }, [])
  return <App />
}

// ✅ Module-level guard — runs exactly once per page load
let initialized = false

function AppRoot() {
  useEffect(() => {
    if (initialized) return
    initialized = true
    initAnalytics()
    checkAuthSession()
  }, [])
  return <App />
}
```

For Next.js App Router, place true once-per-app initialization in an `instrumentation.ts` file (Node.js runtime) or at the top level of a Server Component that isn't inside a page.

---

## Rule 8.2 — Store event handler callbacks in refs for stable subscriptions

When an effect sets up a subscription (WebSocket, window event, interval) that shouldn't re-subscribe when the callback changes, store the latest callback in a ref and call it through a stable wrapper.

```tsx
// ❌ Re-subscribes to WebSocket every time onMessage reference changes
function useWebSocket(url: string, onMessage: (data: unknown) => void) {
  useEffect(() => {
    const ws = new WebSocket(url)
    ws.onmessage = e => onMessage(JSON.parse(e.data))
    return () => ws.close()
  }, [url, onMessage]) // onMessage is a new function on every render
}

// ✅ Stable subscription; always calls the latest callback
function useWebSocket(url: string, onMessage: (data: unknown) => void) {
  const onMessageRef = useRef(onMessage)
  useEffect(() => { onMessageRef.current = onMessage }, [onMessage])

  useEffect(() => {
    const ws = new WebSocket(url)
    ws.onmessage = e => onMessageRef.current(JSON.parse(e.data))
    return () => ws.close()
  }, [url]) // subscription stable — url is the only real dependency
}
```

**With React 19 `useEffectEvent` (preferred when available):**

```tsx
import { useEffectEvent } from 'react'

function useWebSocket(url: string, onMessage: (data: unknown) => void) {
  const handleMessage = useEffectEvent(onMessage) // always latest, not a dep

  useEffect(() => {
    const ws = new WebSocket(url)
    ws.onmessage = e => handleMessage(JSON.parse(e.data))
    return () => ws.close()
  }, [url])
}
```

---

## Rule 8.3 — Use `useEffectEvent` to read latest state without re-running the effect

When an effect needs a value from state or props, but shouldn't re-run when that value changes, wrap the reading in `useEffectEvent`.

```tsx
// ❌ Debounce re-subscribes whenever onSearch reference changes
function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(query), 300)
    return () => clearTimeout(timeout)
  }, [query, onSearch]) // onSearch changes every render if passed inline
}

// ✅ onSearch always current; effect only re-runs on query change
import { useEffectEvent } from 'react'

function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  const handleSearch = useEffectEvent(onSearch)

  useEffect(() => {
    const timeout = setTimeout(() => handleSearch(query), 300)
    return () => clearTimeout(timeout)
  }, [query]) // stable dep array
}
```

`useEffectEvent` is the idiomatic solution for: debounced search, analytics calls inside effects, and any callback from a parent component used in an effect.
