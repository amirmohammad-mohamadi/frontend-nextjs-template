# Builds the app into a small standalone image.
#   docker build -t app .
#   docker run -p 3000:3000 --env-file .env app
#
# With `output: "standalone"` the server lands at .next/standalone/server.js next
# to a pruned node_modules; static chunks and the public folder are copied beside it.
ARG NODE_IMAGE=node:24-bookworm-slim

FROM ${NODE_IMAGE} AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM ${NODE_IMAGE} AS build
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined here; pass them as --build-arg or mount a .env.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx next build

FROM ${NODE_IMAGE} AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN groupadd --system app && useradd --system --gid app app
COPY --from=build --chown=app:app /repo/.next/standalone ./
COPY --from=build --chown=app:app /repo/.next/static ./.next/static
COPY --from=build --chown=app:app /repo/public ./public
USER app
EXPOSE 3000
CMD ["node", "server.js"]
