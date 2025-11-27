import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/data";

// GET /api/users/[id] - Retourne un utilisateur par son id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const user = users.find((u) => u.idUser === id);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Utilisateur non trouvé" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, user });
}

// PATCH /api/users/[id] - Met à jour seulement les champs fournis d'un utilisateur
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();
  const userIndex = users.findIndex((u) => u.idUser === id);
  if (userIndex === -1) {
    return NextResponse.json(
      { success: false, error: "Utilisateur non trouvé" },
      { status: 404 }
    );
  }
  users[userIndex] = {
    ...users[userIndex],
    ...body,
    idUser: id,
    createdAt: users[userIndex].createdAt,
  };
  return NextResponse.json({ success: true, user: users[userIndex] });
}

// DELETE /api/users/[id] - Supprimer un utilisateur existant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const userIndex = users.findIndex((u) => u.idUser === id);
  if (userIndex === -1) {
    return NextResponse.json(
      { success: false, error: "Utilisateur non trouvé" },
      { status: 404 }
    );
  }
  users.splice(userIndex, 1);
  return NextResponse.json({ success: true });
}
