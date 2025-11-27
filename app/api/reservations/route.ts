import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { getReservationsByUserId, getUserById } from "@/lib/data";

// GET /api/reservations?userId=xxx - Récupérer toutes les réservations d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const auth = getAuth(request);
    if (!auth.userId) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer le userId depuis la session Clerk
    const userId = auth.userId;

    // Vérifier que l'utilisateur existe
    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les réservations de l'utilisateur
    const userReservations = getReservationsByUserId(userId);

    // Enrichir les réservations avec les détails des places de stationnement
    const detailReservations = await Promise.all(
      userReservations.map(async (reservation) => {
        try {
          const spotResponse = await fetch(
            `${request.nextUrl.origin}/api/parking-spots/${reservation.parkingSpotId}`
          );
          if (spotResponse.ok) {
            const spotData = await spotResponse.json();
            return {
              ...reservation,
              parkingSpot: spotData.success ? spotData.data : null,
              user: user,
            };
          }
          return {
            ...reservation,
            user: user,
          };
        } catch (error) {
          return {
            ...reservation,
            user: user,
          };
        }
      })
    );

    // Organiser les réservations par statut
    const reservationsByStatus = {
      active: detailReservations.filter((r) => r.status === "active"),
      completed: detailReservations.filter((r) => r.status === "completed"),
      cancelled: detailReservations.filter((r) => r.status === "cancelled"),
    };

    // Statistiques rapides
    const stats = {
      total: detailReservations.length,
      active: reservationsByStatus.active.length,
      completed: reservationsByStatus.completed.length,
      cancelled: reservationsByStatus.cancelled.length,
    };

    // Réponse finale
    const apiResponse = {
      success: true,
      data: {
        user: user,
        reservations: detailReservations,
        reservationsByStatus: reservationsByStatus,
        stats: stats,
      },
      meta: {
        userId: userId,
        totalReservations: detailReservations.length,
        retrievedAt: new Date().toISOString(),
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
    const body = await request.json();
    const { userId, parkingSpotId, startDateTime, endDateTime } = body;
    if (!userId || !parkingSpotId || !startDateTime || !endDateTime) {
      return NextResponse.json(
        {
          success: false,
          error: "Champs manquants",
          message: "userId, parkingSpotId, startDateTime, endDateTime requis",
        },
        { status: 400 }
      );
    }

    // Création de la nouvelle réservation (simulée)
    const newReservation = {
      id: Math.floor(Math.random() * 1000000).toString(),
      userId,
      parkingSpotId,
      startDateTime,
      endDateTime,
    };

    return NextResponse.json(
      { success: true, reservation: newReservation },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
