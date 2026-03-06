-- CreateEnum
CREATE TYPE "ClubStatus" AS ENUM ('ACTIEF', 'INACTIEF', 'PROEFPERIODE', 'GESCHORST');

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "status" "ClubStatus" NOT NULL DEFAULT 'ACTIEF';

