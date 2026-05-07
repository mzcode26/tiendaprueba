FROM node:20-alpine AS builder
WORKDIR /app

COPY apps/admin-web/package.json ./package.json
COPY apps/admin-web/tsconfig.json ./tsconfig.json
COPY apps/admin-web/vite.config.ts ./vite.config.ts
COPY apps/admin-web/postcss.config.js ./postcss.config.js
COPY apps/admin-web/tailwind.config.ts ./tailwind.config.ts
COPY apps/admin-web/index.html ./index.html
COPY apps/admin-web/src ./src
COPY packages/ts-config ./packages/ts-config
COPY packages/shared-config ./packages/shared-config
COPY packages/shared-types ./packages/shared-types
COPY packages/api-client ./packages/api-client
COPY packages/shared-utils ./packages/shared-utils
COPY packages/eslint-config ./packages/eslint-config

RUN corepack pnpm install
RUN corepack pnpm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
