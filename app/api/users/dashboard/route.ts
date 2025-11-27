import { NextResponse } from "next/server";
import { users } from "@/lib/data";

// GET /api/users/dashboard - Retourne tous les utilisateurs
export async function GET() {
  return NextResponse.json({ success: true, data: users });
}
