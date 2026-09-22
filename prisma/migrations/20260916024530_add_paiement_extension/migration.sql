/*
  Warnings:

  - Added the required column `updatedAt` to the `Paiement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Paiement" ADD COLUMN     "parentPaiementId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_parentPaiementId_fkey" FOREIGN KEY ("parentPaiementId") REFERENCES "Paiement"("paiementId") ON DELETE SET NULL ON UPDATE CASCADE;
