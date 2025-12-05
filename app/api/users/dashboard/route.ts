import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/dashboard - Retourne tous les utilisateurs (admin uniquement via middleware)
export async function GET(request: NextRequest) {
  try {
    // Vérifie le token Clerk dans l'en-tête Authorization
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
    // Vérifie le rôle admin via la base de données
    const clerkId = payload.sub;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Accès réservé aux administrateurs" },
        { status: 403 }
      );
    }
    const allUsers = await prisma.user.findMany();
    return NextResponse.json({ success: true, data: allUsers });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la récupération des utilisateurs",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
