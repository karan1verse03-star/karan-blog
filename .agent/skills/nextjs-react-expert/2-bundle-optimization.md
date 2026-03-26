# 2. Bundle Size Optimization

> **Impact: CRITICAL** — barrel imports alone add 200–800 ms to every cold start. Large bundles hurt TTI and LCP on every page load.

---

## Rule 2.1 — Never import from barrel files of large libraries

Barrel files re-export hundreds or thousands of modules. Even if you import one symbol, the bundler may resolve the entire file.

```tsx
// ❌ Loads 1,583 modules — 2.8 s extra dev boot, 200–800 ms cold start
import { Check, X, Menu } from 'lucide-react'

// ❌ Loads 2,225 modules
import { Button, TextField } from '@mui/material'
```

**Fix 1: Use `optimizePackageImports` in next.config.ts (Next.js 13.5+)**

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@mui/material',
      '@mui/icons-material',
      '@radix-ui/react-icons',
      'date-fns',
    ],
  },
}
export default nextConfig
```

With this, ergonomic barrel imports are automatically transformed to direct imports at build time — 15–70% faster dev boot, 28% faster builds.

**Fix 2: Direct imports when `optimizePackageImports` isn't available**

```tsx
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
import Button from '@mui/material/Button'
```

Libraries commonly affected: `lucide-react`, `@mui/material`, `@mui/icons-material`, `@tabler/icons-react`, `react-icons`, `@radix-ui/react-*`, `lodash`, `date-fns`, `rxjs`.

---

## Rule 2.2 — Lazy-load heavy components with `next/dynamic`

Components not needed on the first paint should be code-split.

```tsx
// ❌ Monaco (~300 KB) bundles in the main chunk
import { MonacoEditor } from './monaco-editor'

// ✅ Loads on demand
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false }
)
```

Use `ssr: false` for components that reference `window`, `document`, or browser-only APIs.

---

## Rule 2.3 — Preload heavy bundles on user intent

Start downloading a chunk before the user actually triggers it.

```tsx
function NewPostButton() {
  const preloadEditor = () => {
    void import('./rich-text-editor')
  }

  return (
    <button
      onMouseEnter={preloadEditor}
      onFocus={preloadEditor}
      onClick={openEditor}
    >
      New Post
    </button>
  )
}
```

Also preload based on feature flags:

```tsx
useEffect(() => {
  if (flags.richEditorEnabled) {
    void import('./rich-text-editor').then(m => m.init())
  }
}, [flags.richEditorEnabled])
```

---

## Rule 2.4 — Load non-critical third-party scripts after hydration

Analytics, error tracking, and chat widgets don't block interaction. Defer them.

```tsx
// ❌ Included in initial bundle
import { Analytics } from '@vercel/analytics/react'

// ✅ Loads after hydration
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(m => m.Analytics),
  { ssr: false }
)
```

---

## Rule 2.5 — Conditionally load modules only when a feature activates

Don't import large data files or feature modules at the top of the module — import them when the user turns the feature on.

```tsx
function ChartPanel({ enabled }: { enabled: boolean }) {
  const [ChartLib, setChartLib] = useState<typeof import('./chart-lib') | null>(null)

  useEffect(() => {
    if (enabled && !ChartLib) {
      import('./chart-lib').then(setChartLib)
    }
  }, [enabled])

  if (!ChartLib) return <Skeleton />
  return <ChartLib.Chart />
}
```
