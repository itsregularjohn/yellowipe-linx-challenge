# Use Node.js 22.16
FROM node:22.16-alpine@sha256:41e4389f3d988d2ed55392df4db1420ad048ae53324a8e2b7c6d19508288107e AS base

# Install pnpm globally
RUN npm install -g pnpm@9.0.0

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY pnpm-workspace.yaml ./
COPY turbo.json ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./

# Build stage - build schemas and server
FROM base AS builder

# Copy schemas package
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/schemas/tsconfig.json ./packages/schemas/
COPY packages/schemas/src ./packages/schemas/src

# Copy server package
COPY apps/server/package.json ./apps/server/
COPY apps/server/tsconfig.json ./apps/server/
COPY apps/server/prisma ./apps/server/prisma
COPY apps/server/src ./apps/server/src

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build schemas first (required by server)
RUN pnpm run build --filter=@yellowipe-linx/schemas

# Generate Prisma client without engine (using Accelerate)
RUN cd apps/server && npx prisma generate --no-engine

# Build server with increased heap size
RUN pnpm run build --filter=@yellowipe-linx/server

# Production stage
FROM node:22.16-alpine@sha256:41e4389f3d988d2ed55392df4db1420ad048ae53324a8e2b7c6d19508288107e AS production

WORKDIR /app

# Copy only the bundled application
COPY --from=builder /app/apps/server/dist/index.js ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001
USER appuser

# Expose port
EXPOSE 4000

# Start the server
CMD ["node", "index.js"]