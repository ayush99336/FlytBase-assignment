-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "dataFrequency" INTEGER,
ADD COLUMN     "sensors" JSONB,
ADD COLUMN     "waypoints" JSONB;
