# --- Étape 1: Builder ---
FROM node:22-bookworm AS builder

# Prisma is much more reliable on a glibc base image than on Alpine.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN npx prisma generate

# --- Étape 2: Production ---
FROM node:22-bookworm

# Required for Prisma runtime and database engine compatibility.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3011

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]