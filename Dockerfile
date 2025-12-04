# Build stage
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and update to latest versions
# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Set dummy DATABASE_URL for build (actual URL provided at runtime)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create entrypoint script for automatic migrations
RUN echo '#!/bin/sh' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Run Prisma migration for Analytics & SEO fields' >> /app/docker-entrypoint.sh && \
    echo 'echo "Syncing database schema..."' >> /app/docker-entrypoint.sh && \
    echo 'npx prisma db push --skip-generate --accept-data-loss' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Start the application' >> /app/docker-entrypoint.sh && \
    echo 'echo "Starting application..."' >> /app/docker-entrypoint.sh && \
    echo 'exec node server.js' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
