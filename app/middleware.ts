import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export function middleware(request: NextRequest) {
  const auth = getAuth(request);
  const isAdmin = auth.sessionClaims?.roles === "admin";

  // Restriction : seules les routes /dashboard sont accessibles aux admins
  const url = request.nextUrl.pathname;
  if (url.includes("dashboard") && !isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
