import { NextRequest, NextResponse } from "next/server";
import { reservations, users } from "@/lib/data";

// GET /api/reservations/[id] - Récupérer une réservation par son ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // 1. Chercher la réservation
  const reservation = reservations.find((r) => r.idReservation === id);
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
  const user = users.find((u) => u.idUser === reservation.userId);

  // 3. Récupérer les détails du parking spot via l'API
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

  // 4. Réponse détaillée
  return NextResponse.json({
    success: true,
    data: {
      ...reservation,
      user,
      parkingSpot,
    },
  });
}

// Modifier le temps de réservation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // 1. Chercher la réservation
  const reservation = reservations.find((r) => r.idReservation === id);
  if (!reservation) {
    return NextResponse.json(
      { error: "Réservation non trouvée" },
      { status: 404 }
    );
  }

  // 2. Récupérer la durée supplémentaire depuis le body
  const body = await request.json();
  const { extraMinutes } = body;
  if (typeof extraMinutes !== "number" || extraMinutes <= 0) {
    return NextResponse.json(
      { error: "Durée supplémentaire invalide" },
      { status: 400 }
    );
  }

  // 3. Calculer la durée totale en minutes
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

  // 4. Mettre à jour la dateHeureFin
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

  // 1. Chercher la réservation
  const reservation = reservations.find((r) => r.idReservation === id);
  if (!reservation) {
    return NextResponse.json(
      { error: "Réservation non trouvée" },
      { status: 404 }
    );
  }

  // 2. Trouver son index et le supprimer
  const index = reservations.findIndex((r) => r.idReservation === id);
  if (index !== -1) {
    reservations.splice(index, 1);
  }

  return NextResponse.json(
    { success: true, message: "Réservation supprimée avec succès" },
    { status: 200 }
  );
}
