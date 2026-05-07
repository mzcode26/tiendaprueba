FROM node:20-alpine AS builder
WORKDIR /app

COPY apps/api/package.json ./package.json
COPY apps/api/tsconfig.json ./tsconfig.json
COPY apps/api/src ./src
COPY packages/ts-config ./packages/ts-config
COPY packages/shared-config ./packages/shared-config
COPY packages/shared-types ./packages/shared-types
COPY packages/api-client ./packages/api-client
COPY packages/shared-utils ./packages/shared-utils
COPY packages/eslint-config ./packages/eslint-config

RUN corepack pnpm install
RUN corepack pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
