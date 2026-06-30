# --- Étape 1: Builder ---
# Utilise une image Node.js complète pour installer les dépendances.
FROM node:22-alpine AS builder

WORKDIR /app

# Copie les fichiers de dépendances et installe uniquement les dépendances de production.
# Cette couche sera mise en cache si les dépendances ne changent pas.
COPY package*.json ./
RUN npm ci --omit=dev

# Copie le reste des fichiers de l'application.
COPY . .

# Génère le client Prisma.
RUN npx prisma generate

# --- Étape 2: Production ---
# Utilise une image Node.js légère pour l'environnement de production.
FROM node:22-alpine

WORKDIR /app

# Copie les dépendances installées et le code source depuis l'étape de build.
COPY --from=builder /app .

EXPOSE 3012

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
