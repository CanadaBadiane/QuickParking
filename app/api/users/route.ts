import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/data";

// POST /api/users - Crée un nouvel utilisateur
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, phone, password } = body;
  if (!name || !email || !password) {
    return NextResponse.json(
      { success: false, error: "Champs requis manquants" },
      { status: 400 }
    );
  }
  const newUser = {
    idUser: `user-${Math.floor(Math.random() * 1000000)}`,
    name,
    email,
    phone,
    password,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  return NextResponse.json({ success: true, user: newUser }, { status: 201 });
}
