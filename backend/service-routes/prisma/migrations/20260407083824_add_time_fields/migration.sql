-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "end_time" TIMESTAMP(3),
ADD COLUMN     "start_time" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "RouteStep" ADD COLUMN     "estimated_time_from_previous" INTEGER;
