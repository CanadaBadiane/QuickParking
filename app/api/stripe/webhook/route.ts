import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(request: NextRequest) {
  console.log("[STRIPE WEBHOOK] Appel reçu à ", new Date().toISOString());
  const sig = request.headers.get("stripe-signature");
  const buf = await request.arrayBuffer();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Signature Stripe invalide",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 400 }
    );
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    // Retrouve le paiement en BDD
    const paiement = await prisma.paiement.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    if (paiement) {
      // Calcule startDateTime et endDateTime
      const startDateTime = new Date();
      const endDateTime = new Date(
        startDateTime.getTime() + (paiement.duration ?? 0) * 60000
      );
      // Met à jour le statut du paiement et les dates
      await prisma.paiement.update({
        where: { paiementId: paiement.paiementId },
        data: {
          status: "completed",
          startDateTime,
          endDateTime,
        },
      });
      // Met à jour la place de parking liée
      await prisma.parkingSpot.update({
        where: { parkingSpotId: paiement.parkingSpotId },
        data: { canReserve: false, isAvailable: false },
      });
      // Annule toute réservation active liée à ce parking
      await prisma.reservation.updateMany({
        where: {
          parkingSpotId: paiement.parkingSpotId,
          status: "active",
        },
        data: { status: "cancelled" },
      });
    }
  }

  // Gestion du paiement échoué
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const paiement = await prisma.paiement.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    if (paiement) {
      await prisma.paiement.update({
        where: { paiementId: paiement.paiementId },
        data: {
          status: "failed",
          startDateTime: null,
          endDateTime: null,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
