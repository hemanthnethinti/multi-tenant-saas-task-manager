FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (ci requires lockfile; install is safer in CI-less builds)
RUN npm install --omit=dev

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application with database initialization
CMD ["sh", "-c", "node src/database/init.js || true && node src/server.js"]
