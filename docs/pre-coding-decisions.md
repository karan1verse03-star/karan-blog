# Pre-Coding Decisions — Final Lock-In
> These are the last decisions before the first line of code is written.
> Version 1.0 · March 2026

---

## 1. BlogCard Component — Exact Spec

### What a BlogCard Shows
```
┌──────────────────────────────────────────────┐
│  [● Acquire]                      6 min read │  ← category pill (colored) + read time
│                                              │
│  How to Price Web Dev Projects               │  ← title (Lora Semibold, 2 lines max)
│  So Clients Say Yes                          │
│                                              │
│  The exact framework I use to quote          │  ← description (Inter, 2 lines, clamped)
│  projects without losing the deal.           │
│                                              │
│  Mar 31, 2026                ───────────→    │  ← date (left) + arrow hint (right)
└──────────────────────────────────────────────┘
```

### BlogCard Rules
- NO thumbnail image — text-only cards, cleaner and faster
- Category pill: colored dot + category name, top-left
- Read time: top-right, `--text-secondary` color
- Title: max 2 lines, clamp with ellipsis on overflow
- Description: max 2 lines, `--text-secondary`
- Date: bottom-left in small meta style
- Hover: card lifts `translateY(-4px)`, accent border glow
- Entire card is one `<a>` tag — fully clickable

### Homepage vs Blog Page Layout
| Page         | Layout                                              |
|--------------|------------------------------------------------------|
| Homepage     | 1 Featured Post (large, full-width) + 2-col grid below |
| /blog        | 3-col grid (desktop) / 2-col (tablet) / 1-col (mobile) |
| /blog/category/[x] | Same as /blog but pre-filtered               |

They share the same `<BlogCard />` component — different grid wrappers only.
The homepage featured post uses a `<FeaturedCard />` variant — larger, horizontal layout.

---

## 2. MDX Capabilities — V1 Component Set

### Included in V1
| Component        | Usage                                              | Priority |
|------------------|----------------------------------------------------|----------|
| `<Callout />`    | Tips, warnings, key insights — colored left border | ✅ Must  |
| `<CodeBlock />`  | Syntax highlighted code with copy button           | ✅ Must  |
| `<Mark />`       | Highlight shimmer for important inline text        | ✅ Must  |
| Standard MDX     | h1–h6, p, ul, ol, blockquote, img, a, hr, table   | ✅ Must  |

### Excluded from V1 (Add later)
| Component        | Reason to skip now                                 |
|------------------|----------------------------------------------------|
| `<TweetEmbed />` | External dependency, adds load weight              |
| `<YouTube />`    | Same — avoid iframe-heavy embeds in V1             |
| `<Newsletter />` | No backend yet                                     |
| `<Series />`     | No post series until 15+ posts exist               |

### Callout Variants
```jsx
<Callout type="tip">     → Green left border — pro tips
<Callout type="warning"> → Amber left border — watch out
<Callout type="insight"> → Accent (orange) border — key point
<Callout type="note">    → Muted border — side note
```

---

## 3. Featured Post Logic — Locked

**Rule: Only 1 featured post at any time.**

- `featured: true` on exactly one MDX file
- If multiple are marked true → show the most recent one (fallback logic)
- Featured post appears ONLY on the homepage, not on /blog
- It uses `<FeaturedCard />` — horizontal layout, larger title, longer excerpt (3 lines)
- All other posts use the standard `<BlogCard />` grid

**Where shown:** Directly below the hero section on homepage, above the post grid.
Label it: `"Latest Post"` or `"Featured"` — keep the label minimal.

---

## 4. Tag System Behavior — Locked

**Decision: Clickable tags that filter, no separate tag pages in V1.**

| Behavior              | V1 Decision                                      |
|-----------------------|---------------------------------------------------|
| Tags shown on card    | No — cards show category only (cleaner)           |
| Tags shown on post    | Yes — below the title in the article header       |
| Tags are clickable    | Yes — click takes to `/blog?tag=client-acquisition` |
| Separate `/tags/x` pages | No — URL query param filter only            |
| Tag pages (V2)        | Yes — add later when there's enough tagged content|

**Why:** Separate tag pages with 1–2 posts each look empty and hurt SEO. Filter-only
keeps it functional without creating thin pages.

---

## 5. Mobile Experience Priority — Locked

**Mindset: Desktop-first design, mobile-clean delivery.**

This means:
- You design and build for desktop first (your primary reader is at a laptop)
- Mobile layout is simplified — not a worse version, just stripped to essentials
- No mobile-only features or interactions
- Animations: full on desktop, reduced on mobile (`@media (prefers-reduced-motion)` + 
  disable cursor effects on touch devices)
- Typography scales down gracefully via `clamp()` — no separate mobile type decisions
- Hamburger menu on mobile: simple slide-down, no fancy drawer animations

**Mobile layout decisions:**
```
Navbar    → Logo left, hamburger right
Hero      → Stacked, reduced font size
Post Grid → Single column
Cards     → Full width, same content
Article   → Full width, 16px horizontal padding
```

---

## 6. Performance Rules — Non-Negotiable

**Target: Lighthouse score ≥ 90 on all pages. Always.**

### Hard Rules
| Rule                                          | Enforcement                              |
|-----------------------------------------------|-------------------------------------------|
| No animation libraries (Framer Motion, GSAP)  | CSS + IntersectionObserver only           |
| No icon libraries loaded fully                | Import only used icons from Lucide        |
| No Google Fonts via CDN                       | `next/font` only — self-hosted            |
| No heavy UI kits (shadcn full install, etc.)  | Build components from scratch             |
| Images: always use `next/image`               | Automatic WebP + lazy load                |
| No client components unless required          | Default to React Server Components        |
| Bundle check before every deploy              | `next build` output — watch for warnings  |

### Allowed
- Shiki (syntax highlighting — runs at build time, zero runtime cost)
- next-themes (tiny, no performance impact)
- Tailwind v4 (zero runtime CSS-in-JS)

### Animation Performance Rule
All animations use:
- `transform` and `opacity` only — these don't trigger layout reflow
- `will-change: transform` only on cards during hover, removed after
- `prefers-reduced-motion` media query respected on all animations

---

## 7. Content Writing System — Personal Commitment

### Schedule
| Slot          | Day       | Activity                                        |
|---------------|-----------|-------------------------------------------------|
| Writing Block | Sunday    | Write the full post draft (2–3 hours)           |
| Refine + Edit | Monday    | Polish with Claude, final read-through (1 hour) |
| Publish + Share | Tuesday | Push, deploy, post Twitter thread + LinkedIn    |

**Cadence: 1 post per week. Every Tuesday.**

No exceptions for the first 3 months. Consistency > quality in the early stage.
A published average post beats an unpublished perfect post every single time.

### When You Miss a Week
- Do NOT publish 2 posts the following week to "catch up"
- Publish the 1 post, note the miss in your Journey category honestly
- Readers trust consistency and honesty more than volume

### Idea Pipeline System
Keep a running `ideas.md` file in your repo:
```
ideas.md
─────────
- [ ] How I use Cursor AI to build components 3x faster
- [ ] My client onboarding process (Notion template)
- [ ] Why most dev portfolios fail to get clients
- [ ] The 1-page proposal that closed a ₹1.2L project
- [ ] Lighthouse 100 score: what I did differently
```
Add to this whenever you have an idea. Never start a week without 3+ ideas queued.

### Pre-Publish Checklist (Run every time)
- [ ] Frontmatter complete (all 9 fields filled)
- [ ] Post follows Hook → Context → Meat → Real Talk → Takeaway structure
- [ ] One clear actionable takeaway in the last section
- [ ] No post longer than needed — cut anything that doesn't earn its place
- [ ] Code blocks tested and rendering correctly
- [ ] OG image created and linked
- [ ] `draft: false` set before push
- [ ] Twitter thread drafted and ready to post

---

## Summary — All Decisions Locked

| # | Decision                  | Answer                                          |
|---|---------------------------|-------------------------------------------------|
| 1 | BlogCard content          | Category + ReadTime + Title + Excerpt + Date    |
| 2 | MDX components V1         | Callout, CodeBlock, Mark + standard markdown    |
| 3 | Featured post logic       | 1 at a time, homepage only, FeaturedCard layout |
| 4 | Tag behavior              | Clickable filter via query param, no tag pages  |
| 5 | Mobile priority           | Desktop-first design, mobile-clean delivery     |
| 6 | Performance rule          | Lighthouse ≥ 90, no animation libs, RSC-default |
| 7 | Writing cadence           | 1 post/week, publish every Tuesday              |

---

**All pre-coding decisions are now complete. You are ready to open VS Code.**

*Pre-Coding Decisions v1.0 · March 2026*
