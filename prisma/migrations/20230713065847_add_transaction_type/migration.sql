-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Income', 'Expense', 'Transfer');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "type" "TransactionType" NOT NULL DEFAULT 'Expense';
