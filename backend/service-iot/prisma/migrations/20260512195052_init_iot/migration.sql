-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('CRITICAL_FILL', 'SENSOR_OFFLINE', 'TEMPERATURE_ANOMALY', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "Measurement" (
    "id" SERIAL NOT NULL,
    "containerId" INTEGER NOT NULL,
    "fillLevel" INTEGER NOT NULL,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anomaly" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorStatus" (
    "id" SERIAL NOT NULL,
    "containerId" INTEGER NOT NULL,
    "lastFillLevel" INTEGER,
    "lastTemperature" DOUBLE PRECISION,
    "lastHumidity" DOUBLE PRECISION,
    "lastSeen" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensorStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "containerId" INTEGER NOT NULL,
    "type" "AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SensorStatus_containerId_key" ON "SensorStatus"("containerId");
