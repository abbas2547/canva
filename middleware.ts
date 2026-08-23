// middleware.ts

import { NextRequest, NextResponse } from "next/server";

// Protected routes
const protectedRoutes = [
  "/dashboard",
  "/editor",
  "/admin",
];

// Admin only routes
const adminRoutes = [
  "/admin",
];

export function middleware(
  request: NextRequest
) {

  const { pathname } =
    request.nextUrl;

  // Get auth cookie
  const token =
    request.cookies.get(
      "firebase-token"
    )?.value;

  const role =
    request.cookies.get(
      "user-role"
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

  // =========================
  // CHECK ADMIN ROUTES
  // =========================
  const isAdminRoute =
    adminRoutes.some((route) =>
      pathname.startsWith(route)
    );

  // If not admin
  if (
    isAdminRoute &&
    role !== "admin"
  ) {

    return NextResponse.redirect(
      new URL(
        "/dashboard",
        request.url
      )
    );
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