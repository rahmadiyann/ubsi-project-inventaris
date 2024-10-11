/*
  Warnings:

  - You are about to drop the `Inventory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_medicineId_fkey";

-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "stockOpname" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Inventory";
