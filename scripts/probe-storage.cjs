/* Probe: does the Storage bucket accept uploads, and does it serve CORS
   headers the browser needs? Uses admin creds; cleans up test file. */
require("dotenv").config({ path: ".env.local" });
const admin = require("firebase-admin");

let pk = process.env.FIREBASE_PRIVATE_KEY || "";
pk = pk.replace(/\r\n/g, "\n").replace(/\\n/g, "\n").replace(/\\\n/g, "\n").replace(/\\+$/g, "").trim();
if (!pk.endsWith("\n")) pk += "\n";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: pk,
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

(async () => {
  const bucket = admin.storage().bucket();
  console.log("bucket:", bucket.name);

  const path = `__diag/cors-test-${Date.now()}.txt`;
  const t0 = Date.now();
  try {
    await bucket.file(path).save("hello", { contentType: "text/plain", resumable: false });
    console.log(`admin upload OK in ${Date.now() - t0}ms`);
  } catch (e) {
    console.error("admin upload FAILED:", e.message.slice(0, 160));
    process.exit(1);
  }

  const [url] = await bucket.file(path).getSignedUrl({ action: "read", expires: Date.now() + 3600_000 });
  const origin = "http://localhost:3000";

  // 1) Simple GET with Origin — check ACAO on downloads
  let res = await fetch(url, { headers: { Origin: origin } });
  console.log("GET status:", res.status);
  console.log("GET  access-control-allow-origin:", res.headers.get("access-control-allow-origin"));

  // 2) Preflight like fabric's crossOrigin=anonymous image load triggers
  const u = new URL(url);
  res = await fetch(url, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "GET",
    },
  });
  console.log("OPTIONS status:", res.status, "(preflight)");
  for (const h of ["access-control-allow-origin", "access-control-allow-methods", "access-control-max-age"]) {
    console.log(`OPTIONS ${h}:`, res.headers.get(h));
  }

  // 3) Firebase download endpoint (what getDownloadURL returns) — same CORS?
  const dl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media`;
  res = await fetch(dl, { headers: { Origin: origin } });
  console.log("\nfirebasestorage GET (no token) status:", res.status);
  console.log("firebasestorage GET ACAO:", res.headers.get("access-control-allow-origin"));
  res = await fetch(dl, { method: "OPTIONS", headers: { Origin: origin, "Access-Control-Request-Method": "GET" } });
  console.log("firebasestorage OPTIONS status:", res.status);
  console.log("firebasestorage OPTIONS ACAO:", res.headers.get("access-control-allow-origin"));

  await bucket.file(path).delete().catch(() => {});
  console.log("\ncleanup done");
  process.exit(0);
})();
