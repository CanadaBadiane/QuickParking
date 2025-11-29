import { NextRequest, NextResponse } from "next/server";
import { paiements } from "@/lib/data";

// GET /api/paiements/dashboard - Retourne tous les paiements (admin uniquement via middleware)
export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true, paiements });
}
