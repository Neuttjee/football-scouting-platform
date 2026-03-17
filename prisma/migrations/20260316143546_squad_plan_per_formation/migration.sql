/*
  Warnings:

  - A unique constraint covering the columns `[clubId,teamId,seasonYear,formation,userId]` on the table `SquadPlan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clubId,teamId,seasonYear,formation,isClubDefault]` on the table `SquadPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SquadPlan_clubId_teamId_seasonYear_formation_userId_key" ON "SquadPlan"("clubId", "teamId", "seasonYear", "formation", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SquadPlan_clubId_teamId_seasonYear_formation_isClubDefault_key" ON "SquadPlan"("clubId", "teamId", "seasonYear", "formation", "isClubDefault");
