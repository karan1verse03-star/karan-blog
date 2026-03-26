---
description: Activates systematic debug mode for investigating errors, crashes, and unexpected behavior.
---

# /debug

`/debug [issue description]`

Activates structured investigation mode. Don't guess — follow the evidence to the root cause.

---

## Steps

1. **Gather context**
   - What is the exact error message?
   - What are the reproduction steps?
   - What's the expected vs actual behavior?
   - What changed recently?

2. **Form hypotheses**
   - List 2–3 possible causes ordered by likelihood
   - Don't test randomly — eliminate systematically

3. **Investigate**
   - Test each hypothesis against logs, data flow, and stack traces
   - Use binary search if unsure which layer is responsible

4. **Fix and prevent**
   - Fix the root cause, not the symptom
   - Add a regression test
   - Explain why it happened

---

## Output Format

```
## Debug: [Issue]

### Symptom
[What's happening vs what should happen]

### Hypotheses
1. [Most likely cause]
2. [Second possibility]
3. [Less likely]

### Investigation
Hypothesis 1: [what I checked] → [result]
Hypothesis 2: [what I checked] → [result]

### Root Cause
[One sentence explanation of why this happened]

### Fix
[Before / After code block]

### Prevention
[Regression test added / validation improved / etc.]
```

---

## Examples

```
/debug login not working
/debug API returns 500 on POST
/debug form doesn't submit
/debug Supabase query returning empty
```
