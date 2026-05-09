/*
  Warnings:

  - Added the required column `sale_number` to the `sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "city" TEXT,
ADD COLUMN     "tax_id" TEXT;

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "sale_number" TEXT NOT NULL;
