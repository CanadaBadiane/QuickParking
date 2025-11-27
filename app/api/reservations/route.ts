import { NextRequest, NextResponse } from "next/server";
import { getReservationsByUserId, getUserById } from "@/lib/data";

// GET /api/reservations?userId=xxx - Récupérer toutes les réservations d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    // 1. Récupérer le userId depuis les query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    console.log(`Recherche des réservations pour l'utilisateur: ${userId}`);

    // 2. Validation du userId
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Paramètre userId requis",
          message: "Veuillez fournir un userId dans les paramètres de requête",
        },
        { status: 400 }
      );
    }

    // 3. Vérifier que l'utilisateur existe
    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Utilisateur non trouvé",
          message: `Aucun utilisateur avec l'ID ${userId}`,
        },
        { status: 404 }
      );
    }

    // 4. Récupérer les réservations de l'utilisateur
    const userReservations = getReservationsByUserId(userId);

    console.log(
      `${userReservations.length} réservations trouvées pour ${user.name}`
    );

    // 5. Enrichir les réservations avec les détails des places de stationnement
    const detailReservations = await Promise.all(
      userReservations.map(async (reservation) => {
        try {
          // Récupérer les détails de la place depuis votre API
          const spotResponse = await fetch(
            `${request.nextUrl.origin}/api/parking-spots/${reservation.parkingSpotId}`
          );

          if (spotResponse.ok) {
            const spotData = await spotResponse.json();
            return {
              ...reservation,
              parkingSpot: spotData.success ? spotData.data : null,
              user: user, // Ajouter les infos utilisateur
            };
          }

          // Si l'API échoue, retourner la réservation sans enrichissement
          return {
            ...reservation,
            user: user,
          };
        } catch (error) {
          console.warn(
            `Impossible d'enrichir la réservation ${reservation.idReservation}:`,
            error
          );
          return {
            ...reservation,
            user: user,
          };
        }
      })
    );

    // 6. Organiser les réservations par statut
    const reservationsByStatus = {
      active: detailReservations.filter((r) => r.status === "active"),
      completed: detailReservations.filter((r) => r.status === "completed"),
      cancelled: detailReservations.filter((r) => r.status === "cancelled"),
    };

    // 7. Statistiques rapides
    const stats = {
      total: detailReservations.length,
      active: reservationsByStatus.active.length,
      completed: reservationsByStatus.completed.length,
      cancelled: reservationsByStatus.cancelled.length,
      totalSpent: detailReservations.filter((r) => r.status === "completed"),
    };

    // 8. Réponse finale
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
    console.error("Erreur lors de la récupération des réservations:", error);

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
