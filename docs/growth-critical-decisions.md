# Growth-Critical Decisions — Final Pre-Build Layer
> The things that break growth if ignored now.
> Version 1.0 · March 2026

---

## 1. 20 Validated Keywords + First 5 Post Mappings

### Keyword Strategy
New blog (DA: 0) → Target ONLY long-tail keywords with KD < 30.
Head terms like "web development" (KD: 70+, Vol: 301K) are irrelevant for now.
Rule: Win small searches consistently → domain authority builds → bigger terms later.

### 20 Target Keywords (Low Competition, Real Intent)

| # | Keyword                                        | Intent       | Est. KD  | Category  |
|---|------------------------------------------------|--------------|----------|-----------|
| 1 | how to price web development projects india    | Informational| Low      | Acquire   |
| 2 | how to get first web development client india  | Informational| Low      | Acquire   |
| 3 | web dev freelance proposal template india      | Commercial   | Very Low | Business  |
| 4 | nextjs portfolio website for freelancers       | Informational| Low      | Build     |
| 5 | ai tools for web developers 2026               | Informational| Low-Med  | Execute   |
| 6 | how to charge more as a freelance web developer| Informational| Low      | Acquire   |
| 7 | web development agency india how to start      | Informational| Low      | Business  |
| 8 | nextjs performance optimization tips           | Informational| Medium   | Build     |
| 9 | how to find clients for web agency india       | Informational| Low      | Acquire   |
| 10| web developer client onboarding process        | Informational| Very Low | Business  |
| 11| cursor ai for web development workflow         | Informational| Very Low | Execute   |
| 12| how to write cold email for web development    | Informational| Low      | Acquire   |
| 13| freelance web developer contract template india| Commercial   | Very Low | Business  |
| 14| how to build fast website with nextjs          | Informational| Low-Med  | Build     |
| 15| using ai to build websites faster 2026         | Informational| Low      | Execute   |
| 16| web developer to agency owner transition       | Informational| Very Low | Journey   |
| 17| how to get web design clients without cold calling | Info     | Low      | Acquire   |
| 18| lighthouse 100 score nextjs guide              | Informational| Low      | Build     |
| 19| what to include in web development proposal    | Informational| Low      | Business  |
| 20| building web agency from scratch india 2026    | Informational| Very Low | Journey   |

### First 5 Posts → Keyword Mapping

| Post Title                                                      | Primary Keyword                               | Category  |
|-----------------------------------------------------------------|-----------------------------------------------|-----------|
| "Why I'm Building a Web Agency in 2026 (And What My Plan Is)"  | building web agency from scratch india 2026   | Journey   |
| "The Web Dev Stack I Use for Every Client Project in 2026"      | how to build fast website with nextjs         | Build     |
| "How to Price Web Dev Projects So Clients Say Yes"              | how to price web development projects india   | Acquire   |
| "5 AI Tools That Cut My Development Time in Half"               | ai tools for web developers 2026              | Execute   |
| "The Proposal Template I Use to Close Freelance Clients"        | web dev freelance proposal template india     | Business  |

**These 5 posts cover all 5 categories and each targets a distinct, low-competition keyword.
Launch all 5 on Day 1.**

---

## 2. Distribution System — Execution Mechanics

### The Rule: 1 Post → 5 Pieces of Content

Every Tuesday publish cycle produces:

```
1 Blog Post
    ├── 1 Twitter/X Thread
    ├── 1 LinkedIn Post
    ├── 1 Dev.to Cross-post
    ├── 1 Short-form insight (standalone tweet or LinkedIn micro-post)
    └── 1 Newsletter email (once list exists)
```

### Twitter/X Thread Template
```
Tweet 1 (Hook):
"I [did X thing] and here's what happened: [surprising result]
Thread 🧵"

Tweet 2–7 (Meat):
One insight per tweet. Numbered. Punchy.
No filler. Each tweet must stand alone.

Tweet 8 (CTA):
"Full breakdown on my blog → [link]
If this helped, retweet tweet 1 so others see it."
```

### LinkedIn Post Template
```
Line 1 (Hook — no hashtags, no emoji spam):
One bold statement or counterintuitive claim.

Lines 2–5 (Context):
Short paragraphs. One idea each. White space is your friend.

Lines 6–8 (Value):
3 specific takeaways from the post.

Line 9 (CTA):
"Full post with [specific thing] in my blog → [link]
Following for more from my agency-building journey."
```

### Dev.to Setup
- Cross-post every Build + Execute category post to Dev.to
- Add canonical URL pointing back to your blog (critical for SEO — prevents duplicate content penalty)
- Dev.to header: `canonical_url: https://yourdomain.com/blog/[slug]`
- Do NOT cross-post Journey posts — those belong only on your blog

---

## 3. Conversion Layer — Full System

### Primary CTA: Email List (Chosen over "Work with me")
**Why email over leads:** You have 0 posts right now. Asking for client work before
building trust = low conversion. Build the list first → leads come naturally by post 20+.

### CTA Placement Plan
| Location                     | CTA Copy                                                        |
|------------------------------|------------------------------------------------------------------|
| Hero section (homepage)      | "Get the weekly playbook → [email input] Subscribe free"        |
| End of every post            | "If this was useful, get next week's post in your inbox → [input]" |
| Mid-article (~40% scroll)    | Inline callout box: "Enjoying this? Join X developers getting the weekly breakdown." |
| About page                   | "Follow the journey — weekly email, no noise."                  |

### Lead Magnet (Simple, High Value)
**"The 1-Page Web Dev Proposal Template"** — the exact template used to close clients.
- Format: Notion page or PDF
- Delivery: Email it automatically after signup (use Resend + a simple serverless function)
- Why this: It's directly tied to your #5 post (highest commercial intent) and solves
  a real pain point your audience has today

### Email Platform: Resend + React Email
- Free up to 3,000 emails/month
- Works natively with Next.js (same stack)
- No third-party dashboard to log into — emails sent from your codebase

---

## 4. Analytics Setup — Minimum Viable Tracking

### Tool: Plausible Analytics (not Google Analytics)
**Why Plausible over GA:**
- Lightweight script (< 1KB vs GA's 45KB) — Lighthouse score stays intact
- Privacy-first — no cookie banner needed (GDPR compliant)
- Simple dashboard — you see what matters in 30 seconds
- $9/month or self-hostable for free on Vercel

### What to Track (and nothing else)
| Metric           | Why it matters                                      |
|------------------|------------------------------------------------------|
| Page views/post  | Which posts get traffic                              |
| Time on page     | Which posts get read vs. skimmed                     |
| Top referrers    | Which distribution channel works (Twitter vs LinkedIn) |
| Email signups    | Is conversion layer working                          |
| Bounce rate      | Is the first impression working                      |

### Weekly Review Habit (15 minutes, every Monday)
```
1. Which post got the most views this week?
2. Where did the traffic come from?
3. What did people do after reading (bounce or browse)?
4. How many email signups?
5. What does this tell me about what to write next?
```
Log answers in a simple `analytics-notes.md` in your repo. Patterns emerge in 4–6 weeks.

---

## 5. SEO Foundation — Technical Checklist

### What to Build (in Next.js)
| Item                        | Implementation                                       |
|-----------------------------|------------------------------------------------------|
| `sitemap.xml`               | Auto-generated via `next-sitemap` package            |
| `robots.txt`                | Allow all, disallow `/drafts/` if any                |
| OG image fallback           | Default `/og-default.png` if post has no ogImage     |
| Canonical tags              | `<link rel="canonical" />` on every page             |
| Meta description            | From MDX frontmatter `description` field             |
| Structured data (JSON-LD)   | BlogPosting schema on article pages                  |

### Internal Linking Rule
**Every post must link to 2–3 other posts.**
No exceptions. This is the single highest-ROI SEO habit for a new blog.
Strategy:
- Always link to 1 post from the same category
- Always link to 1 post from a different category (cross-pillar)
- Add links naturally in body copy — not in a "Related Posts" footer section

---

## 6. Content Engine — 50-Topic Backlog

### Split into 3 Buckets

#### Bucket A: 20 SEO Posts (Search-driven, keyword-targeted)
1. How to price web development projects India
2. How to get first web development client India
3. Freelance web dev proposal template (free download)
4. How to write cold emails that get replies for web dev
5. Next.js performance optimization: complete checklist
6. Lighthouse 100 score: exact steps I took
7. How to build a web dev portfolio that gets clients
8. Web developer contract template India (what to include)
9. How to use Cursor AI for faster web development
10. AI tools every web developer should use in 2026
11. How to find clients for your web agency India
12. Web dev client onboarding checklist (Notion template)
13. How to charge more as a freelance web developer
14. Building a Next.js blog with MDX: complete guide
15. How to scale from freelancer to web agency
16. What to put in a web development project proposal
17. How to handle difficult web development clients
18. Building a web development agency in India: real numbers
19. How to do web dev discovery calls that close
20. SEO basics every web developer should know for clients

#### Bucket B: 15 Authority Posts (Depth, expertise, no clear keyword)
1. Why most developer portfolios fail to get clients (and what does)
2. The real difference between a freelancer and an agency
3. What I learned from my first 5 client projects
4. Why your Next.js site is slow (and it's not what you think)
5. The tech stack I'd choose if starting from scratch in 2026
6. How I use AI to write better code, not just faster code
7. Why I stopped building custom CMS solutions for clients
8. The design decisions that make websites feel premium
9. How to position yourself as a specialist, not a generalist
10. What good web dev client communication looks like
11. The tools I actually use to run my agency day-to-day
12. How to evaluate if a client is worth taking
13. Building in public: the honest case for and against
14. Why performance matters more than features for client sites
15. The mindset shift from "coder" to "business owner"

#### Bucket C: 15 Journey Posts (Personal, builds audience loyalty)
1. Why I'm building a web agency in 2026 (Month 0)
2. Month 1: First client, first lessons, real numbers
3. What I got wrong about pricing in my first month
4. The week I almost quit (and why I didn't)
5. My agency setup: tools, systems, workflow (Month 2)
6. First ₹1L month: what changed, what didn't
7. The client that taught me the most (not the best one)
8. How I balance learning, building, and client work
9. My exact weekly schedule running a solo web agency
10. What I wish someone told me before starting an agency
11. Building in public update: Month 3 metrics
12. The project I'm most proud of (and why)
13. Why I turned down a big client (and what I learned)
14. From zero to 10 blog posts: what writing consistently taught me
15. One year in: honest reflection on the agency journey

---

## 7. Authority Signals — What to Build

### About Page Must Include
- Who you are (1 short paragraph — real, not corporate)
- What you're building right now (the agency journey)
- Your tech stack (Next.js, Supabase, Tailwind, AI tools)
- A positioning statement: *"I help businesses build fast, modern websites
  that actually bring in clients — not just look good."*
- A clear CTA: Work with me OR Follow the journey (email signup)

### First Proof Asset (Build alongside first 5 posts)
**A project breakdown post** — pick one real project you've built, break it down:
- What the client needed
- What you built and why those tech choices
- What the results were
- What you'd do differently
This is more trust-building than any testimonial for a new blog.

---

## 8. Technical Edge Cases — Handle Before Launch

| Edge Case                    | Solution                                                     |
|------------------------------|--------------------------------------------------------------|
| Slug collision               | Enforce unique slugs via filename — Next.js throws build error |
| Draft preview                | `draft: true` in frontmatter → filter in `getAllPosts()` util |
| 404 page                     | Custom `not-found.tsx` with navigation back to `/blog`       |
| Empty category               | Show "No posts yet — check back soon" state in category page |
| No featured post             | Fall back to most recent post if no `featured: true` found   |
| No OG image                  | Fall back to `/public/og-default.png` automatically          |

---

## 9. Performance Reality Check

| Check                        | Action                                                        |
|------------------------------|---------------------------------------------------------------|
| Shiki build time             | Acceptable — runs at build time only, zero runtime impact     |
| MDX bundle size              | Use `next-mdx-remote` with `rsc: true` — Server Component only|
| Font loading (CLS = 0)       | `next/font` with `display: swap` + `preload: true`           |
| Image optimization           | All images via `next/image`, no raw `<img>` tags              |
| Third-party scripts          | Plausible script is async + deferred — no blocking            |

---

## 10. Launch Strategy — Locked

### Launch Conditions
- Minimum **5 posts live** before announcing (not 1, not 3 — 5)
- All 5 cover different categories (one each)
- About page complete
- Dark/light mode working
- Newsletter signup working (even if just email collection)
- OG images created for all 5 posts

### Launch Day Execution
```
9:00 AM  → Push to production, verify all 5 posts live
10:00 AM → Twitter thread about the launch (why you built it, what it covers)
11:00 AM → LinkedIn post (professional angle — "documenting my agency journey")
12:00 PM → Post in 2–3 relevant WhatsApp/Telegram dev groups
2:00 PM  → Submit to Dev.to, IndieHackers "What are you building?" thread
5:00 PM  → Reply to every comment, DM, and response personally
```

### Launch Day Goal
Not viral. Not 10,000 views.
**Goal: 50 real readers who subscribe to the email list.**
50 engaged subscribers > 5,000 one-time visitors.

---

## 11. The One Uncomfortable Truth

All of this is only as good as the habit you build next.

The blog will not fail because your SEO is weak.
The blog will not fail because your design isn't perfect.
The blog will not fail because you picked the wrong keywords.

**It will only fail if you stop writing.**

Post 1 gets 50 views. Post 10 gets 500. Post 30 gets 5,000.
The compounding only works if you show up every Tuesday.

That's the only system that can't be optimized or automated.

---

## Final Launch Readiness Checklist

### Must-Do Before VS Code
- [x] Niche + audience defined
- [x] Design scheme complete
- [x] Blog setup decisions locked
- [x] Pre-coding component decisions made
- [x] 20 keywords validated
- [x] First 5 posts mapped to keywords
- [x] Primary CTA decided (email list)
- [x] Analytics tool selected (Plausible)
- [x] 50-topic backlog ready
- [x] Distribution templates defined
- [x] Lead magnet concept defined (proposal template)
- [x] Launch plan locked (5 posts, Day 1)

### You Are Ready. Open VS Code.

---

*Growth-Critical Decisions v1.0 · March 2026*
