import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/parking-spots - Retourne les places de stationnement payantes à Montréal
export async function GET() {
  try {
    const parkingSpots = await prisma.parkingSpot.findMany();
    return NextResponse.json({
      success: true,
      data: parkingSpots,
      meta: {
        total: parkingSpots.length,
        source: "Prisma database",
        retrievedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la récupération des places",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
