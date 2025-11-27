import { NextResponse } from "next/server";
import { reservations } from "@/lib/data";

// GET /api/reservations/dashboard - Retourne toutes les réservations (admin/dashboard)
export async function GET() {
  return NextResponse.json({ success: true, data: reservations });
}
