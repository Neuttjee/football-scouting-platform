-- AlterTable
ALTER TABLE "Player" ADD COLUMN "plannedInternalTeamId" TEXT;

-- CreateTable
CREATE TABLE "SeasonRolloverRun" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "inboundCount" INTEGER NOT NULL DEFAULT 0,
    "outboundCount" INTEGER NOT NULL DEFAULT 0,
    "ranAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeasonRolloverRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSeasonRolloverSeen" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSeasonRolloverSeen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeasonRolloverRun_clubId_seasonYear_key" ON "SeasonRolloverRun"("clubId", "seasonYear");

-- CreateIndex
CREATE INDEX "SeasonRolloverRun_clubId_ranAt_idx" ON "SeasonRolloverRun"("clubId", "ranAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSeasonRolloverSeen_userId_clubId_seasonYear_key" ON "UserSeasonRolloverSeen"("userId", "clubId", "seasonYear");

-- CreateIndex
CREATE INDEX "UserSeasonRolloverSeen_clubId_seasonYear_idx" ON "UserSeasonRolloverSeen"("clubId", "seasonYear");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_plannedInternalTeamId_fkey" FOREIGN KEY ("plannedInternalTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonRolloverRun" ADD CONSTRAINT "SeasonRolloverRun_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSeasonRolloverSeen" ADD CONSTRAINT "UserSeasonRolloverSeen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSeasonRolloverSeen" ADD CONSTRAINT "UserSeasonRolloverSeen_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

