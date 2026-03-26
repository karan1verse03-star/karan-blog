# Animation Guide

> Animation principles and implementation with Framer Motion for React/Next.js.
> **Principles first. Code second. Never animate without purpose.**

---

## 1. Duration Principles

| Purpose              | Duration  | Why                        |
| -------------------- | --------- | -------------------------- |
| Instant feedback     | 50–100ms  | Below perception threshold |
| Micro-interactions   | 100–200ms | Quick but noticeable       |
| Standard transitions | 200–300ms | Comfortable                |
| Complex animations   | 300–500ms | Time to follow             |
| Page transitions     | 300–500ms | Smooth handoff             |
| Premium / spring     | 400–700ms | Organic, weighted          |

**What affects timing:**

- Distance: further travel = longer
- Size: larger elements = slower
- Importance: critical feedback = clear
- Context: urgent = fast, luxury = slow

---

## 2. Easing Principles

| Easing          | Best For              | Framer Motion       |
| --------------- | --------------------- | ------------------- |
| **Ease-out**    | Entering elements     | `ease: "easeOut"`   |
| **Ease-in**     | Exiting elements      | `ease: "easeIn"`    |
| **Ease-in-out** | Emphasis, loops       | `ease: "easeInOut"` |
| **Spring**      | Natural feel, premium | `type: "spring"`    |
| **Linear**      | Loading, continuous   | `ease: "linear"`    |

---

## 3. Framer Motion — Core Patterns

### Setup

```bash
npm install framer-motion
```

### Fade In on Mount

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  {children}
</motion.div>;
```

### Scroll Reveal (Viewport-triggered)

```tsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
  {children}
</motion.div>
```

### Staggered List

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map((i) => (
    <motion.li key={i.id} variants={item}>
      {i.label}
    </motion.li>
  ))}
</motion.ul>
```

### Spring Button Press

```tsx
<motion.button
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 20 }}
>
  Get Started
</motion.button>
```

### Card Hover Lift

```tsx
<motion.div
  className="rounded-xl border bg-surface p-6 shadow-sm"
  whileHover={{
    y: -4,
    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)",
  }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
  {children}
</motion.div>
```

### Page Transition (Next.js App Router)

```tsx
// components/page-transition.tsx
"use client";
import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
```

### AnimatePresence (Conditional Elements)

```tsx
import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence>
  {isOpen && (
    <motion.div
      key="modal"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Modal />
    </motion.div>
  )}
</AnimatePresence>;
```

### Layout Animations (Automatic)

```tsx
// Elements reorder, resize, move — all animated automatically
<motion.div layout>
  {items.map((item) => (
    <motion.div key={item.id} layout>
      {item.label}
    </motion.div>
  ))}
</motion.div>
```

---

## 4. Micro-Interaction Patterns

### Button States

```tsx
// Full button with all states
<motion.button
  className={cn(
    "relative rounded-lg px-5 py-2.5 font-medium transition-colors",
    "bg-brand-500 text-white",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
  )}
  whileHover={{ scale: 1.02, brightness: 1.05 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 20 }}
  disabled={isLoading}
>
  {isLoading ? <Spinner /> : label}
</motion.button>
```

### Shake on Error

```tsx
const shakeVariants = {
  shake: {
    x: [0, -8, 8, -6, 6, -4, 4, 0],
    transition: { duration: 0.4 },
  },
}

<motion.div
  variants={shakeVariants}
  animate={hasError ? 'shake' : ''}
>
  <Input />
</motion.div>
```

---

## 5. Loading States

| Duration | Approach                 |
| -------- | ------------------------ |
| < 1s     | No indicator needed      |
| 1–3s     | Spinner or skeleton      |
| 3s+      | Progress bar or skeleton |
| Unknown  | Indeterminate + skeleton |

### Skeleton Shimmer (Tailwind)

```tsx
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700",
        className,
      )}
    />
  );
}

// Usage
<div className="space-y-3">
  <Skeleton className="h-5 w-3/4" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-5/6" />
</div>;
```

---

## 6. Scroll Animations

### Framer Motion — whileInView

```tsx
// Reusable reveal component
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
```

### Direction Matching

```
Forward navigation  → slide from right (translateX: 100% → 0)
Backward navigation → slide from left  (translateX: -100% → 0)
Modal open          → scale up (scale: 0.95 → 1)
Deeper level        → slide up (translateY: 20px → 0)
```

---

## 7. Performance Rules

**Always animate:**

- `transform` (translate, scale, rotate) ✅
- `opacity` ✅

**Never animate (triggers layout reflow):**

- `width`, `height` ❌
- `top`, `left`, `right`, `bottom` ❌
- `margin`, `padding` ❌

**Reduced motion — always implement:**

```tsx
import { useReducedMotion } from "framer-motion";

function AnimatedComponent() {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.4 }}
    >
      {children}
    </motion.div>
  );
}
```

---

## 8. Animation Decision Checklist

Before adding any animation:

- [ ] Does it have a purpose? (feedback / guidance / delight)
- [ ] Is the timing appropriate? (not too fast or slow)
- [ ] Did I choose the correct easing?
- [ ] Is it GPU-accelerated? (transform/opacity only)
- [ ] Did I handle `prefers-reduced-motion`?
- [ ] Is it consistent with other animations on the page?
- [ ] Did I kill the animation on unmount? (memory leak prevention)

### Anti-Patterns

- ❌ Same `duration: 0.3` on every single animation
- ❌ Animation for animation's sake
- ❌ Ignoring `prefers-reduced-motion`
- ❌ Animating width/height (use scaleX/Y instead)
- ❌ Too many things moving simultaneously
- ❌ Long delays that make the page feel broken

> **Remember**: Animation is communication. Every motion should have meaning and serve the user experience.
