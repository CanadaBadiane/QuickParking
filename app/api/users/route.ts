import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@clerk/nextjs/server";

// POST /api/users - Crée un nouvel utilisateur (auth Clerk requise)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, confirmationPassword, clerkId } =
      body;
    if (!name || !email || !password || !confirmationPassword) {
      return NextResponse.json(
        { success: false, error: "Champs requis manquants" },
        { status: 400 }
      );
    }
    if (password !== confirmationPassword) {
      return NextResponse.json(
        { success: false, error: "Les mots de passe ne correspondent pas" },
        { status: 400 }
      );
    }
    const plainPassword = password;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Utilisateur déjà existant" },
        { status: 409 }
      );
    }

    // Si clerkId est fourni, il faut être admin (authentifié)
    let finalClerkId;
    if (clerkId) {
      // Auth obligatoire pour création admin
      const authHeader = request.headers.get("authorization");
      if (!authHeader) {
        return NextResponse.json(
          { success: false, error: "Non authentifié (admin requis)" },
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
          { success: false, error: "Token invalide (admin requis)" },
          { status: 401 }
        );
      }
      const currentUser = await prisma.user.findUnique({
        where: { clerkId: payload.sub },
      });
      if (!currentUser || currentUser.role !== "admin") {
        return NextResponse.json(
          {
            success: false,
            error:
              "Seul un admin peut créer un compte pour un autre utilisateur",
          },
          { status: 403 }
        );
      }
      finalClerkId = clerkId;
    } else {
      // Inscription libre, mais clerkId doit venir du token Clerk
      const authHeader = request.headers.get("authorization");
      if (!authHeader) {
        return NextResponse.json(
          { success: false, error: "Non authentifié (Clerk requis)" },
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
          { success: false, error: "Token invalide (Clerk requis)" },
          { status: 401 }
        );
      }
      finalClerkId = payload.sub;
    }

    // Crée le nouvel utilisateur dans la BDD, rôle toujours 'user'
    const newUser = await prisma.user.create({
      data: {
        clerkId: finalClerkId,
        name,
        email,
        phone,
        password: hashedPassword,
        confirmationPassword: hashedPassword,
        role: "user",
      },
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la création de l'utilisateur",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
