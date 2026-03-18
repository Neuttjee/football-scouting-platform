-- Add new season-based field
ALTER TABLE "Player" ADD COLUMN "plannedInternalFromSeasonYear" INTEGER;

-- Backfill from existing plannedInternalFromDate (season starts July 1)
-- If date is in July-Dec: season start year = same year; else = year-1
UPDATE "Player"
SET "plannedInternalFromSeasonYear" = CASE
  WHEN "plannedInternalFromDate" IS NULL THEN NULL
  WHEN EXTRACT(MONTH FROM "plannedInternalFromDate") >= 7 THEN EXTRACT(YEAR FROM "plannedInternalFromDate")::INT
  ELSE (EXTRACT(YEAR FROM "plannedInternalFromDate")::INT - 1)
END
WHERE "plannedInternalFromSeasonYear" IS NULL;

-- Drop old date-based field
ALTER TABLE "Player" DROP COLUMN "plannedInternalFromDate";

