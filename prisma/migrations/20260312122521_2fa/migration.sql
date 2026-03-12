-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoFactorResetAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SquadPlan" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT,
    "seasonYear" INTEGER NOT NULL,
    "formation" TEXT NOT NULL,
    "assignmentsJson" JSONB NOT NULL,
    "isClubDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SquadPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SquadPlan_clubId_teamId_seasonYear_userId_isClubDefault_idx" ON "SquadPlan"("clubId", "teamId", "seasonYear", "userId", "isClubDefault");

-- AddForeignKey
ALTER TABLE "SquadPlan" ADD CONSTRAINT "SquadPlan_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadPlan" ADD CONSTRAINT "SquadPlan_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadPlan" ADD CONSTRAINT "SquadPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
