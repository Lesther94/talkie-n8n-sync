# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=build /app/dist ./dist
COPY server.mjs ./server.mjs
RUN npm i express cors
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node","server.mjs"]
```dockerfile
# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || bun install
COPY . .
RUN npm run build || bun run build


FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts || true
COPY --from=build /app/dist ./dist
COPY server.ts ./server.ts
RUN npm i express node-fetch cors
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node","--experimental-modules","server.ts"]
