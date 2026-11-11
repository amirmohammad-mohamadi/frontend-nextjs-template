# Architecture

## Layers

```
backend API
   │  HTTP (fetch)
src/shared/services/shared/api-client.ts         transport + deadlines + error normalisation
src/shared/services/shared/backend-adapter.ts    the ONLY place that knows the backend's response shapes
src/shared/services/<domain>/<domain>.api.ts     typed calls, one per endpoint
src/shared/services/<domain>/<domain>.hooks.ts   TanStack Query hooks, models as `select`
src/features/<feature>/*.hook.ts                 URL state, composition, side effects
src/features/<feature>/*.tsx                     rendering only
```

`src/shared/dtos` holds the request and response contracts as Zod schemas. `src/shared/models` wraps response records in small classes with getters, so UI code reads `item.getTitle()` and never a raw field name. When the backend renames a field, the DTO and the model change; pages do not.

## Why `src/shared` keeps separate layers in a single app

The seven folders under `src/shared` are the libraries of the companion monorepo template, folded into one codebase. Each has its own alias (`@services`, `@components`, …) and ESLint keeps the dependency direction between them (see AGENTS.md). Two things follow: a domain generated here looks exactly like one generated there, and the day a second app appears, the folders move to workspace libraries and the imports stay as they are.

## The app

Routes live under `src/app/[locale]/`; `src/proxy.ts` (Next.js middleware) handles locale negotiation and the auth guard for `PROTECTED_PATHS`. The BFF routes under `src/app/api/auth/*` and `src/app/api/backend/[...path]` are one-line re-exports of the handlers `createAuthServer` builds in `src/lib/auth/server.ts`. The client-side session is the `useCurrentUser` query.

## Where state lives

- Server data: TanStack Query, through `@services` hooks only.
- Session: the `auth.me` query. Sign-in and sign-out mutations write into it. A 401 from any call dispatches `api:unauthorized`, which `AuthEventHandler` turns into a signed-out state.
- UI state that must survive navigation: URL search params (see `src/features/examples/examples-list.hook.ts`).
- Ephemeral client state: React state, or a Zustand store if it is shared by distant components (none ship by default; add under `src/stores/`).

## Caching

The browser never uses its HTTP cache for API calls (`cache: "no-store"`); TanStack Query owns client caching with a 5-minute `staleTime`. Server renders get `gcTime: Infinity` so no timers outlive a request. Every BFF answer carries `Cache-Control: no-store, private` and `Vary: Cookie`.

## Error policy

`ApiClientError` carries `statusCode`, field `errors`, the backend `code` and a 429's `retryAfter`. Queries retry only network failures and throw 5xx to the nearest error boundary; 4xx are handled where the data is used. Mutations never retry (a timed-out write may have been applied) and show one toast unless the caller suppresses it.
