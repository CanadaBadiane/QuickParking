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

    // Vérifier les réservations actives pour cette place et mettre à jour leur statut si besoin
    const nowUTC = new Date();
    await prisma.reservation.updateMany({
      where: {
        parkingSpotId: Params.id,
        status: "active",
        endDateTime: { lt: nowUTC },
      },
      data: { status: "completed" },
    });

    // Vérifier le paiement en cours pour cette place
    const paiementEnCours = await prisma.paiement.findFirst({
      where: {
        parkingSpotId: Params.id,
        status: "pending",
      },
      orderBy: { createdAt: "desc" },
    });
    if (paiementEnCours) {
      const fin =
        new Date(paiementEnCours.createdAt).getTime() +
        (paiementEnCours.duration ?? 0) * 60000;
      if (Date.now() > fin && !parkingSpot.isAvailable) {
        await prisma.parkingSpot.update({
          where: { parkingSpotId: Params.id },
          data: { isAvailable: true },
        });
        parkingSpot.isAvailable = true;
      }
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
