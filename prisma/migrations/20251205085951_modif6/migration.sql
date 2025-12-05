/*
  Warnings:

  - The `method` column on the `Paiement` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Paiement" ADD COLUMN     "stripePaymentIntentId" TEXT,
DROP COLUMN "method",
ADD COLUMN     "method" TEXT NOT NULL DEFAULT 'card';

-- DropEnum
DROP TYPE "PaiementMethod";
