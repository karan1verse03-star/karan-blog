# 4. Client-Side Data Fetching

> **Impact: MEDIUM-HIGH** — proper client-side patterns eliminate redundant network requests, prevent listener leaks, and keep storage safe across schema changes.

---

## Rule 4.1 — Use SWR for client-side fetching (deduplication + caching)

Multiple component instances that need the same remote data should share one in-flight request, not each fire their own.

```tsx
// ❌ Each mounted instance fires an independent fetch
function NotificationBadge() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    fetch('/api/notifications/count').then(r => r.json()).then(d => setCount(d.count))
  }, [])
  return <span>{count}</span>
}

// ✅ All instances share one request; auto-revalidates on focus
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function NotificationBadge() {
  const { data } = useSWR('/api/notifications/count', fetcher)
  return <span>{data?.count ?? 0}</span>
}
```

**For mutations:**

```tsx
import { useSWRMutation } from 'swr/mutation'

async function markAllRead(url: string) {
  return fetch(url, { method: 'POST' }).then(r => r.json())
}

function NotificationsPanel() {
  const { trigger, isMutating } = useSWRMutation(
    '/api/notifications/read-all',
    markAllRead
  )
  return (
    <button onClick={() => trigger()} disabled={isMutating}>
      Mark all read
    </button>
  )
}
```

---

## Rule 4.2 — Deduplicate global event listeners with `useSWRSubscription`

When multiple component instances attach the same `window` event listener, each instance registers its own handler. Use `useSWRSubscription` to ensure only one listener exists regardless of how many components subscribe.

```tsx
import useSWRSubscription from 'swr/subscription'

// Registry of callbacks per shortcut key — lives outside React
const registry = new Map<string, Set<() => void>>()

function useKeyboardShortcut(key: string, callback: () => void) {
  // Register this callback
  useEffect(() => {
    const set = registry.get(key) ?? new Set()
    registry.set(key, set)
    set.add(callback)
    return () => {
      set.delete(callback)
      if (set.size === 0) registry.delete(key)
    }
  }, [key, callback])

  // Single shared listener for all shortcut keys
  useSWRSubscription('keydown', () => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey) registry.get(e.key)?.forEach(cb => cb())
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
}
```

---

## Rule 4.3 — Add `{ passive: true }` to scroll and touch listeners

Without `{ passive: true }`, the browser waits for the handler to finish before scrolling (to check for `preventDefault()`). This adds 50–100 ms of scroll jank.

```ts
// ❌ Browser waits to see if you'll prevent default
document.addEventListener('wheel', onWheel)
document.addEventListener('touchstart', onTouch)

// ✅ Browser scrolls immediately
document.addEventListener('wheel', onWheel, { passive: true })
document.addEventListener('touchstart', onTouch, { passive: true })
```

Only omit `passive: true` when you explicitly call `preventDefault()` (custom drag/zoom gestures).

---

## Rule 4.4 — Version and minimize `localStorage` data

`localStorage` persists across deploys. Without versioning, stale data with old schemas causes silent bugs. Without minimization, you risk storing PII or tokens accidentally.

```ts
const STORAGE_VERSION = 'v2'

function saveUserPrefs(prefs: { theme: 'light' | 'dark'; density: 'compact' | 'default' }) {
  try {
    localStorage.setItem(`userPrefs:${STORAGE_VERSION}`, JSON.stringify(prefs))
  } catch {
    // Throws in Safari private mode, when quota is exceeded, or when storage is disabled
  }
}

function loadUserPrefs() {
  try {
    const raw = localStorage.getItem(`userPrefs:${STORAGE_VERSION}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Migrate from v1 when the app boots
function migrateStorage() {
  try {
    const v1 = localStorage.getItem('userPrefs:v1')
    if (!v1) return
    const old = JSON.parse(v1)
    saveUserPrefs({ theme: old.darkMode ? 'dark' : 'light', density: 'default' })
    localStorage.removeItem('userPrefs:v1')
  } catch {}
}
```

**Always `try/catch`** — `getItem` and `setItem` throw in Safari private mode, when quota is exceeded, and when storage is disabled by corporate policy.

**Store only what the UI needs** — never store full API responses, tokens, or internal flags:

```ts
// ❌ Stores 40-field user object
localStorage.setItem('user', JSON.stringify(fullUser))

// ✅ Stores 3 UI-relevant fields
localStorage.setItem('user:v1', JSON.stringify({
  id: fullUser.id,
  name: fullUser.name,
  avatarUrl: fullUser.avatarUrl,
}))
```
