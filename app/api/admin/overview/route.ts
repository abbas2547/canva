import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";
import { checkAdminAccess } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { adminAuth, adminDb } = getAdminServices();
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const verifiedUser = await adminAuth.verifyIdToken(token);
    if (!checkAdminAccess(verifiedUser.email)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const [activeUsersSnapshot, designsSnapshot, logsSnapshot, authUsers] =
      await Promise.all([
        adminDb.collection("activeUsers").get(),
        adminDb.collection("designs").get(),
        adminDb.collection("authLogs").orderBy("timestamp", "desc").limit(50).get(),
        adminAuth.listUsers(1000),
      ]);

    const activeUsers = activeUsersSnapshot.docs.map((userDoc) => {
      const data = userDoc.data();
      return {
        uid: userDoc.id,
        email: String(data.email || ""),
        displayName: String(data.displayName || ""),
        photoURL: String(data.photoURL || ""),
        lastSeen: String(data.lastSeen || ""),
      };
    });

    const logs = logsSnapshot.docs.map((logDoc) => {
      const data = logDoc.data();
      return {
        id: logDoc.id,
        email: String(data.email || ""),
        action: String(data.action || ""),
        timestamp: String(data.timestamp || ""),
      };
    });

    return NextResponse.json({
      activeUsers,
      logs,
      authUsers: authUsers.users.map((firebaseUser) => ({
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || "",
        lastSignInTime: firebaseUser.metadata.lastSignInTime || "",
        creationTime: firebaseUser.metadata.creationTime || "",
        disabled: firebaseUser.disabled,
      })),
      stats: {
        users: activeUsers.length,
        designs: designsSnapshot.docs.filter((designDoc) => !designDoc.data().deletedAt).length,
        logins: logs.filter((log) => log.action === "LOGIN").length,
      },
    });
  } catch (error) {
    console.error("Admin overview route error:", error);
    return NextResponse.json(
      {
        error: "Unable to load Firebase admin data",
        details:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { adminAuth, adminDb } = getAdminServices();
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";
    const logId = new URL(request.url).searchParams.get("deleteLog");

    if (!token || !logId) {
      return NextResponse.json({ error: "Authentication and log ID are required" }, { status: 400 });
    }

    const verifiedUser = await adminAuth.verifyIdToken(token);
    if (!checkAdminAccess(verifiedUser.email)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await adminDb.collection("authLogs").doc(logId).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin log deletion error:", error);
    return NextResponse.json(
      {
        error: "Unable to delete authentication log",
        details:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
