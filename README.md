# Frontend Next.js Template

A production-ready foundation for a single Next.js app: App Router, localisation with right-to-left support, theming, authentication through a backend-for-frontend with httpOnly cookies, a backend-agnostic services layer, shadcn/ui primitives and a domain generator. No business domain is included; the `example` domain exists only to prove every layer and is removed with one command.

It is the single-app sibling of the [Frontend Monorepo Template](https://github.com/amirmohammad-mohamadi/frontend-monorepo-template): the same layers and conventions, folded into one codebase. Start here when one app is enough; move to the monorepo when a second app (an admin panel, a second brand) appears.

## Quick start

```bash
npm install
cp .env.example .env        # defaults already point at the mock API
npm run dev                 # mock API :4000, app :3000
```

Sign in with `user@example.com` / `password`.

Individual servers: `npm run mock-api`, `npm run dev:app`.

## What is inside

```
src/
  app/              routes: [locale]/… pages, api/auth/* and api/backend/* BFF routes, error and not-found boundaries
  components/       app shell: header, footer, locale switcher, user menu, providers
  features/         one folder per feature: a hook for state and data, a component for rendering
  i18n/             locales, routing, request config (next-intl; en + fa, direction derived from the language)
  lib/              auth config and server, api transport setup, observability hook-up
  env.ts            every environment variable, validated once
  proxy.ts          Next.js middleware: locale negotiation + the auth guard
  shared/           the reusable layers, imported through aliases
    components/     shadcn/ui primitives (38) + the shared Tailwind theme        @components
    services/       apiClient, backend adapter, query hooks, BFF auth server factory, domain api/hooks   @services
    dtos/           Zod schemas and inferred types (request/response contracts)  @dtos
    models/         thin domain classes over API records                          @models
    enums/          shared const enums                                            @enums
    utils/          pure helpers: cn, formatting, URL, text direction, env validation, error reporting   @utils
    assets/         placeholder logo                                              @assets
messages/           en.json, fa.json
tools/
  mock-api/         dependency-free mock backend
  scripts/          domain generator, example removal, check-words gate, dev runner
  generators/       the generator's templates
e2e/                Playwright smoke tests
docs/               architecture, auth, backend adapter, environment, generator
```

## Daily commands

| Command                                           | What it does                                           |
| ------------------------------------------------- | ------------------------------------------------------ |
| `npm run dev`                                     | mock API and the app together                          |
| `npm run check`                                   | lint, typecheck, unit tests, word gate, format check   |
| `npm run lint` / `npm run typecheck` / `npm test` | the individual gates                                   |
| `npm run e2e`                                     | Playwright smoke tests (starts the servers itself)     |
| `npm run build`                                   | production build (standalone output)                   |
| `npm run generate:domain -- product`              | scaffold a domain across every layer, with a list page |
| `npm run example:remove`                          | delete the reference domain                            |

## Starting a project from this repository

1. Create the repository from this template and clone it.
2. Replace the placeholder logo in `src/shared/assets` and `public/favicon.svg`; set `common.appName` in `messages/*.json`.
3. Set the backend URLs in `.env` and, if the backend's paths differ, the auth paths in `src/lib/auth/config.ts`.
4. If the backend's response shapes differ from the defaults, override the adapter once: see `docs/backend-adapter.md`.
5. Run `npm run generate:domain -- <name>` for the first real domain, then `npm run example:remove`.
6. Optionally plug an error-tracking vendor into `src/lib/observability.ts`.

Everything else works out of the box.

## Conventions

The rules agents and people follow in this repository are in [AGENTS.md](AGENTS.md). The short version: HTTP only in `src/shared/services/**/*.api.ts`, data only through hooks, UI from `@components`, strings through `t()`, logical CSS properties everywhere, Zod at every boundary.

## Licence

MIT. See [LICENSE](LICENSE).
