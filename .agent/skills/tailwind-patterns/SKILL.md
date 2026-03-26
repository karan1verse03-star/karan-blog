---
name: tailwind-patterns
description: Tailwind CSS v4 patterns for Next.js projects — CSS-first configuration, container queries, OKLCH colors, component patterns, and responsive strategy.
---

# Tailwind Patterns (v4)

> **When does this activate?**
> Use this when writing or reviewing any Tailwind CSS in a Next.js project. Tailwind v4 is the default — CSS-first configuration, no `tailwind.config.ts` unless extending defaults.

---

## v4 Architecture — What Changed

| v3                                          | v4                              |
| ------------------------------------------- | ------------------------------- |
| `tailwind.config.js` / `tailwind.config.ts` | CSS `@theme` directive          |
| PostCSS plugin                              | Oxide engine (Rust, 10x faster) |
| JIT as opt-in                               | Always on                       |
| `@apply` encouraged                         | Discouraged — prefer components |
| No container queries                        | Native `@container` support     |

**The config file is now optional.** All design tokens live in CSS.

---

## CSS-First Configuration

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Brand colors — use OKLCH for perceptual uniformity */
  --color-brand-50: oklch(0.97 0.02 250);
  --color-brand-500: oklch(0.55 0.18 250);
  --color-brand-900: oklch(0.25 0.12 250);

  /* Semantic surface colors */
  --color-surface: oklch(0.99 0 0);
  --color-surface-raised: oklch(0.97 0 0);

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Custom spacing additions */
  --spacing-18: 4.5rem;
}
```

All `@theme` tokens are automatically available as Tailwind utilities and CSS variables (`var(--color-brand-500)`).

---

## Component Patterns

### `cn()` for Conditional Classes

Always use `cn` (clsx + tailwind-merge) — never string concatenation:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
<button
  className={cn(
    "rounded-lg px-4 py-2 font-medium transition-colors",
    variant === "primary" && "bg-brand-500 text-white hover:bg-brand-600",
    variant === "ghost" && "bg-transparent text-brand-500 hover:bg-brand-50",
    disabled && "cursor-not-allowed opacity-50",
  )}
/>
```

### CVA for Multi-Variant Components

```ts
import { cva, type VariantProps } from "class-variance-authority";

const button = cva("rounded-lg font-medium transition-colors", {
  variants: {
    variant: {
      primary: "bg-brand-500 text-white hover:bg-brand-600",
      ghost: "bg-transparent text-brand-500 hover:bg-brand-50",
      destructive: "bg-red-500 text-white hover:bg-red-600",
    },
    size: {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export type ButtonProps = VariantProps<typeof button>;
```

---

## Container Queries (v4 Native)

Use container queries for component-level responsiveness — not viewport breakpoints:

```tsx
{
  /* Parent defines the container */
}
<div className="@container">
  <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-4">
    {items.map((item) => (
      <Card key={item.id} {...item} />
    ))}
  </div>
</div>;
```

| Use                                 | When                                             |
| ----------------------------------- | ------------------------------------------------ |
| Viewport breakpoints (`md:`, `lg:`) | Page-level layout                                |
| Container queries (`@sm:`, `@md:`)  | Reusable components that respond to their parent |

---

## Responsive Strategy

- **Mobile-first always** — base styles are mobile, modifiers scale up
- **Standard breakpoints only** — `sm`, `md`, `lg`, `xl`, `2xl` — don't invent custom ones
- **Fewer breakpoints** — if you need 5+ modifiers on one element, extract a component

```tsx
// ❌ Too many breakpoints — hard to read
<div className="p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8" />

// ✅ Intentional — two meaningful steps
<div className="p-4 md:p-8" />
```

---

## Dark Mode

Use `class` strategy (not `media`) paired with `next-themes`:

```css
/* In @theme — define both light and dark tokens */
@theme {
  --color-bg: oklch(0.99 0 0);
  --color-text: oklch(0.15 0 0);
}

.dark {
  --color-bg: oklch(0.12 0 0);
  --color-text: oklch(0.95 0 0);
}
```

Every foreground/background token pair should have a `.dark` override. Never add dark mode as an afterthought.

---

## OKLCH Colors

Prefer OKLCH over hex/HSL for design tokens — it's perceptually uniform, meaning equal numeric steps look visually equal:

```css
/* ✅ OKLCH — perceptually linear scale */
--color-blue-400: oklch(0.65 0.15 250);
--color-blue-500: oklch(0.55 0.18 250);
--color-blue-600: oklch(0.45 0.18 250);

/* Still fine for one-off utility usage */
.element {
  color: #3b82f6;
}
```

---

## Layout Patterns

```tsx
{/* Standard page container */}
<main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

{/* Centered hero */}
<section className="flex flex-col items-center justify-center min-h-[60vh] text-center">

{/* Sidebar layout */}
<div className="grid grid-cols-[240px_1fr] gap-8">

{/* Bento grid — prefer asymmetric over uniform */}
<div className="grid grid-cols-3 grid-rows-2 gap-4">
  <div className="col-span-2 row-span-2">...</div>
  <div>...</div>
  <div>...</div>
</div>
```

---

## Spacing — 8-Point Grid

Use multiples of 2 (4px increments). Avoid `p-3`, `p-5`, `p-7` unless intentional:

| Token           | px   | Use                      |
| --------------- | ---- | ------------------------ |
| `p-1` / `gap-1` | 4px  | Tight inline             |
| `p-2` / `gap-2` | 8px  | Small gaps               |
| `p-4` / `gap-4` | 16px | Component padding        |
| `p-6` / `gap-6` | 24px | Between related elements |
| `p-8` / `gap-8` | 32px | Section spacing          |

---

## Anti-Patterns

| ❌ Avoid                                 | ✅ Instead                           |
| ---------------------------------------- | ------------------------------------ |
| `tailwind.config.ts` for new v4 projects | `@theme` in `globals.css`            |
| `style={{ color: '#3b82f6' }}`           | OKLCH token or Tailwind utility      |
| String concatenation for class names     | `cn()` helper                        |
| `text-[14px]` for standard sizes         | `text-sm` or `text-base`             |
| `@apply` in CSS                          | Extract a React component            |
| Mixing v3 config with v4                 | Migrate fully to CSS-first           |
| `!important`                             | Fix specificity with proper ordering |
| Dynamic class strings in templates       | Safelist or full class names only    |
