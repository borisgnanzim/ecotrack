# EcoTrack AI Coding Guidelines

## Architecture Overview
EcoTrack is a monorepo with microservices backend and Next.js frontend apps. The backend uses Node.js/Express with Prisma ORM on PostgreSQL, maintaining Mongoose-like model wrappers for migration compatibility. Frontend consists of separate Next.js apps for admin (`ecotrack-admin`) and users (`ecotrack-front`), both using TypeScript and Tailwind CSS.

Key components:
- **Backend/service-users**: User management, JWT authentication, notifications, avatar uploads (Sharp for resizing to 256x256 WebP)
- **Frontend apps**: Client-side rendering with axios for API calls to backend services
- **Database**: PostgreSQL with Prisma schema defining User/Role/Notification models
- **Auth flow**: JWT tokens with role-based access, stored client-side

## Critical Workflows
- **Backend setup**: `cd backend/service-users && npm install && npx prisma generate && npx prisma migrate dev --name init && npm run seed && npm run dev`
- **Frontend setup**: `cd front/ecotrack-front && npm install && npm run dev` (similar for admin)
- **Database changes**: Modify `prisma/schema.prisma`, run `npm run prisma:migrate` and `npm run prisma:generate`
- **API testing**: Use Swagger UI at `http://localhost:3002/api-docs` (adjust port via .env)
- **Avatar uploads**: POST multipart to `/users/profile/avatar`, served from `/uploads/avatars/<id>.webp`

## Project-Specific Patterns
- **Model wrappers**: Use Mongoose-style methods (`User.find()`, `User.findById()`) in controllers, but they call Prisma under the hood (see `src/models/User.js`)
- **Auth middleware**: Apply `authMiddleware.js` for JWT verification, `roleMiddleware.js` for role checks (e.g., citizen/admin)
- **Notification modes**: Local DB storage or HTTP delegation to external service (configured via `NOTIFICATION_MODE` env)
- **Error handling**: Standard Express try/catch with 500/404 responses, French error messages
- **Frontend auth**: Store JWT in localStorage, include in axios headers as `Authorization: Bearer <token>`
- **Styling**: Tailwind classes with emerald/green theme for eco-friendly branding
- **File structure**: Controllers in `src/controllers/`, routes in `src/routes/`, services in `src/services/`

## Integration Points
- **Cross-service communication**: Notifications can POST to external URLs when `NOTIFICATION_MODE=http`
- **Environment isolation**: Each service has its own `.env` with `DATABASE_URL`, `JWT_SECRET`, `PORT`
- **API versioning**: REST endpoints under `/auth/`, `/users/`, `/notifications/` prefixes
- **Role management**: Users have many-to-many roles via Prisma relations, default "citizen" on register

## Key Files to Reference
- `backend/service-users/prisma/schema.prisma`: Database models and relations
- `backend/service-users/src/models/User.js`: Prisma wrapper with bcrypt hashing
- `backend/service-users/src/controllers/auth/authController.js`: JWT generation with roles
- `front/ecotrack-front/services/auth.service.ts`: API integration with axios
- `front/ecotrack-front/app/profile/page.tsx`: Example client component with Tailwind</content>
<parameter name="filePath">d:\0 Knowledge\Cours Ingetis\Projet fil rouge\ecotrack\.github\copilot-instructions.md