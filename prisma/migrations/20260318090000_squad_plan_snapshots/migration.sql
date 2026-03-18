-- AlterTable
ALTER TABLE "SquadPlan" ADD COLUMN "activeSnapshotId" TEXT;

-- CreateTable
CREATE TABLE "SquadPlanSnapshot" (
    "id" TEXT NOT NULL,
    "squadPlanId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "note" TEXT,
    "createdById" TEXT,
    "assignmentsJson" JSONB NOT NULL,
    "slotMaxOverridesJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquadPlanSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SquadPlanSnapshot_squadPlanId_versionNumber_key" ON "SquadPlanSnapshot"("squadPlanId", "versionNumber");

-- CreateIndex
CREATE INDEX "SquadPlanSnapshot_squadPlanId_createdAt_idx" ON "SquadPlanSnapshot"("squadPlanId", "createdAt");

-- AddForeignKey
ALTER TABLE "SquadPlanSnapshot" ADD CONSTRAINT "SquadPlanSnapshot_squadPlanId_fkey" FOREIGN KEY ("squadPlanId") REFERENCES "SquadPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadPlanSnapshot" ADD CONSTRAINT "SquadPlanSnapshot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadPlan" ADD CONSTRAINT "SquadPlan_activeSnapshotId_fkey" FOREIGN KEY ("activeSnapshotId") REFERENCES "SquadPlanSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

