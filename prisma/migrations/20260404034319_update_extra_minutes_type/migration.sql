/*
  Warnings:

  - The `extraMinutes` column on the `Reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "extraMinutes",
ADD COLUMN     "extraMinutes" INTEGER;
