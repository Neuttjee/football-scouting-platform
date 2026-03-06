-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('ACTIVE', 'TRIAL', 'PAST_DUE', 'PAUSED', 'CANCELED');

-- AlterTable
ALTER TABLE "Club"
ADD COLUMN     "trialStartsAt" TIMESTAMP(3),
ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
ADD COLUMN     "billingStatus" "BillingStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "billingProvider" TEXT,
ADD COLUMN     "billingCustomerId" TEXT,
ADD COLUMN     "billingSubscriptionId" TEXT;

