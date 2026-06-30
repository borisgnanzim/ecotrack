FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci && npx prisma generate && npm cache clean --force

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
