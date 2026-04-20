# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @property-booking/payment build
ENV NODE_ENV=production
RUN pnpm prune --prod

FROM node:20-bookworm-slim AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
RUN addgroup -g 1001 -S app && adduser -S app -u 1001 -G app
COPY --from=builder /app /app
RUN chown -R app:app /app
USER app
WORKDIR /app/services/payment
CMD ["sh", "-c", "pnpm db:migrate && pnpm db:seed && node dist/main.js"]
