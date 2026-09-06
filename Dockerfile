FROM node:22-bookworm-slim

# Upgrade OS packages to remediate libgcrypt20, gnupg2, and ncurses vulnerabilities
RUN apt-get update && apt-get upgrade -y --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Upgrade npm global toolchain to prevent base-image npm/tar legacy vulnerabilities
RUN npm install -g npm@latest

WORKDIR /app

# Copy package configuration files
COPY package*.json ./

# Install all dependencies (needed for building Vite & esbuild)
RUN npm ci

# Copy application source code and resources
COPY . .

# Build client-side assets and bundle the server
RUN npm run build

# Prune development dependencies to keep the final image lightweight
RUN npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]

