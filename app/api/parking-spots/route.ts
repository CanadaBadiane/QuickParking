import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@clerk/nextjs/server";

// GET /api/parking-spots - Retourne les places de stationnement payantes à Montréal
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let payload;
    try {
      payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Token invalide" },
        { status: 401 }
      );
    }
    const parkingSpots = await prisma.parkingSpot.findMany();
    const now = new Date();
    // Pour chaque parking, on vérifie s'il reste bloqué par une réservation
    // active ou un paiement complété dont la période n'est pas terminée.
    const updatedSpots = await Promise.all(
      parkingSpots.map(async (spot) => {
        // Marque comme "completed" les réservations actives dont la période est passée
        const expiredReservations = await prisma.reservation.findMany({
          where: {
            parkingSpotId: spot.parkingSpotId,
            status: "active",
            endDateTime: { lt: now },
          },
        });
        for (const res of expiredReservations) {
          await prisma.reservation.update({
            where: { reservationId: res.reservationId },
            data: { status: "completed" },
          });
        }

        // Cherche une réservation encore active OU un paiement complété dont
        // la période court toujours. On exclut explicitement les endDateTime
        // nulles (paiements pending/failed) pour ne jamais laisser un vieil
        // enregistrement incomplet fausser le calcul.
        const activeReservation = await prisma.reservation.findFirst({
          where: {
            parkingSpotId: spot.parkingSpotId,
            status: "active",
            endDateTime: { gte: now },
          },
        });
        const ongoingPaiement = await prisma.paiement.findFirst({
          where: {
            parkingSpotId: spot.parkingSpotId,
            status: "completed",
            endDateTime: { not: null, gte: now },
          },
        });

        const isBlocked = Boolean(activeReservation || ongoingPaiement);
        const canReserve = !isBlocked;
        const isAvailable = !isBlocked;

        // On n'écrit en BDD que si la valeur calculée diffère de celle déjà
        // stockée, pour éviter une écriture inutile à chaque chargement.
        if (
          spot.canReserve !== canReserve ||
          spot.isAvailable !== isAvailable
        ) {
          await prisma.parkingSpot.update({
            where: { parkingSpotId: spot.parkingSpotId },
            data: { canReserve, isAvailable },
          });
        }

        return { ...spot, canReserve, isAvailable };
      })
    );
    return NextResponse.json({
      success: true,
      data: updatedSpots,
      meta: {
        total: updatedSpots.length,
        source: "Prisma database",
        retrievedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la récupération des places",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
