---
name: testing-patterns
description: Testing patterns for Next.js projects using Vitest, React Testing Library, and Playwright. Covers unit, integration, component, and E2E testing with concrete examples.
---

# Testing Patterns

> **When does this activate?**
> Use this when writing tests, reviewing coverage, or setting up testing infrastructure in a Next.js + TypeScript project.

---

## Stack

| Layer              | Tool                                       |
| ------------------ | ------------------------------------------ |
| Unit & integration | Vitest                                     |
| React components   | React Testing Library + Vitest             |
| API route testing  | Supertest or `fetch` against a test server |
| Mocking HTTP       | MSW (Mock Service Worker)                  |
| E2E                | Playwright                                 |

Use Vitest over Jest — faster, native TypeScript, compatible with Vite's module resolution.

---

## Testing Pyramid

- **Unit (most)** — pure functions, utilities, business logic, hooks in isolation
- **Integration (some)** — API routes, service functions with real DB (test Supabase project)
- **E2E (few)** — critical user flows: auth, checkout, core feature paths

---

## Unit Tests

```ts
// lib/format-price.test.ts
import { describe, it, expect } from "vitest";
import { formatPrice } from "./format-price";

describe("formatPrice", () => {
  it("formats cents to a currency string", () => {
    expect(formatPrice(4999)).toBe("$49.99");
  });

  it("handles zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("rounds correctly", () => {
    expect(formatPrice(100)).toBe("$1.00");
  });
});
```

---

## Component Tests

```tsx
// components/login-form.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LoginForm } from "./login-form";

describe("LoginForm", () => {
  it("shows validation error when email is empty", async () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });
  });

  it("calls onSubmit with credentials on valid input", async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "secret123",
      }),
    );
  });
});
```

---

## Mocking with MSW

```ts
// tests/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/posts", () => {
    return HttpResponse.json([
      { id: "1", title: "Test Post", content: "Hello world" },
    ]);
  }),
  http.post("/api/posts", () => {
    return HttpResponse.json({ id: "2", title: "New Post" }, { status: 201 });
  }),
];
```

---

## TDD Workflow

```
🔴 RED     → Write a failing test describing the behavior
🟢 GREEN   → Write the minimum code to make it pass
🔵 REFACTOR → Clean up without breaking the test
```

Never write production code without a failing test first. Never refactor without a passing test suite.

---

## E2E with Playwright

```ts
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("user can sign in and see dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("Welcome back")).toBeVisible();
});
```

---

## AAA Pattern

Every test: **Arrange → Act → Assert**. One assertion per test where possible — if a test fails, the name should tell you exactly what broke.

---

## What to Test and What to Skip

| Test This                               | Skip This                                        |
| --------------------------------------- | ------------------------------------------------ |
| Business logic and data transformations | Implementation details (internal function calls) |
| Auth flows and protected routes         | Third-party library internals                    |
| Form validation logic                   | CSS and visual styling                           |
| API error handling                      | Trivial getters/setters                          |
| Critical user journeys (E2E)            | Auto-generated code                              |

---

## Anti-Patterns

| ❌                              | ✅                                       |
| ------------------------------- | ---------------------------------------- |
| Testing implementation details  | Test observable behavior                 |
| Dependent tests (order matters) | Every test is fully isolated             |
| Skipping flaky tests            | Fix the race condition causing flakiness |
| `expect(true).toBe(true)`       | Meaningful assertions                    |
| Mocking the module under test   | Only mock external boundaries            |
