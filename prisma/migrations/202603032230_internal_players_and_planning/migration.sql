-- Internal players and squad planning foundation
-- Safe additive migration: no destructive operations

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PlayerType') THEN
    CREATE TYPE "PlayerType" AS ENUM ('INTERNAL', 'EXTERNAL');
  END IF;
END$$;

ALTER TABLE "Club"
ADD COLUMN IF NOT EXISTS "agingThreshold" INTEGER NOT NULL DEFAULT 30;

CREATE TABLE IF NOT EXISTS "Team" (
  "id" TEXT NOT NULL,
  "clubId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Team_clubId_isActive_displayOrder_idx"
ON "Team"("clubId", "isActive", "displayOrder");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'Team_clubId_fkey'
  ) THEN
    ALTER TABLE "Team"
    ADD CONSTRAINT "Team_clubId_fkey"
    FOREIGN KEY ("clubId") REFERENCES "Club"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

ALTER TABLE "Player"
ADD COLUMN IF NOT EXISTS "type" "PlayerType" NOT NULL DEFAULT 'EXTERNAL',
ADD COLUMN IF NOT EXISTS "teamId" TEXT,
ADD COLUMN IF NOT EXISTS "joinedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "contractEndDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "optionYear" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "isTopTalent" BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'Player_teamId_fkey'
  ) THEN
    ALTER TABLE "Player"
    ADD CONSTRAINT "Player_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;
