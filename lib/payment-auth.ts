import { getAdminServices } from "@/lib/firebase-admin";

export async function verifyPaymentUser(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!token) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }

  const { adminAuth } = getAdminServices();
  try {
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error("Firebase payment token verification failed:", {
      code:
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code)
          : undefined,
      message: error instanceof Error ? error.message : "Unknown token verification error",
      projectId: process.env.FIREBASE_PROJECT_ID || "missing",
    });
    throw error;
  }
}
