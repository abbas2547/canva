import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";
import { checkAdminAccess } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { adminAuth } = getAdminServices();
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const verifiedUser = await adminAuth.verifyIdToken(token);
    if (!checkAdminAccess(verifiedUser.email)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const result = await adminAuth.listUsers(1000);
    const users = result.users.map((firebaseUser) => ({
      uid: firebaseUser.uid,
      email: firebaseUser.email || null,
      displayName: firebaseUser.displayName || null,
      disabled: firebaseUser.disabled,
      createdAt: firebaseUser.metadata.creationTime || null,
      lastSignInTime: firebaseUser.metadata.lastSignInTime || null,
    }));

    return NextResponse.json({ success: true, users });
  } catch (error: unknown) {
    console.error("FIREBASE ADMIN SDK FULL ERROR:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
