# Environment

Every variable is read in one place, `src/env.ts`, through `createEnv` from `@utils`, which validates with Zod at module load and throws a readable list of problems if something is wrong. Every variable has a development default, so a fresh clone runs without a `.env`.

| Variable                     | Purpose                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`   | backend origin the browser calls for public endpoints (inlined at build)            |
| `INTERNAL_API_BASE_URL`      | backend origin the server calls (BFF routes, SSR)                                   |
| `API_PROXY_PREFIXES`         | comma-separated backend path prefixes the BFF proxy forwards with the session token |
| `AUTH_COOKIE_SECURE`         | force the `Secure` cookie flag; default: on in production builds                    |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | must be one of the locales in `src/i18n/locales.ts`                                 |
| `NEXT_PUBLIC_SITE_URL`       | public origin for canonical links and the sitemap                                   |

Rules:

- `NEXT_PUBLIC_*` ships to the browser and is inlined at build time. Never a secret, and changing it needs a rebuild.
- Server-only values never get the `NEXT_PUBLIC_` prefix.
- Reference `process.env.NAME` literally in `env.ts` so Next.js can inline the public ones; never build the name dynamically.
- `API_PROXY_PREFIXES` is the allow-list of the BFF proxy. A path outside it answers 404 before reaching the backend, so the proxy can never be turned into an open relay.
