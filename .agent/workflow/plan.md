---
description: Creates a structured project plan using the project-planner agent. No code is written — only a plan file.
---

# /plan

`/plan [task description]`

Activates planning mode. Breaks any task into structured, executable steps before a single line of code is written.

---

## Rules

- **No code** — this command produces a plan file only
- **Uses `project-planner` agent** — not native plan mode
- **Asks clarifying questions** if the request is ambiguous before planning
- **Plan file is named after the task** — never `plan.md`

---

## Steps

1. **Understand the request** — if ambiguous, ask 1–2 focused questions first
2. **Invoke `project-planner`** with the task and any existing context
3. **Generate plan file** named `{task-slug}.md` in the project root
4. **Report back** with the file name and a summary of the task breakdown

---

## Plan File Naming

| Request                         | File                     |
| ------------------------------- | ------------------------ |
| `/plan add Stripe subscription` | `stripe-subscription.md` |
| `/plan build user dashboard`    | `user-dashboard.md`      |
| `/plan fix auth redirect bug`   | `auth-redirect-fix.md`   |

---

## Output

```
[OK] Plan created: ./stripe-subscription.md

What's inside:
- 6 tasks across 3 agents
- database-architect → schema + RLS
- backend-specialist → API routes
- frontend-specialist → UI components

Next: review the plan, then run /create to start building.
```

---

## Examples

```
/plan add Stripe subscription to SaaS
/plan build user profile page with avatar upload
/plan refactor auth system to use Supabase
```
