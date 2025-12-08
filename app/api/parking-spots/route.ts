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
    // Pour chaque parking, on récupère la dernière réservation (endDateTime la plus récente)
    const updatedSpots = await Promise.all(
      parkingSpots.map(async (spot) => {
        // Met à jour le statut des réservations actives expirées pour ce parking
        const activeReservations = await prisma.reservation.findMany({
          where: {
            parkingSpotId: spot.parkingSpotId,
            status: "active",
            endDateTime: { lt: new Date() },
          },
        });
        for (const res of activeReservations) {
          await prisma.reservation.update({
            where: { reservationId: res.reservationId },
            data: { status: "completed" },
          });
        }
        // Vérifie s'il y a un paiement pending
        const paiementPending = await prisma.paiement.findFirst({
          where: {
            parkingSpotId: spot.parkingSpotId,
            status: "pending",
          },
          orderBy: { createdAt: "desc" },
        });
        let forceFalse = false;
        if (paiementPending) {
          const nowMs = Date.now();
          const createdAtMs = new Date(paiementPending.createdAt).getTime();
          if (nowMs - createdAtMs < 600000) {
            forceFalse = true;
            await prisma.parkingSpot.update({
              where: { parkingSpotId: spot.parkingSpotId },
              data: { canReserve: false, isAvailable: false },
            });
          } else {
            await prisma.parkingSpot.update({
              where: { parkingSpotId: spot.parkingSpotId },
              data: { canReserve: true, isAvailable: true },
            });
          }
        }
        // Récupère la dernière réservation
        const lastReservation = await prisma.reservation.findFirst({
          where: { parkingSpotId: spot.parkingSpotId },
          orderBy: { endDateTime: "desc" },
        });
        // Récupère le dernier paiement
        const lastPaiement = await prisma.paiement.findFirst({
          where: { parkingSpotId: spot.parkingSpotId },
          orderBy: { endDateTime: "desc" },
        });
        // Compare les deux endDateTime
        let lastEndDate: Date | null = null;
        if (lastReservation?.endDateTime && lastPaiement?.endDateTime) {
          lastEndDate = new Date(
            new Date(lastReservation.endDateTime) >
            new Date(lastPaiement.endDateTime)
              ? lastReservation.endDateTime
              : lastPaiement.endDateTime
          );
        } else if (lastReservation?.endDateTime) {
          lastEndDate = new Date(lastReservation.endDateTime);
        } else if (lastPaiement?.endDateTime) {
          lastEndDate = new Date(lastPaiement.endDateTime);
        }
        let canReserve = true;
        let isAvailable = true;
        if (forceFalse) {
          canReserve = false;
          isAvailable = false;
        }
        if (lastEndDate) {
          const isPast = lastEndDate < now;
          canReserve = isPast ? true : false;
          isAvailable = isPast ? true : false;
        }
        // Met à jour le parking spot en base de données
        await prisma.parkingSpot.update({
          where: { parkingSpotId: spot.parkingSpotId },
          data: { canReserve, isAvailable },
        });
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
