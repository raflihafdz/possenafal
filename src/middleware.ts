import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isLoginPage = nextUrl.pathname === "/login";
  const isReceiptPage = nextUrl.pathname.startsWith("/receipt/");
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = isLoginPage || isReceiptPage || isApiAuthRoute;

  // Allow public routes
  if (isPublicRoute) {
    // Redirect logged-in users away from login
    if (isLoginPage && isLoggedIn) {
      const role = req.auth?.user?.role;
      if (role === "CASHIER") {
        return NextResponse.redirect(new URL("/pos", nextUrl));
      }
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  const role = req.auth?.user?.role;

  // Cashier can only access /pos, /transactions, and /receipt
  if (role === "CASHIER") {
    const allowedPaths = ["/pos", "/transactions"];
    const isAllowed = allowedPaths.some((path) =>
      nextUrl.pathname.startsWith(path)
    );
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/pos", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|api/upload).*)"],
};
