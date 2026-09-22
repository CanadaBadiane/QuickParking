import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// GET /api/paiements/[id] - Retourne un paiement par son ID si c'est celui du user connecté ou un admin
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 },
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
        { status: 401 },
      );
    }
    // Vérifier que le user Clerk existe dans la BDD
    const user = await prisma.user.findFirst({
      where: { clerkId: payload.sub, deletedAt: null },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé ou supprimé" },
        { status: 403 },
      );
    }
    const { id } = await params;
    const paiement = await prisma.paiement.findUnique({
      where: { paiementId: id },
      include: { parkingSpot: true },
    });
    if (!paiement) {
      return NextResponse.json(
        { success: false, error: "Paiement non trouvé" },
        { status: 404 },
      );
    }
    // Accès autorisé si propriétaire ou admin
    const isAdmin = user.role === "admin";
    if (paiement.userId !== user.userId && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 },
      );
    }
    return NextResponse.json({ success: true, paiement });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la récupération du paiement",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// PATCH /api/paiements/[id] - Ajouter du temps à un parking en cours payé
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { extraMinutes } = body;
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Token manquant" },
        { status: 401 },
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
        { status: 401 },
      );
    }
    // Chercher le paiement en BDD
    let paiement = await prisma.paiement.findUnique({
      where: { paiementId: id },
    });
    if (!paiement) {
      return NextResponse.json(
        { error: "Paiement non trouvé" },
        { status: 404 },
      );
    }
    if (paiement.parentPaiementId) {
      paiement = await prisma.paiement.findUnique({
        where: { paiementId: paiement.parentPaiementId },
      });
      if (!paiement) {
        return NextResponse.json(
          {
            error: "Paiement parent introuvable",
          },
          {
            status: 404,
          },
        );
      }
    }
    const user = await prisma.user.findFirst({
      where: { userId: paiement.userId, deletedAt: null },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé ou supprimé" },
        { status: 404 },
      );
    }

    // Récupère l'utilisateur connecté pour vérifier ses permissions
    const connectedUser = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
    });

    if (
      user.userId !== connectedUser?.userId &&
      connectedUser?.role !== "admin"
    ) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 },
      );
    }
    // Empêcher toute modification si la session du paiement n'est plus active
    const now = new Date();
    if (!paiement.endDateTime) {
      return NextResponse.json(
        { error: "Impossible de modifier un paiement non complété" },
        {
          status: 400,
        },
      );
    }
    if (paiement.endDateTime <= now) {
      return NextResponse.json(
        {
          error:
            "Impossible de modifier un paiement dont la session n'est plus active.",
        },
        { status: 400 },
      );
    }
    if (typeof extraMinutes !== "number" || extraMinutes < 10) {
      return NextResponse.json(
        { error: "Durée supplémentaire invalide" },
        { status: 400 },
      );
    }
    const parkingSpotLiked = await prisma.parkingSpot.findFirst({
      where: { parkingSpotId: paiement.parkingSpotId },
    });
    if (!parkingSpotLiked) {
      return NextResponse.json(
        { error: "Le parking correspondant est introuvable" },
        {
          status: 400,
        },
      );
    }
    if (extraMinutes + paiement.duration > parkingSpotLiked.maxDuration) {
      return NextResponse.json(
        {
          error: "La durée maximale de la session a été atteint",
        },
        {
          status: 400,
        },
      );
    }
    // Ajouter extraMinutes à duration dans la db pour le paiement original
    const pricePerMinute = parkingSpotLiked.pricePerHour / 60;
    const amount = Math.round(pricePerMinute * extraMinutes * 100) / 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "CAD",
      metadata: {
        userId: paiement.userId,
        parkingSpotId: paiement.parkingSpotId,
        parentPaiementId: paiement.paiementId,
      },
      payment_method_types: ["card"],
    });

    const paiementData: any = {
      userId: paiement.userId,
      parkingSpotId: paiement.parkingSpotId,
      parentPaiementId: paiement.paiementId,
      reservationId: paiement.reservationId,
      amount,
      duration: extraMinutes,
      method: "card",
      status: "pending",
      createdAt: new Date(),
      stripePaymentIntentId: paymentIntent.id,
    };
    paiement = await prisma.paiement.create({
      data: paiementData,
    });
    return NextResponse.json({
      success: true,
      paiement,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la modification du paiement",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
