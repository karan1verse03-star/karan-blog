---
name: clean-code
description: Universal TypeScript code quality rules. Loaded by almost every agent as a baseline standard for naming, structure, and maintainability.
---

# Clean Code

> **When does this activate?**
> Always — this is the baseline skill loaded across all agents. Every file written or reviewed in this project follows these rules.

---

## Naming

- **Variables and functions** — verb phrases for functions, noun phrases for values: `getUserById`, `isLoading`, `hasPermission`, `formattedDate`
- **Booleans** — always `is`, `has`, `can`, `should`: `isAuthenticated`, `hasAccess`, `canEdit`
- **Event handlers** — prefix with `handle`: `handleSubmit`, `handleClose`, `handlePageChange`
- **Types and interfaces** — PascalCase nouns, no `I` prefix: `UserProfile`, `ApiResponse`, `CartItem`
- **Constants** — SCREAMING_SNAKE_CASE for true constants: `MAX_RETRIES`, `DEFAULT_PAGE_SIZE`
- **Files** — kebab-case for everything: `user-profile.tsx`, `auth-service.ts`, `use-cart.ts`

---

## Functions

- **Single responsibility** — if you can't describe what a function does in one sentence without "and", split it
- **Max 3 parameters** — beyond that, pass an object with named keys
- **Early returns** — handle error and edge cases first, keep the happy path at the bottom unindented
- **No side effects in pure functions** — a function that computes a value should never mutate external state
- **Named exports over default exports** — easier to refactor and search

```ts
// ❌ Hard to read — nested conditionals, multiple responsibilities
function processUser(user, options, callback) {
  if (user) {
    if (user.isActive) {
      if (options.notify) {
        callback(user);
      }
    }
  }
}

// ✅ Early returns, single responsibility, named params
async function notifyActiveUser({
  user,
  notify,
}: {
  user: User;
  notify: boolean;
}) {
  if (!user) return;
  if (!user.isActive) return;
  if (!notify) return;
  await sendNotification(user);
}
```

---

## TypeScript

- **No `any`** — use `unknown` for truly unknown types, then narrow with type guards
- **No type assertions (`as`)** unless you have no alternative and you add a comment explaining why
- **Prefer interfaces for object shapes, types for unions and aliases**
- **Explicit return types on exported functions** — helps catch bugs at the call site
- **Zod for runtime validation** — parse external data (API responses, form inputs) before trusting it

```ts
// ❌
const data = response.data as UserProfile;

// ✅
const result = UserProfileSchema.safeParse(response.data);
if (!result.success) throw new Error("Invalid user data");
const data = result.data;
```

---

## Structure

- **Co-locate by feature, not by type** — keep a component, its hook, its types, and its tests together
- **One export per file for components** — avoids ambiguous imports
- **Barrel files (`index.ts`) only for public APIs** — never inside a feature folder
- **Max file length: ~200 lines** — if longer, it has more than one responsibility
- **No dead code** — remove commented-out code before committing. Use git if you need it back.

---

## Before Editing Any File

Before changing a file, check:

- **What imports this file?** — those callers may need updates too
- **What does this file import?** — interface changes cascade down
- **What tests cover this?** — tests may need to change
- **Is this a shared component?** — changes affect every consumer

```
Editing: lib/auth.ts
→ Who imports this? app/api/auth/route.ts, middleware.ts, lib/supabase/server.ts
→ Do any of them need changes too? Check function signatures before editing.
```

**Rule:** Edit the file AND all dependent files in the same task. Never leave broken imports.

---

## Self-Check Before Completing

Before marking any task done:

- [ ] Did I do exactly what was asked — nothing more, nothing less?
- [ ] Did I modify all files that needed to change (including callers)?
- [ ] Does `npm run lint && npx tsc --noEmit` pass clean?
- [ ] Are there any edge cases I didn't handle?
- [ ] Is there any debug logging or temporary code left behind?

If any check fails — fix it before reporting complete.

---

## Comments

- **Comment why, not what** — the code says what; the comment explains why
- **No obvious comments**: `// increment counter` above `count++` is noise
- **JSDoc on all exported functions** — at minimum: what it does, what it throws
- **TODO comments must include a ticket or name**: `// TODO(karan): remove after migration`

---

## Error Handling

- **Never swallow errors silently** — at minimum, log them
- **Typed error handling** — use discriminated unions or custom error classes, not string matching
- **User-facing errors** — always generic. Internal errors — always specific in logs

```ts
// ❌
try {
  await savePost(data);
} catch (e) {}

// ✅
try {
  await savePost(data);
} catch (error) {
  console.error("[savePost] Failed:", error);
  throw new AppError("Failed to save post", { cause: error });
}
```

---

## Before Every Commit

- `npm run lint` passes with zero warnings
- `npx tsc --noEmit` passes clean
- No `console.log` left in production paths
- No commented-out code
- No `any` types introduced
