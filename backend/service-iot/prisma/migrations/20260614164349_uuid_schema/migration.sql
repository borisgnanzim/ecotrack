/*
  Warnings:

  - You are about to drop the `Alert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Measurement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SensorStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "AlertType" ADD VALUE 'HUMIDITY_ANOMALY';

-- DropTable
DROP TABLE "Alert";

-- DropTable
DROP TABLE "Measurement";

-- DropTable
DROP TABLE "SensorStatus";

-- CreateTable
CREATE TABLE "measurements" (
    "id" UUID NOT NULL,
    "containerId" UUID NOT NULL,
    "fillLevel" INTEGER NOT NULL,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "anomaly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_statuses" (
    "id" UUID NOT NULL,
    "containerId" UUID NOT NULL,
    "lastFillLevel" INTEGER,
    "lastTemperature" DOUBLE PRECISION,
    "lastHumidity" DOUBLE PRECISION,
    "lastSeen" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensor_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL,
    "containerId" UUID NOT NULL,
    "type" "AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "measurements_containerId_idx" ON "measurements"("containerId");

-- CreateIndex
CREATE INDEX "measurements_createdAt_idx" ON "measurements"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "sensor_statuses_containerId_key" ON "sensor_statuses"("containerId");

-- CreateIndex
CREATE INDEX "sensor_statuses_containerId_idx" ON "sensor_statuses"("containerId");

-- CreateIndex
CREATE INDEX "alerts_containerId_idx" ON "alerts"("containerId");

-- CreateIndex
CREATE INDEX "alerts_type_idx" ON "alerts"("type");

-- CreateIndex
CREATE INDEX "alerts_resolved_idx" ON "alerts"("resolved");

-- CreateIndex
CREATE INDEX "alerts_createdAt_idx" ON "alerts"("createdAt");
