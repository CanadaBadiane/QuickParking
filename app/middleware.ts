import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Middleware Clerk d'abord
const baseMiddleware = clerkMiddleware();

export default async function middleware(request: NextRequest, event: any) {
  // Middleware Clerk
  const clerkResult = baseMiddleware(request, event);
  if (clerkResult) return clerkResult;

  // Logique personnalisée
  const auth = getAuth(request);
  const clerkId = auth.sessionClaims?.sub;
  if (!clerkId) {
    return NextResponse.redirect(new URL("/sign-up", request.url));
  }

  // Vérifie si l'utilisateur est soft supprimé
  // On ignore les routes API et statiques
  if (
    !request.nextUrl.pathname.startsWith("/api") &&
    !request.nextUrl.pathname.startsWith("/_next")
  ) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (user?.deletedAt) {
      return NextResponse.redirect(
        new URL("/inscription?error=deleted", request.url)
      );
    }
    // Logique admin dashboard
    const isAdmin = user?.role === "admin";
    const url = request.nextUrl.pathname;
    if (url.includes("dashboard") && !isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
