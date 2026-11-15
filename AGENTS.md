# Working in this repository

This file is the canon for people and coding agents alike. `CLAUDE.md` includes it. Stack-wide
rules (layers, services and data, components, pages, forms, i18n and RTL, e2e, mock API, git
workflow, coding style, secrets, quality gates) live in `.claude/rules/` and load automatically
in Claude Code; any other tool can read them as plain Markdown. This file holds only what is
specific to this repository.

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

The layers are kept separate on purpose: they are the same seven libraries as in the companion monorepo template, so a project that outgrows one app can lift `src/shared/*` into workspace libraries without rewriting imports. There is no Nx here, so the project-reference sync step in the layer rule does not apply.

## Specific to this repository

- **Endpoints live in `src/shared/services/shared/endpoints.ts`**, grouped by domain; backend shapes stop in `backend-adapter.ts`.
- **Errors go through `captureError` (`@utils`)** and reach the user through toasts or inline error states.
- **Route-level `loading.tsx` and `error.tsx` exist under `src/app/[locale]`.** A new fetching route inherits them unless it needs its own.
- **Strings go through `t()`** (next-intl, `messages/*.json`). No hard-coded user-facing text.
- **Environment through `src/env.ts`** (validated with `createEnv`).
- **No vendor lock-in in the base**: error tracking is an interface (`setErrorReporter`), analytics and maps are left to the project.
- **Sessions are httpOnly cookies managed by the BFF routes** (`createAuthServer`). Client code never sees a token.
- **Protected pages are listed in `PROTECTED_PATHS`** (`src/lib/auth/config.ts`); `src/proxy.ts` reads that list.

## Commands

```bash
npm run dev            # mock API + the app
npm run check          # Claude config check + lint + typecheck + unit tests + word gate + format check (run before committing)
npm run e2e            # Playwright smoke tests
npm run generate:domain -- <name>   # scaffold a domain
npm run example:remove              # drop the reference domain
```

## Adding things

- **A domain**: `npm run generate:domain -- <name>`, then fill the DTO fields, the model getters and the list page. Read the `example` domain for the finished shape. `/add-domain` walks the same steps.
- **A locale**: add the code to `src/i18n/locales.ts` and a `messages/<code>.json`. Direction is derived from the language.
- **An auth strategy**: add a DTO schema, then a route under `src/app/api/auth/<strategy>/route.ts` that exports `authServer.credentialHandler({ schema, path })`. See `docs/auth.md`.
- **A UI primitive**: `npx shadcn@latest add <name>` (`components.json` points it at `src/shared/components/ui`), then export it from `src/shared/components/ui/index.ts`.
- **A protected page**: add its path to `PROTECTED_PATHS` in `src/lib/auth/config.ts`.

## Commits

`.claude/rules/general/git-workflow.md` is the rule; `/check`, `/checkpoint`, `/publish` and `/sync` apply it. The default branch is the working branch of this template; projects made from it decide their own branching.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
