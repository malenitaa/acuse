# Acuse, self-contained. Build: docker compose build (or docker build -t acuse .)
# The final image runs the standalone Next server with the embedded retry
# worker — no external cron, no platform, just Node and a Postgres to talk to.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV EMBEDDED_WORKER=1
ENV PORT=3000

# Run as the unprivileged user the base image already ships.
USER node

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
