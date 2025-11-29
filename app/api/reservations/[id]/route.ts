import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { reservations, users, parkingSpots } from "@/lib/data";
import { paiements } from "@/lib/data";

// GET /api/reservations/[id] - Récupérer une réservation par son ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const auth = getAuth(request);
  if (!auth.userId) {
    return NextResponse.json(
      { success: false, error: "Non authentifié" },
      { status: 401 }
    );
  }

  // 1. Chercher la réservation
  const reservation = reservations.find((r) => r.reservationId === id);
  if (!reservation) {
    return NextResponse.json(
      {
        success: false,
        error: "Réservation non trouvée",
        message: `Aucune réservation avec l'ID ${id}`,
      },
      { status: 404 }
    );
  }

  // 2. Chercher l'utilisateur
  const user = users.find((u) => u.userId === reservation.userId);

  // 3. Vérifier l'accès (propriétaire ou admin)
  if (auth.userId !== user?.clerkId && auth.sessionClaims?.roles !== "admin") {
    return NextResponse.json(
      { success: false, error: "Accès refusé" },
      { status: 403 }
    );
  }

  // 5. Récupérer les détails du parking spot via l'API
  let parkingSpot = null;
  try {
    const spotResponse = await fetch(
      `${request.nextUrl.origin}/api/parking-spots/${reservation.parkingSpotId}`
    );
    if (spotResponse.ok) {
      const spotData = await spotResponse.json();
      parkingSpot = spotData.success ? spotData.data : null;
    }
  } catch (error) {
    parkingSpot = null;
  }

  // 6. Vérification de la disponibilité (isAvailable)
  let isAvailable = null;
  if (parkingSpot && typeof parkingSpot.isAvailable === "boolean") {
    isAvailable = parkingSpot.isAvailable;
  }

  // 7. Réponse détaillée
  return NextResponse.json({
    success: true,
    data: {
      ...reservation,
      user,
      parkingSpot,
      isAvailable,
    },
  });
}

// Modifier le temps de réservation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const auth = getAuth(request);
  if (!auth.userId) {
    return NextResponse.json(
      { success: false, error: "Non authentifié" },
      { status: 401 }
    );
  }

  // 1. Chercher la réservation
  const reservation = reservations.find((r) => r.reservationId === id);
  if (!reservation) {
    return NextResponse.json(
      { error: "Réservation non trouvée" },
      { status: 404 }
    );
  }

  // 2. Chercher l'utilisateur
  const user = users.find((u) => u.userId === reservation.userId);
  // 3. Vérifier l'accès (propriétaire ou admin)
  if (auth.userId !== user?.clerkId && auth.sessionClaims?.roles !== "admin") {
    return NextResponse.json(
      { success: false, error: "Accès refusé" },
      { status: 403 }
    );
  }

  // 4. Vérifier si la réservation est déjà terminée
  const now = new Date();
  if (new Date(reservation.endDateTime) <= now) {
    return NextResponse.json(
      { error: "Impossible de modifier une réservation terminée." },
      { status: 400 }
    );
  }

  // 5. Récupérer la durée supplémentaire depuis le body
  const body = await request.json();
  const { extraMinutes } = body;
  if (typeof extraMinutes !== "number" || extraMinutes <= 0) {
    return NextResponse.json(
      { error: "Durée supplémentaire invalide" },
      { status: 400 }
    );
  }

  // 6. Calculer la durée totale en minutes
  const start = new Date(reservation.startDateTime);
  const end = new Date(reservation.endDateTime);
  const dureeActuelle = (end.getTime() - start.getTime()) / (1000 * 60);
  const dureeTotale = dureeActuelle + extraMinutes;

  if (dureeTotale > 15) {
    return NextResponse.json(
      { error: "Durée maximale dépassée (15 min)" },
      { status: 400 }
    );
  }

  // 7. Mettre à jour la dateHeureFin
  const newEnd = new Date(end.getTime() + extraMinutes * 60 * 1000);
  reservation.endDateTime = newEnd.toISOString();

  return NextResponse.json({ success: true, reservation });
}

// Supprimer une réservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const auth = getAuth(request);
  if (!auth.userId) {
    return NextResponse.json(
      { success: false, error: "Non authentifié" },
      { status: 401 }
    );
  }

  // 1. Chercher la réservation
  const reservation = reservations.find((r) => r.reservationId === id);
  if (!reservation) {
    return NextResponse.json(
      { error: "Réservation non trouvée" },
      { status: 404 }
    );
  }

  // 2. Vérifier que la réservation est active
  if (reservation.status !== "active") {
    return NextResponse.json(
      { error: "Seules les réservations actives peuvent être supprimées." },
      { status: 400 }
    );
  }

  // 3. Chercher l'utilisateur
  const user = users.find((u) => u.userId === reservation.userId);
  // 4. Vérifier l'accès (propriétaire ou admin)
  if (auth.userId !== user?.clerkId && auth.sessionClaims?.roles !== "admin") {
    return NextResponse.json(
      { success: false, error: "Accès refusé" },
      { status: 403 }
    );
  }

  // 5. Mettre à jour le parking spot (canReserve à true)
  const spot = parkingSpots.find(
    (p) => p.parkingSpotId === reservation.parkingSpotId
  );
  if (spot) {
    spot.canReserve = true;
  }

  // 6. Mettre à jour le statut de la réservation à cancelled
  reservation.status = "cancelled";

  // 7. Supprimer la réservation
  const index = reservations.findIndex((r) => r.reservationId === id);
  if (index !== -1) {
    reservations.splice(index, 1);
  }

  return NextResponse.json(
    { success: true, message: "Réservation annulée et supprimée avec succès" },
    { status: 200 }
  );
}
