# Multi-stage Docker build for production optimization
FROM node:22-alpine AS base

# Install security updates and dumb-init for proper signal handling
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    npm install -g npm@latest

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
ENV NODE_ENV=development
RUN npm ci --include=dev
COPY . .
EXPOSE 3000
CMD ["dumb-init", "npm", "run", "dev"]

# Production dependencies stage
FROM base AS dependencies
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:22-alpine AS production

# Install security updates and dumb-init
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Set working directory
WORKDIR /usr/src/app

# Copy production dependencies
COPY --from=dependencies --chown=nodeuser:nodejs /usr/src/app/node_modules ./node_modules

# Copy application code
COPY --chown=nodeuser:nodejs . .

# Remove development files
RUN rm -rf src/tests && \
    rm -rf .env.example && \
    rm -rf *.md

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nodeuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["dumb-init", "node", "src/app.js"]
