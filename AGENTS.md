# Working in this repository

This file is the canon for people and coding agents alike. `CLAUDE.md` includes it.

## Shape

One Next.js app. App code lives directly under `src/`; the reusable layers live under `src/shared/` and are imported through aliases. Data flows in one direction and never skips a layer:

```
backend → src/shared/services (apiClient → <domain>.api.ts → <domain>.hooks.ts) → src/features/<feature>/*.hook.ts → presentational component
```

| Folder                                         | Alias              | May import                        |
| ---------------------------------------------- | ------------------ | --------------------------------- |
| `src/app`, `src/components`, `src/features`, … | `@/*`              | every layer                       |
| `src/shared/services`                          | `@services`        | dtos, models, utils, enums        |
| `src/shared/components`                        | `@components`      | utils (and type-only dtos/models) |
| `src/shared/dtos`                              | `@dtos`            | enums                             |
| `src/shared/models`                            | `@models`          | enums                             |
| `src/shared/utils`, `src/shared/enums`         | `@utils`, `@enums` | nothing                           |
| `src/shared/assets`                            | `@assets`          | nothing                           |

ESLint enforces these edges (`no-restricted-imports` blocks in `eslint.config.mjs`): shared layers never import app code (`@/*`), and every layer is imported from its root alias, never a deep path. The one sanctioned deep import is `@services/auth/server`, which holds server-only code and must stay out of the `@services` barrel.

The layers are kept separate on purpose: they are the same seven libraries as in the companion monorepo template, so a project that outgrows one app can lift `src/shared/*` into workspace libraries without rewriting imports.

## Rules

- **HTTP only in `*.api.ts`.** Pages and components never call `fetch` or `apiClient`; they call hooks from `@services`.
- **Endpoints live in `src/shared/services/shared/endpoints.ts`**, grouped by domain.
- **Backend shapes live in the adapter** (`backend-adapter.ts`). Everything above it sees frontend shapes only.
- **Zod at every boundary**: form submit and request bodies validate with a `@dtos` schema; types are inferred, never hand-written twice.
- **Named exports, `type` over `interface`, JSDoc on every exported function.**
- **No `console.*` in shipped code**; report through `captureError` (`@utils`) and show failures through toasts or inline error states.
- **Every page that fetches renders loading, error and empty states.** Route-level `loading.tsx` and `error.tsx` exist under `src/app/[locale]`.
- **Strings go through `t()`** (next-intl, `messages/*.json`). No hard-coded user-facing text.
- **Logical CSS only** (`ms-*`, `pe-*`, `start-*`, `text-end`), so right-to-left works without overrides.
- **Environment through `src/env.ts`** (validated with `createEnv`); never scattered `process.env` reads. `NEXT_PUBLIC_*` only for truly public values.
- **No vendor lock-in in the base**: error tracking is an interface (`setErrorReporter`), analytics and maps are left to the project.
- **Sessions are httpOnly cookies managed by the BFF routes** (`createAuthServer`). Client code never sees a token.

## Commands

```bash
npm run dev            # mock API + the app
npm run check          # lint + typecheck + unit tests + word gate + format check (run before committing)
npm run e2e            # Playwright smoke tests
npm run generate:domain -- <name>   # scaffold a domain
npm run example:remove              # drop the reference domain
```

## Adding things

- **A domain**: `npm run generate:domain -- <name>`, then fill the DTO fields, the model getters and the list page. Read the `example` domain for the finished shape.
- **A locale**: add the code to `src/i18n/locales.ts` and a `messages/<code>.json`. Direction is derived from the language.
- **An auth strategy**: add a DTO schema, then a route under `src/app/api/auth/<strategy>/route.ts` that exports `authServer.credentialHandler({ schema, path })`. See `docs/auth.md`.
- **A UI primitive**: `npx shadcn@latest add <name>` (`components.json` points it at `src/shared/components/ui`), then export it from `src/shared/components/ui/index.ts`.
- **A protected page**: add its path to `PROTECTED_PATHS` in `src/lib/auth/config.ts`.

## Commits

One-line imperative messages. No attribution trailers, no generated-with lines. Run `npm run check` first.
