# syntax=docker/dockerfile:1
#
# Csupor Craft Beer — production image.
#
# Conforms to CEF standards/operations/docker.md:
#   ODK-01 multi-stage        ODK-02 minimal pinned base    ODK-03 non-root
#   ODK-04 .dockerignore      ODK-05 healthcheck            ODK-06 PORT=3000
#   ODK-07 runtime env only   ODK-14 reproducible build     ODK-16 stdout logs
#
# Note: the CEF generator emits a port-80 variant aimed at a Traefik-fronted
# host. This project was specified to listen on 3000, which is also the
# operations standard's default, so that variant is deliberately replaced.

# pnpm comes from npm at a pinned version rather than via corepack: the
# corepack bundled with this base image fails signature verification when it
# has to resolve a version, and disabling that check would be a worse trade.
FROM node:22.12.0-alpine AS base
RUN npm install --global --no-fund --no-audit pnpm@10.15.0

# --- deps: install with a frozen lockfile so the build is reproducible -------
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- builder: compile the standalone server ----------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Pages that read the beer store are prerendered against the seed list; the
# volume takes over at runtime and revalidatePath refreshes them after an edit.
RUN pnpm build

# --- runner: minimal, non-root ------------------------------------------------
FROM node:22.12.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/data

# wget is used by the healthcheck; it ships with busybox in alpine.
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 --ingroup nodejs nextjs \
 && mkdir -p /data \
 && chown -R nextjs:nodejs /data

# The standalone output already contains a pruned node_modules.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Hits a real route, so the check fails if the app is up but not serving.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
