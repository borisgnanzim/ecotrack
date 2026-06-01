#!/bin/bash

# Service Gamification Setup Script
# Usage: bash setup.sh

echo "🚀 Service Gamification - Setup Script"
echo "========================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
  echo -e "${YELLOW}ℹ️  Creating .env file from .env.example...${NC}"
  cp .env.example .env
  echo -e "${GREEN}✅ .env created${NC}"
  echo -e "${YELLOW}⚠️  Please update .env with your database credentials${NC}"
else
  echo -e "${GREEN}✅ .env already exists${NC}"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}📦 Installing dependencies...${NC}"
  npm install
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
  else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Generate Prisma Client
echo -e "${BLUE}🔧 Generating Prisma Client...${NC}"
npm run prisma:generate
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Prisma Client generated${NC}"
else
  echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
  exit 1
fi

# Run migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
npm run prisma:migrate
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Database migrations completed${NC}"
else
  echo -e "${RED}❌ Failed to run migrations${NC}"
  echo -e "${YELLOW}ℹ️  Make sure your DATABASE_URL in .env is correct${NC}"
  exit 1
fi

# Seed the database
echo -e "${BLUE}🌱 Seeding database with initial data...${NC}"
npx prisma db seed
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Database seeded${NC}"
else
  echo -e "${YELLOW}⚠️  Database seeding warning (may already be seeded)${NC}"
fi

echo ""
echo -e "${GREEN}✨ Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Start the service: ${YELLOW}npm run dev${NC}"
echo "2. Test the service: ${YELLOW}curl http://localhost:3015/health${NC}"
echo "3. View API documentation: ${YELLOW}cat README.md${NC}"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  npm run dev              - Start development server"
echo "  npm test                 - Run tests"
echo "  npm run prisma:migrate   - Create new migration"
echo "  npm run prisma:generate  - Regenerate Prisma Client"
echo "  npx prisma studio       - Open Prisma Studio"
echo ""
