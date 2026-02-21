FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# -----------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

# -----------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3010
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL=/data/db.sqlite

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p /data && chown nextjs:nodejs /data

USER nextjs

EXPOSE 3010

ENTRYPOINT ["./docker-entrypoint.sh"]
