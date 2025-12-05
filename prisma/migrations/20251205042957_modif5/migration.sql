-- DropForeignKey
ALTER TABLE "Paiement" DROP CONSTRAINT "Paiement_reservationId_fkey";

-- AlterTable
ALTER TABLE "Paiement" ALTER COLUMN "reservationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("reservationId") ON DELETE SET NULL ON UPDATE CASCADE;
