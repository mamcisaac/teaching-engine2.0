# Multi-stage build for Curriculum Planner
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm db:generate
RUN pnpm db:deploy
RUN pnpm build
RUN pnpm prune --prod

FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && corepack prepare pnpm@10.11.1 --activate
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/packages/database/prisma ./packages/database/prisma
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server/node_modules ./server/node_modules
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter server exec prisma migrate deploy --schema=../packages/database/prisma/schema.prisma && node server/dist/index.js"]
