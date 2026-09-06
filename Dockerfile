# Stage 1: Builder
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Upgrade OS packages to remediate libgcrypt20, gnupg2, and ncurses vulnerabilities
RUN apt-get update && apt-get upgrade -y --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy package configuration files and install all dependencies (needed for compiling)
COPY package*.json ./
RUN npm ci

# Copy application source code and build
COPY . .
RUN npm run build

# Stage 2: Secure Production Runner
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Upgrade OS packages to remediate libgcrypt20, gnupg2, and ncurses vulnerabilities
RUN apt-get update && apt-get upgrade -y --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy package configuration files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled production bundles and static assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/zips ./zips

# Remove unused global package managers to eliminate base-image scanner false alarms
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /opt/yarn*

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]

