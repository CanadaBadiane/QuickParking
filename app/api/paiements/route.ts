import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/paiements - Récupérer tous les paiements de l'utilisateur connecté
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
    const user = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 403 }
      );
    }
    const paiements = await prisma.paiement.findMany({
      where: { clerkId: payload.sub },
    });
    return NextResponse.json({ success: true, paiements });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la récupération des paiements",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST /api/paiements - Créer un nouveau paiement
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
    const body = await request.json();
    // Vérifie le rôle dans la BDD : si admin, peut créer pour un autre user via clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 403 }
      );
    }
    const isAdmin = user.role === "admin";
    const targetClerkId = isAdmin && body.clerkId ? body.clerkId : payload.sub;
    const targetUser = await prisma.user.findUnique({
      where: { clerkId: targetClerkId },
    });
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Utilisateur cible non trouvé" },
        { status: 403 }
      );
    }
    const { parkingSpotId, duration, method } = body;
    if (!parkingSpotId || !duration || !method) {
      return NextResponse.json(
        { success: false, error: "Champs requis manquants" },
        { status: 400 }
      );
    }
    let spot = await prisma.parkingSpot.findUnique({
      where: { parkingSpotId },
    });
    if (!spot) {
      return NextResponse.json(
        { success: false, error: "Place de stationnement introuvable" },
        { status: 404 }
      );
    }
    // Vérifie le dernier paiement sur cette place
    const lastPaiement = await prisma.paiement.findFirst({
      where: { parkingSpotId },
      orderBy: { createdAt: "desc" },
    });
    if (lastPaiement && !spot.isAvailable) {
      const endTime =
        new Date(lastPaiement.createdAt).getTime() +
        (lastPaiement.duration ?? 0) * 60000;
      if (Date.now() > endTime) {
        // Le paiement est expiré, on rend la place disponible
        await prisma.parkingSpot.update({
          where: { parkingSpotId },
          data: { isAvailable: true, canReserve: true },
        });
        spot = await prisma.parkingSpot.findUnique({
          where: { parkingSpotId },
        });
      }
    }

    // Vérifie la réservation active sur cette place si canReserve est false
    if (spot && !spot.canReserve) {
      const lastReservation = await prisma.reservation.findFirst({
        where: { parkingSpotId, status: "active" },
        orderBy: { endDateTime: "desc" },
      });
      if (lastReservation) {
        const endTime = new Date(lastReservation.endDateTime).getTime();
        if (Date.now() > endTime) {
          // La réservation est expirée, on rend la place réservable
          await prisma.parkingSpot.update({
            where: { parkingSpotId },
            data: { canReserve: true },
          });
          spot = await prisma.parkingSpot.findUnique({
            where: { parkingSpotId },
          });
        }
      }
    }
    if (!spot || !spot.isAvailable || !spot.canReserve) {
      return NextResponse.json(
        { success: false, error: "Place non disponible" },
        { status: 400 }
      );
    }
    if (duration < 5) {
      return NextResponse.json(
        { success: false, error: "Durée trop courte (min 5 min)" },
        { status: 400 }
      );
    }
    if (!spot || duration > spot.maxDuration) {
      return NextResponse.json(
        {
          success: false,
          error: `Durée trop longue (max ${spot ? spot.maxDuration : "?"} min)`,
        },
        { status: 400 }
      );
    }
    const activeReservation = await prisma.reservation.findFirst({
      where: {
        userId: user.userId,
        parkingSpotId,
        status: "active",
      },
    });
    const reservationId = activeReservation
      ? activeReservation.reservationId
      : undefined;
    const pricePerMinute = spot ? spot.pricePerHour / 60 : 0;
    const amount = Math.round(pricePerMinute * duration * 100) / 100;
    // Paiement simulé : succès ou échec
    const paymentSuccess = Math.random() > 0.2;
    const status = paymentSuccess ? "completed" : "failed";
    const paiementData: any = {
      clerkId: user.clerkId,
      parkingSpotId,
      amount,
      duration,
      method,
      status,
      createdAt: new Date(),
    };
    if (reservationId) {
      paiementData.reservationId = reservationId;
    }
    const paiement = await prisma.paiement.create({
      data: paiementData,
    });
    await prisma.parkingSpot.update({
      where: { parkingSpotId },
      data: { canReserve: false, isAvailable: false },
    });
    // Si une réservation active existe pour ce parkingSpotId, on la passe à cancelled
    await prisma.reservation.updateMany({
      where: {
        parkingSpotId,
        status: "active",
      },
      data: { status: "cancelled" },
    });
    return NextResponse.json({ success: true, paiement }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la création du paiement",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
