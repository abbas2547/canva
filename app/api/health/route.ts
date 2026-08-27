import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";

const HEALTHCHECK_TIMEOUT_MS = 4000;

function healthResponse(
  status: "healthy" | "unhealthy" | "maintenance",
  httpStatus: number
) {
  return NextResponse.json(
    { status },
    {
      status: httpStatus,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

export async function GET() {
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") {
    return healthResponse("maintenance", 503);
  }

  try {
    const { adminDb } = getAdminServices();
    const healthCheck = adminDb.listCollections();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error("Health check timed out")),
        HEALTHCHECK_TIMEOUT_MS
      );
    });

    try {
      await Promise.race([healthCheck, timeout]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    return healthResponse("healthy", 200);
  } catch (error) {
    console.error("Critical service health check failed:", error);
    return healthResponse("unhealthy", 503);
  }
}
