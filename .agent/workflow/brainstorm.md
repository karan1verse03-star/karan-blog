---
description: Structured idea exploration before committing to implementation. Generates options, compares trade-offs, and recommends a direction.
---

# /brainstorm

`/brainstorm [topic or problem]`

Exploration mode — no code, just clear thinking. Use this before `/create` or `/enhance` when the right approach isn't obvious.

---

## Steps

1. **Understand the goal**
   - What problem are we solving?
   - Who is the user?
   - What constraints exist? (time, existing stack, complexity)

2. **Generate options**
   - At least 3 distinct approaches
   - Include unconventional solutions — don't only present the obvious
   - Honest pros and cons for each

3. **Compare and recommend**
   - Summarize trade-offs in a table
   - Give a clear recommendation with reasoning
   - Defer the final decision to the user

---

## Output Format

```
## Brainstorm: [Topic]

### Context
[One sentence problem statement]

***

### Option A: [Name]
[Description]
Pros: [benefit 1], [benefit 2]
Cons: [drawback 1]
Effort: Low / Medium / High

### Option B: [Name]
...

### Option C: [Name]
...

***

### Recommendation
Option [X] — because [clear reasoning].

What direction do you want to go?
```

---

## Principles

- **No code** — this is about decisions, not implementation
- **Honest trade-offs** — don't hide the complexity of an option
- **Defer to the user** — present options clearly, let them choose

---

## Examples

```
/brainstorm authentication approach for multi-tenant SaaS
/brainstorm state management for complex form with steps
/brainstorm database schema for a social feed
/brainstorm caching strategy for API-heavy dashboard
```
