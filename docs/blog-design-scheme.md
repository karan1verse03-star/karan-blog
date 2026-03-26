# Blog Website — Complete Design Scheme
> A center-focused, typographically rich blog with warm noise-textured dark/light mode, editorial headings, a clean post grid, and zero UI clutter — where the writing always wins.

---

## 1. Brand Identity

**Blog Purpose:** A practical, no-fluff resource for developers building web agencies — covering web performance, client acquisition, AI-powered execution, and the honest journey of going from freelancer to agency owner.

**Tone:** Direct. Real. Zero fluff. Like advice from a developer friend who's one step ahead.

**Core Personality Traits:** Minimal · Editorial · Technical · Authentic · Modern

---

## 2. Color System

### Light Mode
| Role              | Token Name         | Hex Value   | Usage                                      |
|-------------------|--------------------|-------------|---------------------------------------------|
| Background        | `--bg-base`        | `#F7F5F0`   | Page background — warm off-white            |
| Surface           | `--bg-surface`     | `#EFEDE8`   | Card backgrounds, code blocks               |
| Border            | `--border`         | `#E0DDD6`   | Dividers, card outlines                     |
| Text Primary      | `--text-primary`   | `#1A1A1A`   | Headings, body copy                         |
| Text Secondary    | `--text-secondary` | `#6B6860`   | Meta info, captions, tags                   |
| Accent            | `--accent`         | `#D4570A`   | Links, hover states, CTAs — burnt orange    |
| Accent Muted      | `--accent-muted`   | `#F2E0D5`   | Highlight backgrounds, tag pills            |
| Code Text         | `--code-text`      | `#C0392B`   | Inline code                                 |

### Dark Mode
| Role              | Token Name              | Hex Value   | Usage                                       |
|-------------------|-------------------------|-------------|----------------------------------------------|
| Background        | `--bg-base`             | `#0F0E0C`   | Warm near-black — not pure black             |
| Surface           | `--bg-surface`          | `#1A1916`   | Cards, code blocks                           |
| Border            | `--border`              | `#2A2825`   | Dividers                                     |
| Text Primary      | `--text-primary`        | `#F0EDE8`   | Headings, body copy — warm white             |
| Text Secondary    | `--text-secondary`      | `#8A8780`   | Meta, captions, tags                         |
| Accent            | `--accent`              | `#E8692A`   | Links, hover — slightly brighter in dark     |
| Accent Muted      | `--accent-muted`        | `#2A1A10`   | Highlight backgrounds                        |
| Code Text         | `--code-text`           | `#E07B5A`   | Inline code                                  |

### Noise Texture Overlay
- SVG-based grain texture applied as a `::before` pseudo-element on `<body>`
- Opacity: `0.035` (light mode) / `0.05` (dark mode)
- Blendmode: `overlay`
- Gives depth and warmth without any visual noise at first glance

---

## 3. Typography

### Font Stack

| Role              | Font Family             | Weight(s)       | Notes                                        |
|-------------------|-------------------------|-----------------|-----------------------------------------------|
| Display/Hero      | `DM Serif Display`      | 400             | Editorial, expressive — for hero titles only  |
| Headings (H1–H3)  | `Lora`                  | 600, 700        | Serif — warm and readable                     |
| Body Copy         | `Inter`                 | 400, 500        | Clean sans-serif — best screen readability    |
| Monospace/Code    | `JetBrains Mono`        | 400, 500        | Code blocks, tags, small labels               |
| UI Labels/Nav     | `Inter`                 | 500, 600        | Consistent with body, slightly tracked        |

### Type Scale

| Element           | Size         | Line Height | Letter Spacing | Font              |
|-------------------|--------------|-------------|----------------|-------------------|
| Hero Title        | `clamp(3rem, 6vw, 5.5rem)` | 1.1 | -0.02em  | DM Serif Display  |
| H1 (Post Title)   | `2.4rem`     | 1.25        | -0.015em       | Lora 700          |
| H2                | `1.75rem`    | 1.3         | -0.01em        | Lora 600          |
| H3                | `1.3rem`     | 1.4         | 0              | Lora 600          |
| Body              | `1.125rem`   | 1.75        | 0              | Inter 400         |
| Caption/Meta      | `0.875rem`   | 1.5         | 0.02em         | Inter 400         |
| Code Inline       | `0.9em`      | —           | 0              | JetBrains Mono    |
| Nav Links         | `0.9rem`     | —           | 0.06em         | Inter 600 (caps)  |

---

## 4. Layout & Spacing

### Grid System
- Base unit: `8px`
- Max site width: `1200px`
- Article column max-width: `720px` (centered)
- Homepage grid: `repeat(auto-fill, minmax(320px, 1fr))` — 2–3 cols
- All sections padded: `clamp(1.5rem, 4vw, 3rem)` horizontally

### Spacing Tokens
```
--space-xs:   4px
--space-sm:   8px
--space-md:   16px
--space-lg:   32px
--space-xl:   64px
--space-2xl:  96px
--space-3xl:  128px
```

### Z-Index Layers
```
--z-base:     0
--z-elevated: 10    (cards on hover)
--z-nav:      100   (sticky navbar)
--z-overlay:  200   (modals, drawers)
--z-toast:    300   (notifications)
```

---

## 5. Components

### 5.1 Navbar
- **Position:** Sticky top, blurs background on scroll (`backdrop-filter: blur(12px)`)
- **Height:** `60px`
- **Structure:** Logo (left) → Nav links (right) → Theme toggle icon (far right)
- **Links:** Blog · About · Work · Newsletter
- **Style:** No border by default. On scroll: thin `1px` bottom border at `--border` color fades in
- **Logo:** Wordmark in `Lora` italic + accent-colored period at the end (e.g., *"Karan."*)

### 5.2 Hero Section (Homepage)
- Full-width, centered text layout
- Display title using `DM Serif Display` — large, expressive, 2–3 lines max
- Subtitle in `Inter` — one sentence, `--text-secondary` color
- Two CTAs: Primary button (accent filled) + Ghost button (outline)
- Background: base color + noise texture. No images, no gradients — let type do the work

### 5.3 Blog Post Card
```
┌─────────────────────────────────┐
│  [Category Tag]                 │
│                                 │
│  Post Title in Lora Semibold    │
│  Two-line excerpt in Inter...   │
│                                 │
│  Mar 2026  ·  6 min read        │
└─────────────────────────────────┘
```
- Background: `--bg-surface`
- Border: `1px solid --border`
- Border radius: `12px`
- Hover: Card lifts `translateY(-4px)`, border color shifts to `--accent` at 40% opacity — transition `0.25s ease`
- Category tag: pill shape, `--accent-muted` background, `--accent` text

### 5.4 Article Page Layout
- Navbar → Hero (title + meta) → Body (720px centered) → Footer (next/prev post)
- Images inside articles: max-width breakout to `960px` (wider than text column) for visual impact
- Code blocks: full-width of text column, `--bg-surface` background, `JetBrains Mono`, syntax highlighted
- Blockquotes: left `3px` solid `--accent` border, `--bg-surface` background, italic `Lora`

### 5.5 Category Tags / Pills
- Shape: `border-radius: 999px`
- Size: `0.75rem` font, `4px 12px` padding
- Colors per category (all use accent family):
  - **Build** → Orange `#E8692A`
  - **Acquire** → Teal `#2A9D8F`
  - **Execute** → Indigo `#5C6BC0`
  - **Business** → Amber `#E9A820`
  - **Journey** → Soft rose `#C2596A`

### 5.6 Newsletter CTA Block
- Full-width section with `--bg-surface` background
- Centered: Short headline → One-line description → Email input + Button inline
- No heavy gradients — let the typography carry the weight

### 5.7 Footer
- Minimal: Logo left · Nav links center · Social icons right
- One thin top border
- Dark version of surface color even in light mode — grounded, intentional

---

## 6. Visual & Animation System

### 6.1 Core Animation Principles
- **Duration:** Fast UI = `150ms`, Transitions = `250ms`, Entrances = `400–600ms`
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — snappy with smooth end (expo out)
- **Rule:** Never animate for decoration. Every animation has a purpose — feedback, focus, or flow.

### 6.2 Text Animations

#### Hero Title — Word Reveal
Each word in the hero title slides up from `20px` below with fade-in, staggered `80ms` per word.
```css
@keyframes wordReveal {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-word {
  display: inline-block;
  animation: wordReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
/* Apply animation-delay: 0ms, 80ms, 160ms... per word via JS */
```

#### Animated Underline on Links
All inline body links get a sliding animated underline using `--accent` color — the underline grows from left to right on hover.
```css
.prose a {
  text-decoration: none;
  background-image: linear-gradient(var(--accent), var(--accent));
  background-size: 0% 1.5px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size 0.3s ease;
}
.prose a:hover {
  background-size: 100% 1.5px;
}
```

#### Important Text — Highlight Shimmer
For key callout lines within a blog post (e.g., *"This single change doubled my close rate"*), wrap in a `<mark>` element styled with a subtle shimmer animation — a warm accent wash that pulses once on scroll-enter.
```css
mark.highlight {
  background: linear-gradient(120deg, var(--accent-muted) 0%, transparent 100%);
  border-radius: 3px;
  padding: 0 4px;
  animation: highlightPulse 1.2s ease forwards;
}
@keyframes highlightPulse {
  0%   { background-size: 0% 100%; }
  100% { background-size: 100% 100%; }
}
```

#### Section Entrance — Fade + Slide Up
All major sections (cards, headings, CTAs) animate in as they enter the viewport via `IntersectionObserver`:
```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### 6.3 UI Interaction Animations

#### Blog Post Card Hover
```css
.post-card {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.25s ease,
              box-shadow 0.25s ease;
}
.post-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--accent) 10%, transparent);
}
```

#### Reading Progress Bar
Thin `3px` line fixed at the very top of article pages, fills left-to-right in `--accent` color as the user scrolls. Implemented via scroll event in JS updating a `scaleX()` transform.

#### Dark/Light Mode Toggle
Toggle animates with a rotate + scale transition on the icon (sun ↔ moon). Background color transitions use CSS custom properties for smooth cross-fade across all elements.
```css
:root { transition: background-color 0.3s ease, color 0.3s ease; }
```

#### Cursor — Subtle Magnetic Effect on CTAs
Primary CTA buttons have a subtle magnetic pull on hover — the button follows the cursor `±8px` for a playful, premium feel. Implemented with `mousemove` event tracking relative to button center.

### 6.4 Code Block Enhancements
- Syntax highlighting with a warm dark theme (custom or Shiki `vesper` theme)
- One-click **copy button** appears top-right on hover with a checkmark confirmation animation
- Language badge (e.g., `tsx`, `bash`) shown top-left in `JetBrains Mono`

---

## 7. Iconography

- **Library:** Lucide Icons — clean, consistent, 1.5px strokes
- **Size:** `20px` for UI, `16px` for inline/tags
- **Style:** Stroke only, never filled — matches the editorial, minimal aesthetic

---

## 8. Dark/Light Mode Switching

- Preference detected via `prefers-color-scheme` on first load
- Stored in `localStorage` for persistence
- Applied via `data-theme="dark"` attribute on `<html>`
- All colors use CSS custom properties — no class swapping needed
- Transitions: `background-color`, `color`, `border-color` all transition `0.3s ease`
- Noise texture opacity changes automatically via `data-theme` selector

---

## 9. Responsive Breakpoints

| Name       | Breakpoint  | Layout Changes                                             |
|------------|-------------|-------------------------------------------------------------|
| Mobile     | `< 640px`   | Single column, reduced type scale, hamburger menu           |
| Tablet     | `640–1024px`| 2-col post grid, full navbar, reduced hero padding          |
| Desktop    | `> 1024px`  | 3-col grid, full layout, all animations active              |
| Wide       | `> 1400px`  | Max-width container locks, extra side breathing room        |

---

## 10. Page Templates

### Homepage
`Navbar → Hero → Featured Post (large) → Post Grid (all categories) → Newsletter CTA → Footer`

### Blog Index
`Navbar → Page Title + Category Filter Tabs → Post Grid → Pagination → Footer`

### Article Page
`Navbar + Reading Progress Bar → Article Hero (Title, Meta, Category) → Body Content (720px) → Author Bio Block → Next/Prev Post → Footer`

### About Page
`Navbar → Personal intro + Photo → Journey Timeline → Tech Stack → Footer`

---

## 11. Tech Implementation Notes (Next.js)

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4 + CSS custom properties for theming
- **Fonts:** `next/font` with `DM Serif Display`, `Lora`, `Inter`, `JetBrains Mono`
- **Animations:** CSS-first, JS only for scroll-triggered reveals (`IntersectionObserver`) and cursor effects
- **Blog Content:** MDX files or Supabase (your choice) — MDX recommended for formatting control
- **Syntax Highlighting:** Shiki with `vesper` or custom warm dark theme
- **Dark Mode:** `next-themes` library

---

*Design Scheme v1.0 — Karan's Blog Website · March 2026*
