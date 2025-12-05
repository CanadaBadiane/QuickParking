import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/reservations/dashboard - Retourne toutes les réservations (admin uniquement via middleware)
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
    // Vérification du rôle admin en BDD
    const user = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
    });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Accès réservé aux administrateurs" },
        { status: 403 }
      );
    }
    // Retourne toutes les réservations
    const reservations = await prisma.reservation.findMany();
    return NextResponse.json({
      success: true,
      data: reservations,
      total: reservations.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la récupération des réservations",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
