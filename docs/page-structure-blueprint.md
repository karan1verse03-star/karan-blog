# Page Structure & Layout Blueprint — V1
> Complete structural specification for every page, component, and edge case.
> Aligned with the Design Scheme (blog-design-scheme.md)
> Version 1.0 · March 2026

---

## Global Rules (Applies Everywhere)

### Layout Wrapper
```
┌─────────────────────────────────────────────────────┐
│                    <Navbar />                        │  ← sticky, z-index: 100
├─────────────────────────────────────────────────────┤
│                                                     │
│              <Main Content />                       │  ← max-width: 1200px, centered
│                                                     │
├─────────────────────────────────────────────────────┤
│                    <Footer />                       │  ← always present
└─────────────────────────────────────────────────────┘
```

### Navbar Spec
```
┌─────────────────────────────────────────────────────┐
│  Karan.          Blog  About  Work     [☀/🌙]       │
│  (Lora italic)   (Inter 500, 0.06em tracked, caps)  │
└─────────────────────────────────────────────────────┘
```
| State         | Behavior                                                    |
|---------------|-------------------------------------------------------------|
| Default       | No border, `backdrop-filter: none`, background transparent  |
| On scroll     | `1px` bottom border (`--border`) fades in, bg blurs `blur(12px)` |
| Mobile        | Logo left · Hamburger right · Links in slide-down menu      |
| Theme toggle  | Sun ↔ Moon icon, rotate+scale transition `0.3s`             |

### Footer Spec
```
┌─────────────────────────────────────────────────────┐
│  1px top border                                     │
│  Karan.dev         Blog · About · Work      ↗ X ↗ LI│
│  © 2026                                             │
└─────────────────────────────────────────────────────┘
```
- Font: `Inter 400`, `0.875rem`, `--text-secondary`
- Dark surface even in light mode — grounded, intentional

### System-Wide Data Rules
- Posts sorted by `date` DESC always
- `draft: true` → excluded from all queries, all pages
- Unique slugs enforced by filename — build throws on collision
- `featured: true` → max 1; if multiple, pick most recent

### System-Wide UX Rules
- No dead ends — every page has at least one navigation path forward
- No decorative elements — every visual element serves a purpose
- Text > decoration — whitespace and typography do the heavy lifting
- Mobile: simplified layout, same content, no missing features

---

## 1. Homepage ( / )

### Full Page Structure
```
/
├── <Navbar />
├── <HeroSection />
├── <FeaturedPost />
├── <BlogGrid />          ← all posts except featured, latest first
├── <NewsletterCTA />
└── <Footer />
```

---

### 1.1 Hero Section

#### Layout (Desktop)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│         Build better websites.                          │
│         Land better clients.                            │  ← DM Serif Display
│         Execute faster with AI.                         │     clamp(3rem, 6vw, 5.5rem)
│                                                         │
│    A weekly playbook for developers building            │
│    web agencies — real strategies, no fluff.            │  ← Inter 400, --text-secondary
│                                                         │
│         [  Get weekly posts → email@you.com  ]          │  ← inline form (desktop)
│                   or  Read the blog ↓                   │  ← ghost button
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Layout (Mobile)
```
┌─────────────────────────────┐
│  Build better websites.     │  ← scaled down via clamp()
│  Land better clients.       │
│  Execute faster with AI.    │
│                             │
│  A weekly playbook for      │
│  developers building        │
│  web agencies.              │
│                             │
│  [ your@email.com         ] │  ← stacked
│  [   Subscribe Free →     ] │
│  [ Read the blog          ] │  ← ghost, full width
└─────────────────────────────┘
```

#### Behavior
- Word-by-word reveal animation on title load (staggered `80ms` per word)
- Subtitle fades in after title completes
- CTA slides up after subtitle
- No background images, no gradients — noise texture only

#### Edge Cases
| Scenario                  | Handling                                                  |
|---------------------------|-----------------------------------------------------------|
| Long title wraps          | `clamp()` scales font — never overflows                   |
| No email backend yet      | Form submits, shows success state, logs to console in dev |
| Invalid email submitted   | Inline validation message below input, no page reload     |
| Submission error          | "Something went wrong. Try again." — never a broken state |

---

### 1.2 Featured Post Section

#### Layout (Desktop — Horizontal Card)
```
┌──────────────────────────────────────────────────────────┐
│  LATEST POST                                             │  ← label, Inter 600 caps
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  [● Journey]                          Mar 31, 2026 │  │
│  │                                                    │  │
│  │  Why I'm Building a Web Agency                     │  │
│  │  in 2026 (And What My Plan Is)                     │  │  ← Lora 700, 2.4rem
│  │                                                    │  │
│  │  The real plan, the real numbers, and the          │  │
│  │  exact strategy I'm using to go from solo          │  │  ← 3 lines max, --text-secondary
│  │  developer to agency owner this year.              │  │
│  │                                                    │  │
│  │  8 min read                     Read post →        │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

#### Layout (Mobile — Vertical)
```
┌──────────────────────────────┐
│  LATEST POST                 │
│  ┌────────────────────────┐  │
│  │  [● Journey]           │  │
│  │  Mar 31, 2026          │  │
│  │                        │  │
│  │  Why I'm Building a    │  │
│  │  Web Agency in 2026    │  │
│  │                        │  │
│  │  The real plan, the    │  │
│  │  real numbers...       │  │
│  │                        │  │
│  │  8 min read            │  │
│  │  [ Read post → ]       │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

#### Logic
```
if posts.find(p => p.featured === true)
  → show that post
else
  → show posts[0] (most recent)

if posts.length === 0
  → hide entire section (no empty card)
```

#### Edge Cases
| Scenario                     | Handling                                       |
|------------------------------|------------------------------------------------|
| No posts at all              | Section hidden entirely via conditional render |
| Multiple `featured: true`    | Pick most recent by date                       |
| Featured post title very long| Clamp to 3 lines with ellipsis                 |
| No description in frontmatter| Hide description line, card still renders      |

---

### 1.3 Blog Grid Section

#### Layout (Desktop — 3 Columns)
```
┌──────────────────────────────────────────────────────────────┐
│  RECENT POSTS                                                │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ [● Build]    │  │ [● Acquire]  │  │ [● Execute]  │      │
│  │       7 min  │  │       5 min  │  │       9 min  │      │
│  │              │  │              │  │              │      │
│  │ The Web Dev  │  │ How to Price │  │ 5 AI Tools   │      │
│  │ Stack I Use  │  │ Web Dev      │  │ That Cut My  │      │
│  │ for Every    │  │ Projects So  │  │ Dev Time in  │      │
│  │ Client...    │  │ Clients...   │  │ Half...      │      │
│  │              │  │              │  │              │      │
│  │ Mar 30, 2026 │  │ Mar 29, 2026 │  │ Mar 28, 2026 │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

#### BlogCard — Internal Structure
```
┌──────────────────────────────────┐
│  [● Category]         X min read │  ← pill + meta, space-between
│                                  │
│  Post Title Line One             │  ← Lora 600, 1.2rem, max 2 lines
│  Post Title Line Two             │
│                                  │
│  Short excerpt that describes    │  ← Inter 400, 0.9rem, max 2 lines
│  what this post covers...        │     --text-secondary
│                                  │
│  Mar 31, 2026            ───→    │  ← date + arrow hint
└──────────────────────────────────┘
  ↑ Entire card is <a> tag
  ↑ Hover: translateY(-4px) + accent border glow
```

#### Responsive Behavior
| Breakpoint     | Columns | Card Width          |
|----------------|---------|---------------------|
| Desktop > 1024 | 3       | ~360px              |
| Tablet 640–1024| 2       | ~45%                |
| Mobile < 640   | 1       | 100%                |

#### Edge Cases
| Scenario              | Handling                                          |
|-----------------------|---------------------------------------------------|
| 0 posts               | `<EmptyState />` component shown                  |
| 1 or 2 posts          | Grid renders with 1–2 cards, left-aligned         |
| Odd number of posts   | Last row left-aligned, no stretching              |
| Featured post visible | Excluded from grid (shown in FeaturedPost above)  |

---

### 1.4 Newsletter CTA Section

#### Layout (Desktop)
```
┌──────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░ --bg-surface background ░░░░░░░░░░░░░ │
│                                                      │
│         Get the weekly playbook.                     │  ← Lora 600, 1.75rem
│    One post every Tuesday. Real strategies only.     │  ← Inter, --text-secondary
│                                                      │
│    [ your@email.com              Subscribe →  ]      │  ← inline form
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### Layout (Mobile — Stacked)
```
┌──────────────────────────────┐
│  Get the weekly playbook.    │
│  One post every Tuesday.     │
│                              │
│  [ your@email.com          ] │
│  [      Subscribe →        ] │
└──────────────────────────────┘
```

#### States
```
Default   → Input + button visible
Loading   → Button shows spinner, input disabled
Success   → "You're in. See you Tuesday. ✓" (replaces form)
Error     → "Invalid email." or "Try again." below input
```

---

## 2. Blog Index ( /blog )

### Full Page Structure
```
/blog
├── <Navbar />
├── <PageHeader />            ← "Blog" title + description
├── <CategoryFilterTabs />    ← All · Build · Acquire · Execute · Business · Journey
├── <BlogGrid />              ← filtered or all, sorted by date
├── <Footer />
```

### Page Header
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Blog                                                │  ← Lora 700, 2.4rem
│  Real strategies for building a web dev agency.      │  ← Inter, --text-secondary
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Category Filter Tabs
```
┌──────────────────────────────────────────────────────────────┐
│  [ All ]  [ Build ]  [ Acquire ]  [ Execute ]  [ Business ]  │
│  [ Journey ]                                                  │
└──────────────────────────────────────────────────────────────┘
```
- Active tab: accent-colored bottom border + accent text color
- Inactive: `--text-secondary`
- Behavior: URL param filter (`/blog?category=build`) — page does not reload
- On mobile: horizontally scrollable tab row (no wrapping)

#### Edge Cases
| Scenario                    | Handling                                             |
|-----------------------------|------------------------------------------------------|
| Category has 0 posts        | `<EmptyState />` shown below tabs                    |
| Invalid `?category=` param  | Fallback to "All" silently                           |
| No posts at all             | EmptyState: "No posts yet. First one drops Tuesday." |

---

## 3. Category Page ( /blog/category/[slug] )

### Full Page Structure
```
/blog/category/[slug]
├── <Navbar />
├── <CategoryHeader />        ← category name + description
├── <BlogGrid />              ← posts filtered by category
├── <EmptyState />            ← if no posts in category
└── <Footer />
```

### Category Header
```
┌──────────────────────────────────────────────────────┐
│  ● Build                                             │  ← colored dot + name (Lora 700)
│  Deep dives into Next.js, performance, and UI/UX.    │  ← category description
└──────────────────────────────────────────────────────┘
```

#### Category Descriptions
| Slug       | Description                                                  |
|------------|--------------------------------------------------------------|
| `build`    | Next.js, web performance, UI/UX, and component architecture  |
| `acquire`  | Client outreach, proposals, pricing, and closing strategies  |
| `execute`  | AI tools, workflows, and systems to ship faster              |
| `business` | Contracts, client management, and running the agency         |
| `journey`  | Honest updates from building the agency from scratch         |

#### Edge Cases
| Scenario            | Handling                                              |
|---------------------|-------------------------------------------------------|
| Invalid slug        | `notFound()` → 404 page                               |
| 0 posts in category | EmptyState with CTA → "View all posts"                |

---

## 4. Article Page ( /blog/[slug] )

### Full Page Structure
```
/blog/[slug]
├── <ReadingProgressBar />    ← fixed top, fills on scroll
├── <Navbar />
├── <ArticleHeader />         ← category · title · description · meta
├── <ArticleBody />           ← MDX content, 720px centered
│   └── <InlineCTA />         ← appears ~40% through content
├── <EndCTA />                ← email signup, stronger version
├── <PostNavigation />        ← ← Previous Post  |  Next Post →
└── <Footer />
```

---

### 4.1 Reading Progress Bar
```
█████████████████████░░░░░░░░░░░░░░░░░   ← --accent color, 3px height, fixed top: 0
```
- `position: fixed`, `top: 0`, `left: 0`, `z-index: 200`
- Width driven by `scrollY / (documentHeight - windowHeight) * 100`
- Uses `scaleX()` transform for performance (no width animation)
- Appears only on article pages

---

### 4.2 Article Header
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  [● Acquire]                                         │  ← category pill
│                                                      │
│  How to Price Web Dev Projects                       │
│  So Clients Say Yes                                  │  ← Lora 700, 2.4rem
│                                                      │
│  The exact framework I use to quote projects         │
│  without losing the deal or undercharging.           │  ← description, --text-secondary
│                                                      │
│  Mar 31, 2026  ·  7 min read  ·  #pricing  #clients  │  ← meta row
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Category pill links to `/blog/category/[slug]`
- Tags shown only if present — entire meta row still renders without them
- Tags are clickable → `/blog?tag=[tag]` filter

#### Edge Cases
| Scenario               | Handling                                            |
|------------------------|-----------------------------------------------------|
| Title very long        | Wraps cleanly, no max-line clamp on article header  |
| No tags in frontmatter | Tag portion of meta row hidden                      |
| No description         | Description line hidden, header still renders       |

---

### 4.3 Article Body

#### Typography Rules (720px column)
```
┌──────────────────────────────────────────────────────────────────┐
│          ←————————————— 720px ————————————————→                  │
│                                                                  │
│  ## Section Heading (Lora 600, 1.75rem)                          │
│                                                                  │
│  Body paragraph text in Inter 400 at 1.125rem with              │
│  line-height 1.75. This is the primary reading                   │
│  experience — clean, generous, and always legible.               │
│                                                                  │
│  - Bullet point one                                              │
│  - Bullet point two                                              │
│                                                                  │
│  > Blockquote styled with 3px accent left border                 │
│  > and --bg-surface background                                   │
│                                                                  │
│  `inline code` in JetBrains Mono, --code-text color             │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │ tsx                                    [Copy ✓]  │           │
│  │ const hello = "world"                            │           │
│  │ export default function Page() {                 │           │
│  │   return <h1>{hello}</h1>                        │           │
│  │ }                                                │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  ┌── tip ────────────────────────────────────────┐              │
│  │  💡 Callout: Key insight or tip goes here.    │              │
│  └───────────────────────────────────────────────┘              │
│                                                                  │
│  This is <mark>highlighted important text</mark>                 │  ← shimmer animation
│  that draws attention to critical points.                        │
│                                                                  │
│  Images break out to 960px for visual impact:                    │
└──────────────────────────────────────────────────────────────────┘
         ←────────────────── 960px ──────────────────→
         [         full-bleed image goes here         ]
```

#### MDX Components Available
| Component            | Usage in MDX                           | Visual Style                    |
|----------------------|----------------------------------------|---------------------------------|
| `<Callout type="tip">`     | Pro tips                         | Green left border               |
| `<Callout type="warning">` | Watch out                        | Amber left border               |
| `<Callout type="insight">` | Key point                        | Accent (orange) left border     |
| `<Callout type="note">`    | Side note                        | Muted border                    |
| `<CodeBlock />`      | Syntax highlighted code                | Dark bg, copy button, lang badge|
| `<Mark />`           | Important inline text                  | Shimmer highlight animation     |
| Standard: `h2–h4`    | Section structure                      | Lora, weighted hierarchy        |
| Standard: `a`        | Links                                  | Animated underline on hover     |
| Standard: `blockquote` | Quotes                               | Accent left border + bg-surface |
| Standard: `img`      | Images (via next/image)                | Breakout to 960px, lazy loaded  |
| Standard: `table`    | Data tables                            | Clean borders, --bg-surface rows|

---

### 4.4 Inline CTA (Mid-Article, ~40% scroll)

```
┌──────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░ --bg-surface, subtle border ░░░░░░░░░ │
│                                                      │
│  Enjoying this?                                      │  ← Lora 600
│  Get next week's breakdown in your inbox.            │  ← Inter, --text-secondary
│                                                      │
│  [ your@email.com            Subscribe →  ]          │
└──────────────────────────────────────────────────────┘
```
- Placed manually in MDX using `<InlineCTA />` component tag
- Author inserts at natural break point (~40% through content)
- Dismissible (small × icon) — dismissed state saved in sessionStorage

---

### 4.5 End CTA

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  If this was useful →                                │  ← Lora 600, 1.5rem
│  Get every new post straight to your inbox.          │  ← Inter
│  No noise. One email. Every Tuesday.                 │  ← --text-secondary, smaller
│                                                      │
│  [ your@email.com                  Subscribe →  ]    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### 4.6 Post Navigation

```
┌──────────────────────────────────────────────────────┐
│  1px top border                                      │
│                                                      │
│  ← Previous Post              Next Post →            │
│  Why I Started This Blog       5 AI Tools That...    │  ← title preview
│  [● Journey]                          [● Execute]    │  ← category pill
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### Logic
```
previousPost = posts.find(p => p.date < current.date)  → latest one before current
nextPost     = posts.find(p => p.date > current.date)  → earliest one after current

if no previousPost → left side hidden (not greyed out, just absent)
if no nextPost     → right side hidden
```

---

### 4.7 Article Page Edge Cases
| Scenario                  | Handling                                                  |
|---------------------------|-----------------------------------------------------------|
| Slug not found            | `notFound()` → 404 page                                   |
| `draft: true` accessed    | `notFound()` → treated same as missing                    |
| No OG image in frontmatter| Fallback to `/public/og-default.png`                      |
| Broken MDX component      | Error boundary catches, shows "Content unavailable"       |
| First post (no previous)  | Previous arrow hidden                                     |
| Last post (no next)       | Next arrow hidden                                         |
| Missing tags              | Meta row renders without tag section                      |

---

## 5. About Page ( /about )

### Full Page Structure
```
/about
├── <Navbar />
├── <IntroSection />          ← name · positioning statement · what you're building
├── <WhatImBuilding />        ← agency journey context
├── <TechStack />             ← icons/list of your stack
├── <AboutCTA />              ← email signup or "work with me"
└── <Footer />
```

### Layout Sketch
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Hey, I'm Karan.                                     │  ← DM Serif Display, 3rem
│                                                      │
│  I'm a web developer building a one-person           │
│  agency from Agra — writing every week about         │  ← Inter, body size
│  what's actually working.                            │
│                                                      │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  What I'm Building                                   │  ← Lora 600, h2
│  [honest paragraph about the agency journey]         │
│                                                      │
│  My Stack                                            │  ← Lora 600, h2
│  Next.js · Supabase · Tailwind · TypeScript          │
│  Cursor AI · Vercel · Resend · Plausible             │
│                                                      │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  Follow the journey →                                │
│  [ your@email.com            Subscribe →  ]          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Content Rules
- No stock photos, no headshot required for V1
- No "I am passionate about..." language
- Every sentence either builds trust, demonstrates expertise, or drives action
- Positioning statement visible within first 3 lines of reading

---

## 6. 404 Page

### Layout
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  404                                                 │  ← DM Serif Display, huge
│                                                      │
│  This page doesn't exist.                            │  ← Lora
│  (Or it moved. Or you typed something wrong.)        │  ← Inter, --text-secondary
│                                                      │
│  [  ← Back to Blog  ]                               │  ← accent button
│                                                      │
└──────────────────────────────────────────────────────┘
```
- No images, no illustrations
- Single CTA → `/blog`
- Centered, minimal, matches site tone

---

## 7. Empty State Component (Reusable)

Used on: blog grid (0 posts), category pages (0 posts in category), filtered results.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  No posts yet.                                       │  ← Lora 600
│  Check back soon — or explore another category.     │  ← Inter, --text-secondary
│                                                      │
│  [  View all posts →  ]                              │  ← ghost button → /blog
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Props:**
```ts
<EmptyState
  title="No posts yet."
  description="Check back soon — or explore another category."
  cta={{ label: "View all posts", href: "/blog" }}
/>
```

---

## 8. Complete Edge Case Register

| Page / Component     | Edge Case                      | Behavior                                    |
|----------------------|-------------------------------|----------------------------------------------|
| Navbar               | Scroll at top                 | No border, transparent                       |
| Navbar               | Scrolled down                 | Border fades in, blur activates              |
| Homepage Hero        | No email backend              | Form works UI-side, logs to console in dev   |
| Featured Post        | 0 posts                       | Section hidden entirely                      |
| Featured Post        | Multiple `featured: true`     | Most recent shown                            |
| Blog Grid            | 0 posts                       | EmptyState shown                             |
| Blog Grid            | 1–2 posts                     | Grid renders normally, left-aligned          |
| Blog Index           | Invalid `?category=` param    | Silently falls back to "All"                 |
| Category Page        | Invalid slug                  | `notFound()` → 404                           |
| Category Page        | 0 posts in category           | EmptyState shown                             |
| Article Page         | Slug not found                | `notFound()` → 404                           |
| Article Page         | `draft: true`                 | `notFound()` → treated as missing            |
| Article Page         | No OG image                   | `/public/og-default.png` as fallback         |
| Article Page         | No tags                       | Tag row hidden, meta still renders           |
| Article Page         | First post (no previous)      | Previous nav hidden                          |
| Article Page         | Last post (no next)           | Next nav hidden                              |
| Article Page         | Broken MDX                    | Error boundary → "Content unavailable"       |
| Post Navigation      | Only 1 post total             | Both previous and next hidden                |
| 404 Page             | Any unknown route             | Rendered via Next.js `not-found.tsx`         |
| Theme toggle         | First visit                   | Reads `prefers-color-scheme`, stores in LS   |
| Theme toggle         | Returning visit               | Reads from `localStorage`                    |
| Fonts                | Loading                       | `display: swap` + `next/font` preload → CLS = 0 |

---

## 9. Component File Map (Next.js)

```
src/
├── app/
│   ├── layout.tsx                  ← root layout: Navbar + Footer + ThemeProvider
│   ├── page.tsx                    ← homepage
│   ├── not-found.tsx               ← 404 page
│   ├── about/
│   │   └── page.tsx
│   ├── blog/
│   │   ├── page.tsx                ← /blog index
│   │   ├── [slug]/
│   │   │   └── page.tsx            ← article page
│   │   └── category/
│   │       └── [category]/
│   │           └── page.tsx        ← category page
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturedPost.tsx
│   │   └── NewsletterCTA.tsx
│   ├── blog/
│   │   ├── BlogGrid.tsx
│   │   ├── BlogCard.tsx
│   │   ├── CategoryFilterTabs.tsx
│   │   └── PostNavigation.tsx
│   ├── article/
│   │   ├── ArticleHeader.tsx
│   │   ├── ArticleBody.tsx
│   │   ├── ReadingProgressBar.tsx
│   │   ├── InlineCTA.tsx
│   │   └── EndCTA.tsx
│   ├── mdx/
│   │   ├── Callout.tsx
│   │   ├── CodeBlock.tsx
│   │   └── Mark.tsx
│   └── ui/
│       ├── EmptyState.tsx
│       ├── CategoryPill.tsx
│       ├── ThemeToggle.tsx
│       └── EmailForm.tsx
├── lib/
│   ├── posts.ts                    ← getAllPosts(), getPostBySlug(), etc.
│   └── utils.ts
├── content/
│   └── blog/
│       ├── [slug].mdx
│       └── ...
└── styles/
    └── globals.css                 ← design tokens, base styles
```

---

*Page Structure Blueprint v1.0 · March 2026*
*Aligned with: blog-design-scheme.md + pre-coding-decisions.md*
