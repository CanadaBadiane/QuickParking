import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@clerk/nextjs/server";

// GET /api/parking-spots/[id] - Récupérer les détails d'une place spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const Params = await params;
  // Authentification utilisateur
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
  try {
    // Récupérer le parking spot depuis Prisma
    const parkingSpot = await prisma.parkingSpot.findUnique({
      where: { parkingSpotId: Params.id },
    });
    if (!parkingSpot) {
      return NextResponse.json(
        {
          success: false,
          error: "Place de stationnement non trouvée",
          message: `Aucune place avec l'ID ${Params.id}`,
        },
        { status: 404 }
      );
    }

    // Marque comme "completed" les réservations actives dont la période est passée
    const nowUTC = new Date();
    await prisma.reservation.updateMany({
      where: {
        parkingSpotId: Params.id,
        status: "active",
        endDateTime: { lt: nowUTC },
      },
      data: { status: "completed" },
    });

    // Même logique que /api/parking-spots : la place reste bloquée tant
    // qu'il existe une réservation active ou un paiement complété dont la
    // période court encore. On exclut explicitement les endDateTime nulles
    // (paiements pending/failed) pour ne pas fausser le calcul.
    const activeReservation = await prisma.reservation.findFirst({
      where: {
        parkingSpotId: Params.id,
        status: "active",
        endDateTime: { gte: nowUTC },
      },
    });
    const ongoingPaiement = await prisma.paiement.findFirst({
      where: {
        parkingSpotId: Params.id,
        status: "completed",
        endDateTime: { not: null, gte: nowUTC },
      },
    });

    const isBlocked = Boolean(activeReservation || ongoingPaiement);
    const canReserve = !isBlocked;
    const isAvailable = !isBlocked;

    if (
      parkingSpot.canReserve !== canReserve ||
      parkingSpot.isAvailable !== isAvailable
    ) {
      await prisma.parkingSpot.update({
        where: { parkingSpotId: Params.id },
        data: { canReserve, isAvailable },
      });
    }

    // Relire la place depuis la BDD pour garantir que les champs sont à jour
    const parkingSpotUpdated = await prisma.parkingSpot.findUnique({
      where: { parkingSpotId: Params.id },
    });
    const apiResponse = {
      success: true,
      data: parkingSpotUpdated,
      meta: {
        searchedId: Params.id,
        source: "Prisma database",
        retrievedAt: new Date().toISOString(),
      },
    };
    return NextResponse.json(apiResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la recupération de la place",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
