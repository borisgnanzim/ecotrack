# --- Étape 1: Builder ---
FROM node:22-alpine AS builder

# Prisma a besoin d'openssl pour détecter la version libssl sur Alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN npx prisma generate

# --- Étape 2: Production ---
FROM node:22-alpine

# Idem : nécessaire au runtime pour "prisma migrate deploy"
RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3011

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]