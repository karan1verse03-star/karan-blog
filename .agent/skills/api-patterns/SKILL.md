---
name: api-patterns
description: REST Route Handler design, Supabase Auth + JWT patterns, consistent response formats, and tRPC for full-stack TypeScript — activate when building or reviewing any Next.js API route, Server Action, or data-fetching contract.
---

# API Patterns

> **When does this activate?**
> Any task involving Next.js Route Handlers (`app/api/**/route.ts`), Server Actions, tRPC routers, API response shapes, or authentication flow. This skill covers how we build the data contract between server and client.

## Stack position

- **Primary pattern:** Next.js App Router Route Handlers + Server Actions for the same-origin full-stack case  
- **Type-safe internal API:** tRPC when a clear client/server boundary exists but both sides are TypeScript  
- **Authentication:** Supabase Auth — JWTs are managed by Supabase; we validate them server-side via the Supabase client  
- **External/public API:** REST Route Handlers with the response format in `response.md`  

We do not build GraphQL APIs. We do not build versioned public APIs unless explicitly required.

## Sub-file map

| Sub-file | When to read |
|---|---|
| `rest.md` | Route Handler structure, HTTP method + status code decisions, resource naming |
| `auth.md` | Supabase Auth session validation, protecting Route Handlers and Server Actions, API key patterns |
| `response.md` | Response envelope, error shape, pagination format |
| `trpc.md` | Setting up tRPC in Next.js App Router, routers, procedures, protected procedures |

## Non-negotiable rules

- **Never trust client-supplied user IDs** — always derive the user from the server-side Supabase session  
- **Validate all inputs with Zod** before touching the database — in both Route Handlers and Server Actions  
- **Never expose internal error messages or stack traces** to the client  
- **Server Actions are public endpoints** — treat them identically to Route Handlers for auth and validation  
- **Always return the correct HTTP status code** — `200` for success, `201` for creation, `401` for missing auth, `403` for insufficient permission, `422` for validation errors  

## Anti-patterns

```
❌ Using GET for mutations (use POST/PUT/PATCH/DELETE)
❌ Verbs in REST URLs (/api/getUser — use GET /api/users/[id])
❌ Returning 200 for errors with an error body
❌ Leaking Supabase/Drizzle error messages directly to the client
❌ Skipping Zod validation because "the client already validates"
❌ Building a GraphQL layer — use tRPC or REST
❌ Python API validator scripts — we validate with TypeScript + Zod
```
