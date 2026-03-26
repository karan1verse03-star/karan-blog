---
name: plan-writing
description: How to think through and structure any development task before writing code — task breakdown, dependency mapping, brainstorming approaches, and defining verification criteria.
---

# Plan Writing

> **When does this activate?**
> Use this when planning any non-trivial task — a new feature, a refactor, a new project. Loaded with the project-planner agent and the /plan workflow.

---

## Why Plan Before Coding

A plan forces you to think through a task completely before getting trapped mid-implementation. A good plan answers:

1. What exactly are we building?
2. What order do things need to happen?
3. How do we know when it's done?

---

## Simplicity Rules

These are non-negotiable:

- **Max 10 tasks** — if you need more, split into multiple plans
- **One page max** — if the plan is longer than one page, it's too complex. Simplify.
- **No phases unless truly required** — phases add ceremony. Tasks in order are enough.
- **Plan files go in the PROJECT ROOT** — named `{task-slug}.md`. Never inside `.agent/`, `docs/`, or temp folders.

| Request                         | File Location              |
| ------------------------------- | -------------------------- |
| `/plan add Stripe subscription` | `./stripe-subscription.md` |
| `/plan build user dashboard`    | `./user-dashboard.md`      |
| `/plan fix auth redirect`       | `./auth-redirect-fix.md`   |

---

## Brainstorming First

Before writing a plan, explore the approach. For any non-trivial task, consider at least 3 options:

```
Building auth? Consider:
A. Supabase Auth (managed, fast) — best for most cases
B. Better-Auth (self-hosted, flexible) — when you need custom flows
C. NextAuth.js (ecosystem, many providers) — when OAuth variety matters

Pick one with reasoning. Don't implement before deciding.
```

**Questions to ask before deciding:**

- What does this need to integrate with?
- What's the maintenance cost of each option?
- What does the rest of the stack already use?
- What's the fastest path to something working?

---

## Task Breakdown Rules

- **One task = one deliverable** — a task is done when one specific thing exists that didn't before
- **2–10 minutes per task** — if longer, break it down further
- **Explicit dependencies** — if Task B needs Task A to be done first, say so. No implied order
- **Verification criteria** — every task has a concrete way to confirm it's complete

### Task Format

```md
### Task N: [Name]

- **Agent:** which specialist does this
- **Depends on:** Task N-1 (or "none")
- **Input:** what exists before this task
- **Output:** what exists after this task
- **Verify:** how to confirm it's done
```

---

## Dependency Mapping

```
Schema (Task 1)
    ↓
API Route (Task 2) ← depends on schema existing
    ↓
UI Component (Task 3) ← depends on API route working
    ↓
Tests (Task 4) ← depends on component existing
```

Parallelizable tasks (same level, no dependency on each other) can be worked on simultaneously.

---

## Verification Criteria

Every task must have a specific, observable check — not "it works":

| ❌ Vague        | ✅ Specific                                                            |
| --------------- | ---------------------------------------------------------------------- |
| "Auth works"    | "`POST /api/auth/login` returns a session token for valid credentials" |
| "UI looks good" | "Component renders without console errors, matches the design"         |
| "Tests pass"    | "`npm test` passes with 0 failures"                                    |
| "DB is set up"  | "Migration runs clean, `SELECT * FROM posts` returns rows"             |

---

## Plan File Structure

```md
# [Task Name]

## Overview

One paragraph: what we're building and why.

## Success Criteria

- [ ] Specific measurable outcome 1
- [ ] Specific measurable outcome 2

## Tech Stack

| Layer | Choice | Why |
| ----- | ------ | --- |

## Task Breakdown

[Tasks using the format above]

## Verification Checklist

- [ ] npm run build passes
- [ ] npm run lint passes
- [ ] Core flows tested manually
```

---

## Brainstorming Output Format

When exploring options:

```
## Brainstorm: [Topic]

Option A: [Name] — [one line description]
Pros: [key benefits]
Cons: [key drawbacks]
Effort: Low / Medium / High

Option B: ...

Recommendation: Option [X] because [one clear reason].
```
