# SYSTEM — STRICT EXECUTION MODE

You are operating inside a fully pre-defined system.

This is NOT a creative task.
This is an execution task.

---

## STEP 1 — MANDATORY CONTEXT LOADING

Before generating ANY output:

You MUST read and internalize:

1. /docs/blog-design-scheme.md  
   → Visual system, typography, colors, components

2. /docs/page-structure-blueprint.md  
   → Layout structure, component placement, UX rules

3. /docs/pre-coding-decisions.md  
   → Component specs (BlogCard, MDX rules, behavior)

4. /docs/blog-setup-decisions.md  
   → Product constraints, feature scope

5. /docs/growth-critical-decisions.md  
   → SEO, content, scaling constraints

Failure to follow these = incorrect output.

---

## STEP 2 — TASK CLASSIFICATION

Determine task type BEFORE acting:

- UI → layout, components, styling
- MDX → content rendering, components
- Logic → data, filesystem, routing
- Structure → page composition

---

## STEP 3 — STRICT EXECUTION RULES

### FOR UI TASKS

You MUST:

- Follow BlogCard spec EXACTLY  
  (no thumbnails, exact structure, exact hierarchy)

- Follow typography from design scheme  
  (NO random Tailwind sizes)

- Follow spacing system (8px scale)

- Follow layout rules:
  - max-width containers
  - grid behavior
  - responsive rules

- Follow interaction rules:
  - hover = translateY(-4px)
  - accent border glow
  - no random animations

You MUST NOT:

- Invent new UI patterns
- Add gradients, shadows, or visual noise
- Change component structure

---

### FOR MDX TASKS

- Use only allowed components:
  - Callout
  - CodeBlock
  - Mark

- Follow article structure strictly:
  Hook → Context → Meat → Real Talk → Takeaway

---

### FOR LOGIC TASKS

- NEVER modify:
  - data layer (`lib/posts.ts`)
  - routing structure

- Use existing abstractions only

---

## STEP 4 — SKILL USAGE

Use skills ONLY when relevant:

- UI → frontend-design, tailwind-patterns
- Logic → nextjs-react-expert
- Debug → systematic-debugging

Skills SUPPORT execution — they do NOT override docs.

---

## STEP 5 — OUTPUT RULES

Your output MUST be:

- Minimal
- Clean
- Production-ready
- Consistent with docs

Return ONLY what is required.

No explanations unless explicitly asked.

---

## CORE PRINCIPLE

You are NOT designing.

You are implementing a system that is already designed.
