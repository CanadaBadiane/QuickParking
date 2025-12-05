import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/reservations/[id] - Récupérer une réservation par son ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { success: false, error: "ID de réservation manquant ou invalide" },
        { status: 400 }
      );
    }
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
    // Chercher la réservation en BDD
    const reservation = await prisma.reservation.findUnique({
      where: { reservationId: id },
    });
    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "Réservation non trouvée" },
        { status: 404 }
      );
    }
    // Vérifier l'accès (propriétaire ou admin)
    const requestingUser = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
    });
    if (
      !requestingUser ||
      (requestingUser.userId !== reservation.userId &&
        requestingUser.role !== "admin")
    ) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }
    // Mise à jour automatique du statut à 'completed' si la date de fin est dépassée
    const now = new Date();
    if (
      reservation.status === "active" &&
      reservation.endDateTime &&
      new Date(reservation.endDateTime) < now
    ) {
      await prisma.reservation.update({
        where: { reservationId: reservation.reservationId },
        data: { status: "completed" },
      });
      await prisma.parkingSpot.update({
        where: { parkingSpotId: reservation.parkingSpotId },
        data: { canReserve: true },
      });
      reservation.status = "completed";
    }
    return NextResponse.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la récupération de la réservation",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Modifier le temps de réservation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
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
    // Chercher la réservation en BDD
    const reservation = await prisma.reservation.findUnique({
      where: { reservationId: id },
    });
    if (!reservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }
    // Chercher l'utilisateur
    const requestingUser = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
    });
    if (
      !requestingUser ||
      (requestingUser.userId !== reservation.userId &&
        requestingUser.role !== "admin")
    ) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }
    // Mise à jour automatique du statut à 'completed' si la date de fin est dépassée
    const now = new Date();
    if (
      reservation.status === "active" &&
      reservation.endDateTime &&
      new Date(reservation.endDateTime) < now
    ) {
      await prisma.reservation.update({
        where: { reservationId: reservation.reservationId },
        data: { status: "completed" },
      });
      await prisma.parkingSpot.update({
        where: { parkingSpotId: reservation.parkingSpotId },
        data: { canReserve: true },
      });
      return NextResponse.json(
        { error: "Impossible de modifier une réservation terminée." },
        { status: 400 }
      );
    }
    // Récupérer la durée supplémentaire depuis le body
    const body = await request.json();
    // Annulation si body.cancel === true et réservation active
    if (body.cancel === true && reservation.status === "active") {
      const updated = await prisma.reservation.update({
        where: { reservationId: id },
        data: { status: "cancelled" },
      });
      await prisma.parkingSpot.update({
        where: { parkingSpotId: reservation.parkingSpotId },
        data: { canReserve: true },
      });
      return NextResponse.json({ success: true, reservation: updated });
    }
    const { extraMinutes } = body;
    if (typeof extraMinutes !== "number" || extraMinutes <= 0) {
      return NextResponse.json(
        { error: "Durée supplémentaire invalide" },
        { status: 400 }
      );
    }
    // Calculer la durée totale en minutes
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
    // Mettre à jour la dateHeureFin
    const newEnd = new Date(end.getTime() + extraMinutes * 60 * 1000);
    const updated = await prisma.reservation.update({
      where: { reservationId: id },
      data: { endDateTime: newEnd },
    });
    return NextResponse.json({ success: true, reservation: updated });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la modification de la réservation",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
