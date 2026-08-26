import admin from "firebase-admin";

function getPrivateKey(): string {
  return (process.env.FIREBASE_PRIVATE_KEY || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\\$/, "");
}

export function getAdminServices() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = getPrivateKey();

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Firebase Admin configuration is incomplete. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
      );
    }

    const serviceAccount: admin.ServiceAccount = {
      projectId,
      clientEmail,
      privateKey,
    };
    Object.assign(serviceAccount, {
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey,
    });

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return {
    adminAuth: admin.auth(),
    adminDb: admin.firestore(),
  };
}
