# Multi-stage build for Curriculum Planner
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm exec playwright install --with-deps
RUN pnpm run build
# Remove development dependencies to keep the runtime image small
RUN pnpm prune --prod

FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server/node_modules ./server/node_modules
EXPOSE 3000
CMD ["sh", "-c", "pnpm exec prisma migrate deploy --schema=./prisma/schema.prisma && node server/dist/index.js"]
