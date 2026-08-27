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
  return adminAuth.verifyIdToken(token);
}
