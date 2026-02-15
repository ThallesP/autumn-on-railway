# ================================
# Stage 1: Dependencies
# ================================
FROM oven/bun:1 AS deps

WORKDIR /app

# Copy only package files first (layer caching)
COPY package.json bun.lock ./
COPY shared/package.json ./shared/
COPY vite/package.json ./vite/

# Trim workspaces to only include shared and vite
RUN cat package.json | bun -e "const pkg = await Bun.stdin.json(); pkg.workspaces.packages = ['shared', 'vite']; console.log(JSON.stringify(pkg, null, 2));" > package.json.tmp && mv package.json.tmp package.json

# Install dependencies (cached unless package.json changes)
# --ignore-scripts skips native compilation (better-sqlite3 etc) which isn't needed for frontend build
RUN bun install --ignore-scripts

# ================================
# Stage 2: Builder
# ================================
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=deps /app/vite/node_modules ./vite/node_modules

# Copy source files
COPY package.json bun.lock ./
COPY shared ./shared
COPY vite ./vite

# Trim workspaces (same as deps stage)
RUN cat package.json | bun -e "const pkg = await Bun.stdin.json(); pkg.workspaces.packages = ['shared', 'vite']; console.log(JSON.stringify(pkg, null, 2));" > package.json.tmp && mv package.json.tmp package.json

# Build args (Railway passes these during docker build)
ARG VITE_BACKEND_URL
ARG VITE_FRONTEND_URL
ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}

WORKDIR /app/vite

# Build the app
RUN bun run build:bun

# ================================
# Stage 3: Production (Caddy)
# ================================
FROM caddy:2-alpine AS production

# Copy built assets
COPY --from=builder /app/vite/dist /srv

# Copy Caddyfile for SPA routing
COPY vite/Caddyfile /etc/caddy/Caddyfile

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
