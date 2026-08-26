import { NextRequest, NextResponse } from "next/server";

// Protected routes
const protectedRoutes = [
  "/dashboard",
  "/editor",
  "/admin",
];

export function proxy(
  request: NextRequest
) {

  const { pathname } =
    request.nextUrl;

  // Get auth cookie
  const token =
    request.cookies.get(
      "firebase-token"
    )?.value;

  // =========================
  // CHECK PROTECTED ROUTES
  // =========================
  const isProtectedRoute =
    protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

  // If not logged in and trying to access a protected route
  if (
    isProtectedRoute &&
    !token
  ) {

    const url = new URL("/login", request.url);
    
    // Store the attempted URL to redirect back after login
    url.searchParams.set("from", pathname);

    return NextResponse.redirect(url);
  }

  // Continue request
  return NextResponse.next();
}

// =========================
// MATCH ROUTES
// =========================
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/editor/:path*",
    "/admin/:path*",
    "/login",
  ],
};