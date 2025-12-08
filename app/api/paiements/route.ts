import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});
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
    const user = await prisma.user.findFirst({
      where: { clerkId: payload.sub, deletedAt: null },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé ou supprimé" },
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
    const user = await prisma.user.findFirst({
      where: { clerkId: payload.sub, deletedAt: null },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé ou supprimé" },
        { status: 403 }
      );
    }
    const isAdmin = user.role === "admin";
    const targetClerkId = isAdmin && body.clerkId ? body.clerkId : payload.sub;
    const targetUser = await prisma.user.findFirst({
      where: { clerkId: targetClerkId, deletedAt: null },
    });
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Utilisateur cible non trouvé ou supprimé" },
        { status: 403 }
      );
    }
    const { parkingSpotId, duration } = body;
    if (!parkingSpotId || !duration) {
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

    // Vérifier s'il existe un paiement en cours (non terminé) pour cette place
    const paiementEnCours = await prisma.paiement.findFirst({
      where: {
        parkingSpotId,
        status: "pending",
      },
      orderBy: { createdAt: "desc" },
    });
    if (paiementEnCours) {
      const now = Date.now();
      const createdAt = new Date(paiementEnCours.createdAt).getTime();
      // Si le paiement pending a plus de 10 minutes, on autorise un nouveau paiement
      if (now - createdAt < 600000) {
        return NextResponse.json(
          {
            success: false,
            error: "Paiement en cours pour cette place",
            message: "Impossible de payer tant qu'un paiement est actif.",
          },
          { status: 400 }
        );
      }
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

    // Vérifie si le user connecté a une réservation active pour cette place
    let activeReservation = await prisma.reservation.findFirst({
      where: {
        userId: user.userId,
        parkingSpotId,
        status: "active",
      },
    });
    // Si une réservation active existe, vérifier qu'elle n'est pas expirée
    if (activeReservation) {
      const now = new Date();
      const end = new Date(activeReservation.endDateTime);
      if (end < now) {
        // Expirée : on la passe à completed
        await prisma.reservation.update({
          where: { reservationId: activeReservation.reservationId },
          data: { status: "completed" },
        });
        activeReservation = null;
      }
    }
    // Si la place n'est pas dispo/canReserve, mais le user a une réservation active valide, on autorise
    if (!spot || !spot.isAvailable || !spot.canReserve) {
      if (!activeReservation) {
        return NextResponse.json(
          {
            success: false,
            error: "Place non disponible ou réservation expirée",
          },
          { status: 400 }
        );
      }
    }
    if (duration < 10) {
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
    const reservationId = activeReservation
      ? activeReservation.reservationId
      : undefined;
    const pricePerMinute = spot ? spot.pricePerHour / 60 : 0;
    const amount = Math.round(pricePerMinute * duration * 100) / 100;
    // Création du PaymentIntent Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe attend des centimes
      currency: "CAD",
      metadata: {
        clerkId: user.clerkId,
        parkingSpotId,
        reservationId: reservationId || "",
      },
      payment_method_types: ["card"],
    });

    // Création du paiement en BDD avec statut 'pending'
    const paiementData: any = {
      clerkId: user.clerkId,
      userId: user.userId,
      parkingSpotId,
      amount,
      duration,
      method: "card",
      status: "pending",
      createdAt: new Date(),
      stripePaymentIntentId: paymentIntent.id,
    };
    if (reservationId) {
      paiementData.reservationId = reservationId;
    }
    const paiement = await prisma.paiement.create({
      data: paiementData,
    });

    return NextResponse.json(
      {
        success: true,
        paiement,
        clientSecret: paymentIntent.client_secret,
        message: "PaymentIntent Stripe créé, prêt pour paiement côté client.",
      },
      { status: 201 }
    );
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
