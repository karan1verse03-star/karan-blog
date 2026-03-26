---
description: Generates tests, runs existing tests, or reviews coverage for a file or feature.
---

# /test

`/test [file path, feature name, or sub-command]`

Test mode — analyzes code, generates a test plan, writes tests, and runs them.

---

## Sub-commands

```
/test                        → run all tests
/test [file or feature]      → generate tests for a specific target
/test coverage               → show current coverage report
/test watch                  → run tests in watch mode
```

---

## Steps (for test generation)

1. **Analyze the code**
   - Identify all functions, hooks, or routes in scope
   - Map happy paths, error cases, and edge cases
   - Identify external dependencies to mock

2. **Present a test plan**
   - Show what will be tested before writing
   - Get confirmation for large test suites

3. **Write tests**
   - Follow the project's existing framework (Vitest preferred, Jest if already in use)
   - Use AAA pattern (Arrange → Act → Assert)
   - Mock at external boundaries only

4. **Run and confirm**
   - Run `npm test` and confirm all pass
   - Report coverage for the tested module

---

## Output Format

```
## Tests: [Target]

### Test Plan
| Test | Type | Covers |
|---|---|---|
| returns session on valid login | Unit | Happy path |
| throws on invalid password | Unit | Error case |
| rejects expired token | Unit | Edge case |

### Result
✅ auth.test.ts — 6 tests passed
Coverage: 94% (statements)
```

---

## Test Pattern

```ts
describe("loginUser", () => {
  it("returns session for valid credentials", async () => {
    // Arrange
    const input = { email: "user@test.com", password: "correct" };

    // Act
    const result = await loginUser(input);

    // Assert
    expect(result.session).toBeDefined();
  });

  it("throws AuthError for wrong password", async () => {
    const input = { email: "user@test.com", password: "wrong" };
    await expect(loginUser(input)).rejects.toThrow("Invalid credentials");
  });
});
```

---

## Examples

```
/test src/lib/auth.ts
/test user registration flow
/test coverage
/test fix failing tests
```
