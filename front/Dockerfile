# ---------- Stage 1: install & build ----------
# Installing inside the image (instead of copying a host node_modules/)
# guarantees platform-correct native binaries (esbuild, etc.) no matter
# what OS the project was built/committed from.
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: minimal runtime ----------
# The Angular/esbuild SSR bundle (dist/*/server/server.mjs) is fully
# self-contained (express + @angular/ssr are bundled in), so the runtime
# image only needs the Node runtime and the build output — no
# node_modules, no source, no build tools.
FROM node:22-alpine AS runtime
WORKDIR /app

RUN addgroup -S angular && adduser -S angular -G angular
COPY --from=build /app/dist/travel-agency ./dist/travel-agency
USER angular:angular

ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/travel-agency/server/server.mjs"]
