import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { paiements } from "@/lib/data";

// GET /api/paiements/[id] - Retourne un paiement par son ID si c'est celui du user connecté ou un admin
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getAuth(request);
  if (!auth.userId) {
    return NextResponse.json(
      { success: false, error: "Non authentifié" },
      { status: 401 }
    );
  }

  const { id } = params;
  const paiement = paiements.find((p) => p.paiementId === id);
  if (!paiement) {
    return NextResponse.json(
      { success: false, error: "Paiement non trouvé" },
      { status: 404 }
    );
  }

  // Accès autorisé si propriétaire ou admin
  const isAdmin = auth.sessionClaims?.roles === "admin";
  if (paiement.clerkId !== auth.userId && !isAdmin) {
    return NextResponse.json(
      { success: false, error: "Accès refusé" },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true, paiement });
}
