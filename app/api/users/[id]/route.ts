import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/[id] - Retourne un utilisateur par son id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Token manquant" },
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


    // Essaie de trouver l'utilisateur par userId ou clerkId, mais seulement s'il n'est pas supprimé
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { userId: id },
          { clerkId: id }
        ],
        deletedAt: null
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé ou supprimé" },
        { status: 404 }
      );
    }

    // Récupère l'utilisateur connecté pour vérifier ses permissions
    const connectedUser = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
    });

    // Vérifie si l'utilisateur connecté est le bon ou admin
    if (payload.sub !== user.clerkId && connectedUser?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la récupération de l'utilisateur",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Met à jour seulement les champs fournis d'un utilisateur
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Token manquant" },
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
    const user = await prisma.user.findFirst({ where: { userId: id, deletedAt: null } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé ou supprimé" },
        { status: 404 }
      );
    }

    // Récupère l'utilisateur connecté pour vérifier ses permissions
    const connectedUser = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
    });

    if (payload.sub !== user.clerkId && connectedUser?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }
    const body = await request.json();
    // Seul un admin peut modifier le champ 'role', et personne ne peut modifier userId ou clerkId
    let dataToUpdate = { ...body };

    const { userId, clerkId, ...rest } = dataToUpdate;
    dataToUpdate = rest;
    // Si le user connecté n'est pas admin, on ignore le champ 'role'
    if ("role" in dataToUpdate && connectedUser?.role !== "admin") {
      const { role, ...restNoRole } = dataToUpdate;
      dataToUpdate = restNoRole;
    }
    const updatedUser = await prisma.user.update({
      where: { userId: id },
      data: dataToUpdate,
    });
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la mise à jour de l'utilisateur",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Supprimer un utilisateur existant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Token manquant" },
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
    const user = await prisma.user.findFirst({ where: { userId: id, deletedAt: null } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé ou déjà supprimé" },
        { status: 404 }
      );
    }

    // Récupère l'utilisateur connecté pour vérifier ses permissions
    const connectedUser = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
    });

    if (payload.sub !== user.clerkId && connectedUser?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }
    await prisma.user.update({
      where: { userId: id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la suppression de l'utilisateur",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
