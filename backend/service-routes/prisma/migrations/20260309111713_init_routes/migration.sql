-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "agent_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "total_distance" DOUBLE PRECISION,
    "estimated_time" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStep" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "container_id" INTEGER NOT NULL,
    "step_order" INTEGER NOT NULL,
    "distance_from_previous" DOUBLE PRECISION,

    CONSTRAINT "RouteStep_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RouteStep" ADD CONSTRAINT "RouteStep_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
