# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine

WORKDIR /app

# Copy output from builder
COPY --from=builder /app/.output ./.output
# We need better-sqlite3 native bindings in runtime. 
# Nitro bundles code, but native modules can be tricky.
# Simplest way for better-sqlite3 in docker is to reinstall production deps or copy node_modules.
# However, Nitro's .output usually bundles everything. 
# better-sqlite3 is an external dependency in Nitro by default (Node preset).
# Let's check package.json in output or just copy node_modules if needed.
# Actually, standard practice for Nitro + Native modules is to install them in runner.

COPY package.json ./
RUN npm install --production

ENV PORT=4000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", ".output/server/index.mjs"]
