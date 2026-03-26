---
name: web-design-guidelines
description: Post-implementation audit for accessibility, focus states, animation, performance, and visual quality. Run AFTER the frontend-specialist builds a component or page. Not for design decisions — use frontend-design skill for that.
---

# Web Design Guidelines

> **When does this activate?**
> Use this after building any component or page — to audit spacing, accessibility, animation, and visual quality before marking the task complete.

---

## Spacing — The 8-Point Grid

All spacing should be multiples of 4 or 8. This creates visual rhythm and consistency.

| Token      | Value | Use                             |
| ---------- | ----- | ------------------------------- |
| `space-1`  | 4px   | Icon gaps, tight inline spacing |
| `space-2`  | 8px   | Element padding, small gaps     |
| `space-4`  | 16px  | Component internal padding      |
| `space-6`  | 24px  | Between related elements        |
| `space-8`  | 32px  | Between sections                |
| `space-16` | 64px  | Major section breaks            |

**Rule:** If two elements feel "too close" or "too far apart", the answer is almost always moving one step up or down the scale — not a custom value.

---

## Visual Hierarchy

Every page should have exactly **one primary focal point** — the thing the user's eye goes to first. Everything else supports it.

- **Size** — larger = more important
- **Weight** — bold = more important
- **Color** — high contrast = more important
- **Position** — top-left draws the eye first in LTR layouts
- **Whitespace** — isolated elements feel more important

```
❌ Three things competing for attention equally
→ Three headings the same size, same weight, same color

✅ Clear hierarchy
→ One large heading (H1), supporting subheading (H2 at 60% size), body text
```

---

## Typography

- **Scale** — use a modular scale. A simple ratio: `text-sm` (14px) → `text-base` (16px) → `text-lg` (18px) → `text-xl` (20px) → `text-2xl` (24px) → `text-4xl` (36px)
- **Line height** — body text: 1.5–1.75. Headings: 1.1–1.3
- **Line length** — 60–75 characters per line for body text. Use `max-w-prose` (65ch) in Tailwind
- **Font pairing** — max 2 fonts: one for headings, one for body. High contrast between them (e.g., serif heading + sans body)
- **Never use font size below 14px** for any readable text

---

## Layout Principles

- **Alignment** — every element should align to something. Random alignment creates visual noise
- **Proximity** — related elements should be closer to each other than to unrelated elements
- **Consistency** — the same type of element should look the same everywhere in the UI
- **Breathing room** — when in doubt, add more whitespace. Most UIs are too dense, not too sparse

### Container Pattern

```tsx
// Standard page container — always use this for page-level content
<main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
```

---

## Color

- **60-30-10 rule** — 60% neutral (background), 30% secondary (surfaces, cards), 10% accent (CTAs, highlights)
- **Contrast** — body text must meet WCAG AA: 4.5:1 for normal text, 3:1 for large text
- **Semantic color** — use color to communicate meaning: green = success, red = error, yellow = warning, blue = info. Never use these colors decoratively
- **Dark mode** — pair every foreground color with a dark mode equivalent. Don't add dark mode as an afterthought

---

## Component Sizing

- **Touch targets** — minimum 44×44px for any clickable element (mobile)
- **Button padding** — minimum `px-4 py-2` for readable, tappable buttons
- **Input height** — 40–44px for comfortable form inputs
- **Icon size** — 16px inline with text, 20–24px standalone, 32px+ as feature icons

---

## Accessibility Audit

Run through this after building any interactive component:

- [ ] Every `<img>` has a meaningful `alt` attribute (or `alt=""` if decorative)
- [ ] Every form `<input>` has an associated `<label>` (not just placeholder)
- [ ] Every interactive element is reachable via `Tab` key
- [ ] Focus ring is visible — never `outline: none` without a custom replacement
- [ ] Color is never the only way to convey information (error = color + icon + text)
- [ ] Buttons use `<button>`, links use `<a href>` — never `<div onClick>`
- [ ] Modal/dialog traps focus and returns it on close
- [ ] Icon-only buttons have `aria-label`: `<button aria-label="Close menu">`

### Focus Ring (Never Remove)

```css
/* ❌ Never do this */
*:focus {
  outline: none;
}

/* ✅ Replace with custom, not remove */
*:focus-visible {
  outline: 2px solid var(--color-brand-500);
  outline-offset: 2px;
}
```

```tsx
{
  /* Tailwind equivalent */
}
className =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";
```

---

## Animation Audit

After adding any animation:

- [ ] `prefers-reduced-motion` is handled — decorative animations disabled
- [ ] No animation on `width`, `height`, `top`, `left` — use `transform` instead
- [ ] No UI feedback animation lasts longer than 500ms
- [ ] Loading state exists for any async action over 300ms
- [ ] `AnimatePresence` wraps any conditionally rendered animated element (Framer Motion)

```css
/* Required in globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Common Mistakes to Avoid

| Mistake                                  | Fix                                                     |
| ---------------------------------------- | ------------------------------------------------------- |
| Too many font sizes (6+)                 | Stick to a 5-step scale                                 |
| Borders everywhere                       | Use whitespace and background color differences instead |
| Centered body text in long paragraphs    | Left-align body text always                             |
| Low contrast text on colored backgrounds | Check with a contrast checker                           |
| Inconsistent border radius               | Pick one: sharp (0–2px) or rounded (8–16px) — don't mix |
| Icon and text not vertically aligned     | Use `flex items-center gap-2`                           |
| Custom spacing values (`mt-[13px]`)      | Move to nearest 8pt grid step                           |
| `outline: none` on focus                 | Replace with custom focus ring, never remove            |

---

## Pre-Delivery Checklist

Before marking any UI task complete:

- [ ] Spacing follows 8pt grid — no arbitrary pixel values
- [ ] One clear visual focal point per section
- [ ] Body text uses `max-w-prose`, left-aligned
- [ ] All interactive elements are 44×44px minimum touch target
- [ ] Contrast passes WCAG AA (4.5:1 body, 3:1 large text)
- [ ] Focus rings visible on all interactive elements
- [ ] `prefers-reduced-motion` handled in CSS
- [ ] Mobile layout tested (375px minimum width)
- [ ] Dark mode works if the project uses it
- [ ] No hardcoded colors outside design tokens
- [ ] No `console.log` left in code

---

> **Remember:** This skill audits implementation quality. For design decisions (color, typography, layout choices), use the `frontend-design` skill instead.
