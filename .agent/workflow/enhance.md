---
description: Adds or improves features in an existing application. Plans changes, gets approval for major work, then executes.
---

# /enhance

`/enhance [what to add or improve]`

Improvement mode — understands the current state of the project, plans the change, then applies it cleanly.

---

## Steps

1. **Understand current state**
   - Read relevant existing files
   - Identify the tech stack and conventions already in use

2. **Plan the change**
   - What files will be created or modified?
   - Which agents are needed?
   - Are there any conflicts with existing code?

3. **Present plan for major changes**

   ```
   To add dark mode:
   - Create: lib/theme.ts
   - Modify: 4 existing components
   - Add: CSS variables to globals.css

   Should I proceed?
   ```

   For small changes — just do it.

4. **Apply**
   - Coordinate the right specialist agents
   - Run `npm run lint && npx tsc --noEmit` after changes
   - Report what changed

---

## Rules

- Always warn if the request conflicts with the existing stack (e.g., "add Firebase" when Supabase is already in use)
- Get approval before major changes (10+ files or architecture changes)
- Small improvements (1–3 files) — proceed directly

---

## Examples

```
/enhance add dark mode
/enhance make the dashboard responsive
/enhance add loading skeletons to the feed
/enhance integrate Stripe to the checkout page
/enhance improve the login form error handling
```
