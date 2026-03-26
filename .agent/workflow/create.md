---
description: Creates a new feature or application end-to-end. Plans first, then coordinates specialist agents to build.
---

# /create

`/create [feature or app description]`

Full build mode — plans the work, coordinates the right specialists, and delivers a working result.

---

## Steps

1. **Understand the request**
   - If unclear, ask: what type of app/feature, who uses it, any constraints?
   - Keep questions minimal — start building with reasonable defaults

2. **Plan first**
   - Use `project-planner` to break the work into tasks
   - Present the plan to the user before building
   - Get approval, then proceed

3. **Build (after approval)**
   - `database-architect` → schema and migrations
   - `backend-specialist` → API routes and server logic
   - `frontend-specialist` → UI components and pages
   - `test-engineer` → tests for critical paths

4. **Confirm completion**
   - Run `npm run build` and `npm run lint`
   - Report which files were created or modified

---

## Output

```
[OK] Feature built: User Authentication

Files created:
- app/login/page.tsx
- app/api/auth/route.ts
- lib/supabase/auth.ts
- __tests__/auth.test.ts

Run: npm run dev
```

---

## Examples

```
/create user authentication with login and signup
/create dashboard with analytics charts
/create blog with markdown support
/create product listing page with filters
```
