-- CreateEnum
CREATE TYPE "BudgetGranularity" AS ENUM ('Monthly', 'Quarterly', 'Yearly');

-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "granularity" "BudgetGranularity" NOT NULL DEFAULT 'Monthly';
