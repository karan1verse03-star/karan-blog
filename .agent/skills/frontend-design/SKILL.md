---
name: frontend-design
description: Design thinking and decision-making for web UI. Use when designing components, layouts, color schemes, typography, or creating aesthetic interfaces. Teaches principles, not fixed values.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Frontend Design System

> **Philosophy:** Every pixel has purpose. Restraint is luxury. User psychology drives decisions.
> **Core Principle:** THINK, don't memorize. ASK, don't assume.

---

## 🎯 Selective Reading Rule (MANDATORY)

**Read REQUIRED files always, OPTIONAL only when needed:**

| File                                         | Status          | When to Read                      |
| -------------------------------------------- | --------------- | --------------------------------- |
| [ux-psychology.md](ux-psychology.md)         | 🔴 **REQUIRED** | Always read first                 |
| [color-system.md](color-system.md)           | ⚪ Optional     | Color/palette decisions           |
| [typography-system.md](typography-system.md) | ⚪ Optional     | Font selection/pairing            |
| [visual-effects.md](visual-effects.md)       | ⚪ Optional     | Glassmorphism, shadows, gradients |
| [animation-guide.md](animation-guide.md)     | ⚪ Optional     | Framer Motion, micro-interactions |
| [motion-graphics.md](motion-graphics.md)     | ⚪ Optional     | GSAP, Lottie, SVG, 3D, Particles  |
| [decision-trees.md](decision-trees.md)       | ⚪ Optional     | Context-specific templates        |

> 🔴 **ux-psychology.md = ALWAYS READ. Others = only if relevant.**

---

## ⛔ CRITICAL: ASK BEFORE ASSUMING (MANDATORY)

> **STOP. If the user's request is open-ended, DO NOT default to your favorites.**

**Color not specified?** Ask:

> "What color palette do you prefer? (blue/green/orange/neutral/other?)"

**Style not specified?** Ask:

> "What style are you going for? (minimal/bold/retro/futuristic/organic?)"

**Layout not specified?** Ask:

> "Do you have a layout preference? (single column/grid/asymmetric/full-width?)"

### ⛔ Default Tendencies to Actively Avoid

| AI Default                   | Why It's Bad                | Think Instead                           |
| ---------------------------- | --------------------------- | --------------------------------------- |
| **Bento Grids**              | Used in every AI design     | Why does this content NEED a grid?      |
| **Hero Split (Left/Right)**  | Predictable, boring         | Massive typography? Vertical narrative? |
| **Mesh/Aurora Gradients**    | The "new" lazy background   | What's a radical color pairing?         |
| **Glassmorphism**            | AI's idea of "premium"      | Solid, high-contrast flat?              |
| **Deep Cyan / Fintech Blue** | Safe harbor from purple ban | Why not red, black, or neon green?      |
| **Dark bg + neon glow**      | Overused "AI look"          | What does the BRAND actually need?      |
| **Rounded everything**       | Generic, safe               | Where can I use sharp, brutalist edges? |
| **Purple / Violet**          | 🚫 BANNED — AI overuses it  | Deep teal, maroon, emerald instead      |

> 🔴 **"Every 'safe' structure you choose brings you one step closer to a generic template. TAKE RISKS."**

---

## 1. Constraint Analysis (Always First)

Before any design work, answer these or ask the user:

| Constraint   | Question               | Why                         |
| ------------ | ---------------------- | --------------------------- |
| **Timeline** | How much time?         | Determines complexity       |
| **Content**  | Ready or placeholder?  | Affects layout              |
| **Brand**    | Existing guidelines?   | May dictate colors/fonts    |
| **Tech**     | Next.js + Tailwind v4? | Affects implementation      |
| **Audience** | Who exactly?           | Drives all visual decisions |

### Audience → Design Approach

| Audience        | Think About                                     |
| --------------- | ----------------------------------------------- |
| **Gen Z**       | Bold, fast, mobile-first, authentic, unexpected |
| **Millennials** | Clean, minimal, value-driven, earthy            |
| **Gen X**       | Familiar, trustworthy, clear, no-nonsense       |
| **Boomers**     | Readable, high contrast, simple, linear         |
| **B2B**         | Professional, data-focused, trust, ROI          |
| **Luxury**      | Restrained elegance, whitespace, understated    |

---

## 2. UX Psychology Principles

### Core Laws (Always Apply)

| Law                   | Principle                         | Application                               |
| --------------------- | --------------------------------- | ----------------------------------------- |
| **Hick's Law**        | More choices = slower decisions   | Max 5–7 nav items, progressive disclosure |
| **Fitts' Law**        | Bigger + closer = easier to click | CTAs min 44px height, 48px on mobile      |
| **Miller's Law**      | ~7 items in working memory        | Chunk content into groups                 |
| **Von Restorff**      | Different = memorable             | Make primary CTA visually distinct        |
| **Serial Position**   | First/last remembered most        | Key info at start and end                 |
| **Jakob's Law**       | Users expect familiar patterns    | Logo top-left = home, search top-right    |
| **Doherty Threshold** | Response < 400ms feels instant    | Skeleton screens, optimistic UI           |

### Emotional Design Levels

```
VISCERAL (instant)   → First impression: colors, imagery, overall feel
BEHAVIORAL (use)     → Using it: speed, feedback, efficiency
REFLECTIVE (memory)  → After: "This brand represents who I am"
```

> See [ux-psychology.md](ux-psychology.md) for the full deep-dive on all 20+ laws.

---

## 3. Layout Principles

### Golden Ratio (φ = 1.618)

```
Proportional harmony:
├── Content : Sidebar = 62% : 38%
├── Heading scale: each = previous × 1.618
└── Spacing: sm → md → lg (each × 1.618)
```

### 8-Point Grid

All spacing in multiples of 4px (8px base):
`4 → 8 → 16 → 24 → 32 → 48 → 64 → 80 → 96`

```tsx
// Standard page container
<main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

// Section spacing
<section className="py-16 md:py-24">

// Card padding
<div className="p-6 md:p-8">
```

### Reading Width

Body text: `max-w-prose` (65ch). Never let body text span full viewport width.

---

## 4. Color Principles

**60-30-10 Rule:**

- 60% → Background/base (calm, neutral)
- 30% → Secondary surfaces (cards, sections)
- 10% → Accent (CTAs, highlights only)

### Quick Selection Guide

| Need             | Hue Family               | Never Default To |
| ---------------- | ------------------------ | ---------------- |
| Trust, calm      | Blue family              | Purple/violet    |
| Growth, nature   | Green family             | Generic teal     |
| Energy, urgency  | Orange, red              | Saturated neon   |
| Luxury, creative | Deep teal, gold, emerald | Safe cyan        |
| Minimal, clean   | Neutrals + one accent    | Dark + neon      |

### v4 Implementation

```css
@theme {
  --color-brand-500: oklch(0.55 0.18 250); /* NOT hsl() */
  --color-surface: oklch(0.99 0 0);
  --color-accent: oklch(0.6 0.2 30); /* Warm amber, not cyan */
}
```

> Full color theory → [color-system.md](color-system.md)

---

## 5. Typography Principles

### Scale Ratios by Context

| Content              | Ratio     | Feel               |
| -------------------- | --------- | ------------------ |
| Dense UI / Dashboard | 1.125–1.2 | Compact, efficient |
| General web          | 1.25      | Balanced           |
| Editorial / Blog     | 1.333     | Spacious, readable |
| Hero / Marketing     | 1.5–1.618 | Dramatic impact    |

### Readability Rules

- **Line length:** 45–75ch for body text (`max-w-prose`)
- **Line height:** 1.4–1.6 for body, 1.1–1.3 for headings
- **Body size:** 16px minimum, 18px preferred for editorial
- **Tracking:** Negative on large display text, normal on body

```css
/* Fluid typography — scales smoothly between viewport sizes */
font-size: clamp(1rem, 0.875rem + 0.5vw, 1.125rem); /* body */
font-size: clamp(2rem, 1.5rem + 2vw, 3.5rem); /* hero h1 */
```

> Full pairing + scale guide → [typography-system.md](typography-system.md)

---

## 6. Animation Principles

**Tool selection:**

- **Framer Motion** — React components, page transitions, scroll animations, layout animations
- **CSS transitions/keyframes** — Simple hover states, color changes, single-property tweens
- **GSAP** — Complex sequences, SVG morphing, precise timeline control
- **Lottie** — Branded loading, empty states, illustration animations

### Timing at a Glance

| Purpose             | Duration  | Easing      |
| ------------------- | --------- | ----------- |
| Hover feedback      | 100–150ms | ease-out    |
| Standard transition | 200–300ms | ease-out    |
| Page transition     | 300–400ms | ease-in-out |
| Premium / spring    | 400–600ms | spring      |

**Always:** `@media (prefers-reduced-motion: reduce)` — disable decorative motion.

> Full animation patterns → [animation-guide.md](animation-guide.md)
> Advanced (GSAP, Lottie, 3D) → [motion-graphics.md](motion-graphics.md)

---

## 7. Visual Effects Principles

```
Glassmorphism → ⚠️ Standard blue/white glass is a cliché. Use radically or not at all.
Shadows → Elevation system: higher = larger shadow
Gradients → Analogous colors only. NO mesh/aurora blobs.
Borders → Gradient borders for premium feel on dark backgrounds
```

> Full effects with code → [visual-effects.md](visual-effects.md)

---

## 8. "Wow Factor" Checklist

### Premium Indicators

- [ ] Generous whitespace (luxury = breathing room)
- [ ] Consistent 8pt grid — nothing feels randomly placed
- [ ] Smooth, purposeful animations (not decorative spam)
- [ ] Fluid typography that scales gracefully
- [ ] At least one design decision that breaks a convention intentionally
- [ ] Would you be proud to put your name on this?

### Trust Builders

- [ ] Security cues on sensitive actions
- [ ] Social proof / real testimonials (not lorem ipsum)
- [ ] Professional, high-contrast imagery
- [ ] Consistent design language throughout

### Anti-Patterns — Lazy Design

- [ ] ❌ Default system fonts with no typographic intention
- [ ] ❌ Inconsistent spacing (things feel "off" but you can't say why)
- [ ] ❌ Too many competing accent colors
- [ ] ❌ Walls of text without visual hierarchy
- [ ] ❌ Dark + neon + glass = "AI design kit #47"

---

## 9. Decision Process (Every Task)

```
1. CONSTRAINTS → Timeline, brand, tech, audience? If unclear → ASK
2. CONTENT     → What exists? What's the hierarchy?
3. STYLE       → What's appropriate? If unclear → ASK (don't default)
4. EXECUTION   → Apply principles, resist clichés
5. REVIEW      → "Does this serve the user? Is this different from my defaults?"
```

---

## Related Skills

| Skill                      | When                                |
| -------------------------- | ----------------------------------- |
| **frontend-design** (this) | Before coding — design decisions    |
| **tailwind-patterns**      | While coding — v4 utility patterns  |
| **react-best-practices**   | Performance and component structure |

---

**Remember:** Design is THINKING, not copying. Every project deserves fresh consideration based on its unique context and users.
