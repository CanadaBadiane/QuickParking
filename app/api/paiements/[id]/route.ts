import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/paiements/[id] - Retourne un paiement par son ID si c'est celui du user connecté ou un admin
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    // Vérifier que le user Clerk existe dans la BDD
    const user = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 403 }
      );
    }
    const { id } = params;
    const paiement = await prisma.paiement.findUnique({
      where: { paiementId: id },
    });
    if (!paiement) {
      return NextResponse.json(
        { success: false, error: "Paiement non trouvé" },
        { status: 404 }
      );
    }
    // Accès autorisé si propriétaire ou admin
    const isAdmin = user.role === "admin";
    if (paiement.clerkId !== payload.sub && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
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
      { status: 500 }
    );
  }
}
