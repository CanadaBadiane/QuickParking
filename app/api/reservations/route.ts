// @ts-ignore
import { toZonedTime } from "date-fns-tz";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/reservations - Récupérer toutes les réservations de l'utilisateur authentifié
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

    // Récupérer l'utilisateur via clerkId
    const user = await prisma.user.findFirst({
      where: { clerkId: payload.sub, deletedAt: null },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé ou supprimé" },
        { status: 404 }
      );
    }

    // Récupérer les réservations de l'utilisateur
    let reservations = await prisma.reservation.findMany({
      where: { userId: user.userId },
    });

    // Mettre à jour les réservations actives dont la date de fin est passée
    const now = new Date();
    for (const r of reservations) {
      if (r.status === "active" && new Date(r.endDateTime) < now) {
        // Mettre à jour le statut de la réservation
        await prisma.reservation.update({
          where: { reservationId: r.reservationId },
          data: { status: "completed" },
        });
        // Mettre à jour le parking spot
        await prisma.parkingSpot.update({
          where: { parkingSpotId: r.parkingSpotId },
          data: { canReserve: true },
        });
      }
    }
    // Recharger les réservations après update
    reservations = await prisma.reservation.findMany({
      where: { userId: user.userId },
    });

    // Organiser les réservations par statut
    const reservationsByStatus = {
      active: reservations.filter((r) => r.status === "active"),
      completed: reservations.filter((r) => r.status === "completed"),
      cancelled: reservations.filter((r) => r.status === "cancelled"),
    };

    // Statistiques rapides
    const stats = {
      total: reservations.length,
      active: reservationsByStatus.active.length,
      completed: reservationsByStatus.completed.length,
      cancelled: reservationsByStatus.cancelled.length,
    };

    // Réponse finale
    const apiResponse = {
      success: true,
      data: {
        reservations: reservations,
      },
      meta: {
        totalReservations: reservations.length,
      },
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la récupération des réservations",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

// POST /api/reservations - Créer une nouvelle réservation
export async function POST(request: NextRequest) {
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

    // Récupérer l'utilisateur via clerkId
    const user = await prisma.user.findFirst({
      where: { clerkId: payload.sub, deletedAt: null },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé ou supprimé" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { parkingSpotId, endDateTime, clerkId } = body;
    // Si admin, peut créer pour un autre user via clerkId
    const isAdmin = user.role === "admin";
    const targetClerkId = isAdmin && clerkId ? clerkId : payload.sub;
    const targetUser = await prisma.user.findFirst({
      where: { clerkId: targetClerkId, deletedAt: null },
    });
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Utilisateur cible non trouvé ou supprimé" },
        { status: 403 }
      );
    }

    // Vérifier si le user cible a déjà une réservation active
    const activeReservation = await prisma.reservation.findFirst({
      where: {
        userId: targetUser.userId,
        status: "active",
      },
    });
    if (activeReservation) {
      return NextResponse.json(
        {
          success: false,
          error: "Réservation active déjà existante",
          message: "Cet utilisateur a déjà une réservation en cours.",
        },
        { status: 400 }
      );
    }

    if (!parkingSpotId || !endDateTime) {
      return NextResponse.json(
        {
          success: false,
          error: "Champs manquants",
          message: "parkingSpotId, endDateTime requis",
        },
        { status: 400 }
      );
    }

    // startDateTime est toujours maintenant
    const startDateTime = new Date();

    // Vérifier la disponibilité du parking spot
    let parkingSpot = await prisma.parkingSpot.findUnique({
      where: { parkingSpotId },
    });
    if (!parkingSpot) {
      return NextResponse.json(
        {
          success: false,
          error: "Parking spot introuvable",
          message: `Aucune place avec l'ID ${parkingSpotId}`,
        },
        { status: 404 }
      );
    }

    // Vérifier s'il existe un paiement en cours (non terminé) pour cette place
    const paiementEnCours = await prisma.paiement.findFirst({
      where: {
        parkingSpotId,
        status: "pending",
      },
      orderBy: { createdAt: "desc" },
    });
    if (paiementEnCours) {
      const fin =
        new Date(paiementEnCours.createdAt).getTime() +
        (paiementEnCours.duration ?? 0) * 60000;
      // Si le paiement est expiré, rendre la place disponible
      if (Date.now() > fin && !parkingSpot.isAvailable) {
        await prisma.parkingSpot.update({
          where: { parkingSpotId },
          data: { isAvailable: true },
        });
        parkingSpot = await prisma.parkingSpot.findUnique({
          where: { parkingSpotId },
        });
      }
      // Si le paiement est encore actif, empêcher la réservation
      if (Date.now() < fin) {
        return NextResponse.json(
          {
            success: false,
            error: "Paiement en cours pour cette place",
            message: "Impossible de réserver tant qu'un paiement est actif.",
          },
          { status: 400 }
        );
      }
    }

    if (!parkingSpot || !parkingSpot.isAvailable || !parkingSpot.canReserve) {
      return NextResponse.json(
        {
          success: false,
          error: "Place non disponible ou non réservable",
          message: "Impossible de réserver cette place actuellement.",
        },
        { status: 400 }
      );
    }

    // Vérifier la contrainte de durée maximale (15 min)
    const end = new Date(endDateTime);
    const duree = (end.getTime() - startDateTime.getTime()) / (1000 * 60);
    if (duree < 4.95) {
      return NextResponse.json(
        {
          success: false,
          error: "Durée minimale non atteinte",
          message: "La réservation doit durer au moins 5 minutes.",
        },
        { status: 400 }
      );
    }
    if (duree > 15) {
      return NextResponse.json(
        {
          success: false,
          error: "Durée maximale dépassée",
          message: "La réservation ne peut pas dépasser 15 minutes.",
        },
        { status: 400 }
      );
    }

    // Création de la nouvelle réservation en BDD
    const newReservation = await prisma.reservation.create({
      data: {
        userId: targetUser.userId,
        parkingSpotId,
        startDateTime,
        endDateTime: new Date(endDateTime),
        status: "active",
      },
    });

    // Mettre à jour le champ canReserve à false
    await prisma.parkingSpot.update({
      where: { parkingSpotId },
      data: { canReserve: false },
    });

    return NextResponse.json(
      { success: true, data: newReservation },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la création de la réservation",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
