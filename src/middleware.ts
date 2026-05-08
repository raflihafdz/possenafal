import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal middleware - just redirect unauthenticated users
// Real auth checks happen in layout/page components
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicRoutes = ["/login", "/api/auth", "/receipt"];
  const isPublic = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublic) {
    return NextResponse.next();
  }

  // For protected routes, auth happens in components
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude Next.js internals and all static files
    "/((?!_next|static|favicon.ico|public).*)",
  ],
};


