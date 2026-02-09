/*
  Warnings:

  - You are about to drop the column `deleted` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `CSVImportPreset` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BankAccount" DROP COLUMN "deleted",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CSVImportPreset" DROP COLUMN "deleted",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "deleted",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "deleted",
ADD COLUMN     "deletedAt" TIMESTAMP(3);
