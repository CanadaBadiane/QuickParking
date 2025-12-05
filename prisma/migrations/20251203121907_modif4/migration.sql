/*
  Warnings:

  - You are about to drop the `ReservationRequest` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `confirmationPassword` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ReservationRequest" DROP CONSTRAINT "ReservationRequest_parkingSpotId_fkey";

-- DropForeignKey
ALTER TABLE "ReservationRequest" DROP CONSTRAINT "ReservationRequest_userId_fkey";

-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "confirmationPassword" TEXT NOT NULL;

-- DropTable
DROP TABLE "ReservationRequest";
