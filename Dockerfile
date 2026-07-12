# BraidFlow — production container image.
# Multi-stage build on the Next.js standalone output for a small, non-root image.
# syntax=docker/dockerfile:1

# --- deps: install production+build deps against the lockfile ------------------
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- build: compile the app ---------------------------------------------------
FROM node:26-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- run: minimal runtime from the standalone output --------------------------
FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Image provenance (queryable via `docker inspect`); ARGs are populated by the
# build system (e.g. `--build-arg GIT_SHA=$(git rev-parse HEAD)`).
ARG GIT_SHA=unknown
LABEL org.opencontainers.image.title="BraidFlow" \
      org.opencontainers.image.description="Booking + deposit platform for hair braiders" \
      org.opencontainers.image.source="https://github.com/elkamohammad1988/braidflow-saas" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.licenses="Proprietary"

# tini as PID 1: reaps zombies and forwards SIGTERM/SIGINT to Node so `docker stop`
# and orchestrator drains shut down gracefully instead of hanging until SIGKILL.
RUN apk add --no-cache tini

# Run as an unprivileged user.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# The standalone output bundles only the files needed to run the server.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# Container-native healthcheck hits the readiness probe.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+ (process.env.PORT||3000) +'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# tini reaps zombies and forwards signals to Node for graceful shutdown.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
