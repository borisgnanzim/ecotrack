# --- Étape 1: Builder ---
# Utilise une image Node.js complète pour installer les dépendances et construire le projet.
FROM node:22-bookworm AS builder

WORKDIR /app

# Prisma is much more reliable on a glibc base image than on Alpine.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copie uniquement les fichiers de dépendances et installe les dépendances de production.
# Cela permet de mettre en cache cette couche si les dépendances ne changent pas.
COPY package*.json ./
RUN npm ci --omit=dev
 
# Copie le reste des fichiers de l'application.
COPY . .

# Génère le client Prisma.
RUN npx prisma generate

# --- Étape 2: Production ---
# Utilise une image Node.js légère pour l'environnement de production.
FROM node:22-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copie les dépendances installées et le code source depuis l'étape de build.
COPY --from=builder /app .

EXPOSE 3015

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
