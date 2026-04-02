/*
  Warnings:

  - The `status` column on the `Route` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "containers_list" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ALTER COLUMN "agent_id" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "RouteStatus" NOT NULL DEFAULT 'planned';

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "address" TEXT,
    "avatar" TEXT,
    "badges" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Container" (
    "id_conteneur" SERIAL NOT NULL,
    "type_Dechet" TEXT NOT NULL,
    "Statut" TEXT,
    "id_Zone" TEXT NOT NULL,
    "capacite_i" INTEGER,
    "code_containers" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "photo_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fill_level" INTEGER DEFAULT 0,

    CONSTRAINT "Container_pkey" PRIMARY KEY ("id_conteneur")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Container_code_containers_key" ON "Container"("code_containers");

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStep" ADD CONSTRAINT "RouteStep_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "Container"("id_conteneur") ON DELETE RESTRICT ON UPDATE CASCADE;
