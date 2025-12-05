import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/paiements/dashboard - Récupérer tous les paiements pour le dashboard admin
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
    // Vérifie que l'utilisateur existe dans la BDD
    const user = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 403 }
      );
    }
    // Récupère tous les paiements
    const paiements = await prisma.paiement.findMany();
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
