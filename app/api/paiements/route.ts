import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { paiements, reservations, parkingSpots } from "@/lib/data";

// GET /api/paiements - Retourne uniquement les paiements du user connecté
export async function GET(request: NextRequest) {
  const auth = getAuth(request);
  if (!auth.userId) {
    return NextResponse.json(
      { success: false, error: "Non authentifié" },
      { status: 401 }
    );
  }

  // Retourne seulement les paiements du user connecté
  const userPaiements = paiements.filter((p) => p.clerkId === auth.userId);
  return NextResponse.json({ success: true, paiements: userPaiements });
}

// POST /api/paiements - Créer un paiement pour un stationnement
export async function POST(request: NextRequest) {
  const auth = getAuth(request);
  if (!auth.userId) {
    return NextResponse.json(
      { success: false, error: "Non authentifié" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { parkingSpotId, duration, method } = body;
  if (!parkingSpotId || !duration || !method) {
    return NextResponse.json(
      { success: false, error: "Champs requis manquants" },
      { status: 400 }
    );
  }

  // Vérifier la disponibilité du parking spot
  const spot = parkingSpots.find((p) => p.parkingSpotId === parkingSpotId);
  if (!spot) {
    return NextResponse.json(
      { success: false, error: "Place de stationnement introuvable" },
      { status: 404 }
    );
  }
  if (!spot.isAvailable || !spot.canReserve) {
    return NextResponse.json(
      { success: false, error: "Place non disponible" },
      { status: 400 }
    );
  }
  // Vérifier la durée minimale autorisée
  if (duration < 5) {
    return NextResponse.json(
      { success: false, error: "Durée trop courte (min 5 min)" },
      { status: 400 }
    );
  }
  // Vérifier la durée maximale autorisée
  if (duration > spot.maxDuration) {
    return NextResponse.json(
      {
        success: false,
        error: `Durée trop longue (max ${spot.maxDuration} min)`,
      },
      { status: 400 }
    );
  }

  // Lier automatiquement le paiement à la réservation active du user sur ce parking spot
  const activeReservation = reservations.find(
    (r) =>
      r.userId === auth.userId &&
      r.parkingSpotId === parkingSpotId &&
      r.status === "active"
  );
  const reservationId = activeReservation
    ? activeReservation.reservationId
    : undefined;

  // Calcul automatique du montant
  // Prix par minute = pricePerHour / 60
  const pricePerMinute = spot.pricePerHour / 60;
  const amount = Math.round(pricePerMinute * duration * 100) / 100; // arrondi à 2 décimales

  // Simulation du paiement (succès ou échec aléatoire)
  const paymentSuccess = Math.random() > 0.2; // 80% succès, 20% échec
  const status = paymentSuccess ? "completed" : "failed";

  // Création du paiement simulé
  const paiement = {
    paiementId: `pay_${Math.floor(Math.random() * 1000000)}`,
    clerkId: auth.userId,
    parkingSpotId,
    reservationId,
    amount,
    duration,
    method,
    status,
    createdAt: new Date().toISOString(),
  };
  paiements.push(paiement);

  // Mettre à jour la place comme non réservable et non disponible
  spot.canReserve = false;
  spot.isAvailable = false;

  return NextResponse.json({ success: true, paiement }, { status: 201 });
}
