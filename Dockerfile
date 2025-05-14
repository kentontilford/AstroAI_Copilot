# Stage 1: Dependencies
FROM node:18-alpine AS deps

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./

# Use npm install instead of npm ci for better compatibility
RUN npm install

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Install only production dependencies
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
RUN npm install --production --ignore-scripts

# Create a script to run migrations and start the application
RUN echo '#!/bin/sh\n\
echo "Running database migrations..."\n\
npx prisma migrate deploy\n\
echo "Starting application..."\n\
exec node server.js\n\
' > /app/start.sh && chmod +x /app/start.sh

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Set the environment variable for the port
ENV PORT 3000

# Set the host to listen on all interfaces
ENV HOSTNAME "0.0.0.0"

# Command to run the application
CMD ["/app/start.sh"]