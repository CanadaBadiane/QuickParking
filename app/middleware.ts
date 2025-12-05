import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

// Middleware Clerk d'abord
const baseMiddleware = clerkMiddleware();

export default function middleware(request: NextRequest, event: any) {
  // Middleware Clerk
  const clerkResult = baseMiddleware(request, event);
  if (clerkResult) return clerkResult;

  // Logique personnalisée
  const auth = getAuth(request);
  const isAdmin = auth.sessionClaims?.roles === "admin";
  const url = request.nextUrl.pathname;
  if (url.includes("dashboard") && !isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
