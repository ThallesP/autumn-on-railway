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

# Build with placeholders that get replaced at runtime
ENV VITE_BACKEND_URL=__VITE_BACKEND_URL_PLACEHOLDER__
ENV VITE_FRONTEND_URL=__VITE_FRONTEND_URL_PLACEHOLDER__
ENV NODE_ENV=production

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

# Copy entrypoint script
COPY vite/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
