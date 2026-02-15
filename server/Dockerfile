# ================================
# Stage 1: Dependencies
# ================================
FROM oven/bun:1 AS deps

WORKDIR /app

# Copy only package files first (layer caching)
COPY package.json bun.lock ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

# Trim workspaces to only include shared and server
RUN cat package.json | bun -e "const pkg = await Bun.stdin.json(); pkg.workspaces.packages = ['shared', 'server']; console.log(JSON.stringify(pkg, null, 2));" > package.json.tmp && mv package.json.tmp package.json

# Install dependencies
RUN bun install --ignore-scripts

# ================================
# Stage 2: Runner (slim production image)
# ================================
FROM oven/bun:1-slim AS runner

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules

# Copy source files (only what's needed)
COPY package.json bun.lock ./
COPY shared ./shared
COPY server/package.json server/tsconfig.json ./server/
COPY server/src ./server/src

ENV NODE_ENV=production

WORKDIR /app/server

EXPOSE 8080

# Default: run main API server
# Override with: bun src/workers.ts or bun src/cron.ts
CMD ["bun", "start"]
