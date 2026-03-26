# Blog Setup — Complete Decision Document
> Answered by: AI Product Manager | Based on: All prior discussions
> Version 1.0 · March 2026

---

## 1. Identity

**Blog Name:** `Karan.dev` *(or your chosen domain — the brand is YOU)*
**Tagline:** "Build better websites. Land better clients. Execute faster with AI."
**Why this blog exists:**
To document and share the real playbook of going from solo developer to web agency owner —
covering the technical craft, client acquisition strategies, and AI-powered workflows that
actually work. Every post is written from lived experience, not theory.

---

## 2. Audience

**Who you're writing for:**
Developers (18–30) who know how to code but are stuck at the freelancer ceiling —
they want consistent clients, premium pricing, and a path to running an actual agency.

**Their level:**
Intermediate — they understand code, frameworks, and the basics of freelancing.
They don't need "what is HTML" — they need "how do I close a ₹1.5L project."

---

## 3. Niche

**You WILL write about:**
- Building high-performance, modern websites (Next.js, UI/UX, web performance)
- Getting clients — outreach, proposals, positioning, pricing
- Using AI tools to design, build, and deliver faster
- Running a web dev business — systems, contracts, scaling
- Your personal agency journey — transparent, real numbers, real lessons

**You will NOT write about:**
- Generic "learn to code" beginner tutorials
- Unrelated tech (mobile apps, game dev, data science)
- Vague motivational content with no actionable takeaway
- Tools or trends you haven't personally used and tested

---

## 4. Content Categories

| # | Category   | Slug         | Color    | What it covers                                          |
|---|------------|--------------|----------|---------------------------------------------------------|
| 1 | Build      | `/build`     | Orange   | Next.js, performance, UI/UX, component design           |
| 2 | Acquire    | `/acquire`   | Teal     | Client outreach, proposals, pricing, cold emails        |
| 3 | Execute    | `/execute`   | Indigo   | AI tools, workflows, automation, speed strategies       |
| 4 | Business   | `/business`  | Amber    | Contracts, systems, client management, agency growth    |
| 5 | Journey    | `/journey`   | Rose     | Weekly updates, honest reflections, real metrics        |

---

## 5. Content Style

**Tone:** Conversational but sharp — like a senior dev talking to a peer, not a professor
lecturing students. First person. Direct sentences. No padding.

**Post length:**
- Standard posts: 800–1,500 words (focused, scannable, no fluff)
- Deep-dive guides: 2,000–3,500 words (step-by-step, complete)
- Journey updates: 400–700 words (raw, quick, honest)

**Rule:** Every post must have one clear takeaway a reader can act on the same day.

---

## 6. Writing Structure

Every blog post follows this exact template:

```
1. HOOK        — One punchy sentence or question that earns the read (2–3 lines)
2. CONTEXT     — Why this topic matters right now, what problem it solves (1 short para)
3. THE MEAT    — Main content: steps, strategies, examples, code, screenshots
                 Use H2/H3 headers, bullet points, code blocks freely
4. REAL TALK   — One honest reflection: what worked, what didn't, what surprised you
5. TAKEAWAY    — Single bold action the reader should take today (1–3 sentences)
```

No generic introductions. No "In this article we will explore..." ever.

---

## 7. Tech Stack

| Layer           | Choice                    | Reason                                              |
|-----------------|---------------------------|------------------------------------------------------|
| Framework       | Next.js 15 (App Router)   | You know it, SSG for blogs = fast + SEO-ready        |
| Styling         | Tailwind CSS v4           | Utility-first, pairs perfectly with design tokens    |
| Fonts           | next/font                 | Zero layout shift, self-hosted                       |
| Dark Mode       | next-themes               | Simple, reliable, localStorage persistence           |
| Content Source  | MDX (local files)         | Full control, no CMS cost, great with Next.js        |
| Syntax Highlight| Shiki                     | Best output quality, warm dark theme support         |
| Animations      | CSS + IntersectionObserver| No heavy lib needed for your animation scope         |
| Deployment      | Vercel                    | Zero config, auto deploys, free tier sufficient      |

**Why MDX over Supabase for content:**
MDX files live in your repo — no database cost, no latency, git-versioned, and you can
write posts in VS Code with full preview. Switch to a CMS only when you have 50+ posts.

---

## 8. Features — V1 Only

### Must-Have (Build these first)
- [ ] Homepage with hero + post grid + newsletter CTA
- [ ] Blog index page with category filter tabs
- [ ] Article page with reading progress bar
- [ ] Dark/Light mode toggle with smooth transition
- [ ] Noise texture background
- [ ] Responsive layout (mobile + desktop)
- [ ] Category tag system (color-coded)
- [ ] Basic SEO (title, description, OG image per post)
- [ ] About page

### Ignore for V1 (Add later)
- ✗ Search functionality
- ✗ Comments system
- ✗ Newsletter backend (just collect emails, no automation yet)
- ✗ Related posts algorithm
- ✗ Post series / multi-part linking
- ✗ Analytics dashboard
- ✗ Paid content / gating

---

## 9. URL Structure

```
/                          → Homepage
/blog                      → All posts (filterable by category)
/blog/[slug]               → Individual post
/blog/category/build       → All Build posts
/blog/category/acquire     → All Acquire posts
/blog/category/execute     → All Execute posts
/blog/category/business    → All Business posts
/blog/category/journey     → All Journey posts
/about                     → About you + your stack + agency info
/work                      → Portfolio / client work showcase (V2)
/newsletter                → Newsletter signup page (V2)
```

**Slug format:** kebab-case, descriptive, no dates in URL
Example: `/blog/how-i-closed-my-first-web-agency-client`

---

## 10. Metadata (Every Post)

Every MDX file frontmatter will include:

```yaml
---
title: "How I Closed My First Web Agency Client Without Cold Calling"
description: "The exact outreach strategy I used to land a ₹80,000 project in week 3."
date: "2026-03-31"
category: "acquire"
tags: ["client acquisition", "freelancing", "agency", "outreach"]
readTime: "7 min"
featured: false
draft: false
ogImage: "/og/first-client.png"
---
```

| Field         | Required | Purpose                                      |
|---------------|----------|-----------------------------------------------|
| `title`       | ✅       | Page title + SEO                              |
| `description` | ✅       | Meta description + card excerpt               |
| `date`        | ✅       | Sorting + display                             |
| `category`    | ✅       | Filtering + color coding                      |
| `tags`        | ✅       | Related content grouping                      |
| `readTime`    | ✅       | Shown on card + article header                |
| `featured`    | ✅       | Pin to homepage hero area                     |
| `draft`       | ✅       | Hide from production if true                  |
| `ogImage`     | ✅       | Social share image                            |

---

## 11. Design Direction

**Minimal.** Always minimal.
No gradients, no hero illustrations, no stock photos — typography and whitespace do the work.

**Default:** Dark mode (primary experience)
**Also supported:** Light mode (equally polished, warm off-white)

**Summary:** Editorial blog aesthetic — think a premium indie tech publication, not a
colorful SaaS landing page. The writing is the design.

*(Full design scheme already documented in `blog-design-scheme.md`)*

---

## 12. Content System

**Where blogs live:** `/content/blog/[slug].mdx` in your Next.js repo

**File structure:**
```
content/
└── blog/
    ├── how-i-closed-my-first-client.mdx
    ├── nextjs-performance-checklist.mdx
    ├── ai-tools-i-use-to-build-faster.mdx
    └── ...
```

**Writing workflow:**
1. Create new `.mdx` file in `/content/blog/`
2. Write frontmatter → write post in Markdown + JSX components
3. Preview locally with `next dev`
4. Commit + push → Vercel auto-deploys in ~30 seconds
5. Share link

**No CMS. No dashboard. No database.** VS Code is your CMS.

---

## 13. First 5 Blog Posts

These are ordered strategically — start with your most credible, useful content:

| # | Title                                                          | Category  | Why First                              |
|---|----------------------------------------------------------------|-----------|----------------------------------------|
| 1 | "Why I'm Building a Web Agency in 2026 (And What My Plan Is)" | Journey   | Sets the stage, builds trust, personal |
| 2 | "The Web Dev Stack I Use for Every Client Project in 2026"     | Build     | Showcases expertise immediately        |
| 3 | "How to Price Web Dev Projects So Clients Say Yes"             | Acquire   | High search intent, highly shareable   |
| 4 | "5 AI Tools That Cut My Development Time in Half"              | Execute   | Trending topic, drives traffic         |
| 5 | "The Proposal Template I Use to Close Freelance Clients"       | Business  | Extremely high value, lead magnet      |

---

## 14. Growth Plan

**Week 1–4 (Launch phase):**
- Twitter/X — Post a thread summarizing every blog post on publish day
- LinkedIn — Share posts targeting Indian dev/freelancer community
- Dev.to — Cross-post articles (canonical tag pointing to your site)
- IndieHackers — Share Journey posts + milestones

**Week 5+ (Compound phase):**
- Reddit — Share in r/webdev, r/freelance, r/indiehackers (be helpful, not spammy)
- WhatsApp/Telegram dev groups — Share selectively when genuinely relevant
- SEO — Target long-tail keywords ("how to price web development India", "Next.js agency workflow")
- Newsletter — Build email list from day one, weekly digest of the post

**One rule:** Write the post first. Distribute second. Never skip a week for "more polish."

---

## 15. Workflow — Tools for Every Stage

| Stage        | Tool                        | How you'll use it                                      |
|--------------|-----------------------------|--------------------------------------------------------|
| Ideas        | Perplexity / Twitter trends | Research what devs are asking about this week          |
| Outlining    | Notion or plain `.md` file  | Dump brain → structure into post template              |
| Writing      | VS Code + Copilot           | Write in MDX directly, Copilot for sentence flow       |
| Refining     | Claude (Sonnet)             | Paste draft → ask to cut fluff, sharpen intro, fix CTAs|
| SEO check    | Perplexity                  | Validate keyword angle before publishing               |
| OG Image     | Canva or Satori (code)      | Generate post share images consistently                |
| Publishing   | Git push → Vercel           | 30-second deploy pipeline                              |
| Distribution | Buffer or manual            | Schedule Twitter thread + LinkedIn post same day       |

**Weekly time commitment:** 4–6 hours per post (outline 30min, write 2–3hr, refine 1hr, distribute 30min)

---

*Blog Setup v1.0 — Decisions locked. Ready to build.*
