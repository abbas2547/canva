/* List real GCS buckets for the project + probe CORS on the right one. */
require("dotenv").config({ path: ".env.local" });
const { GoogleAuth } = require("google-auth-library");

let pk = process.env.FIREBASE_PRIVATE_KEY || "";
pk = pk.replace(/\r\n/g, "\n").replace(/\\n/g, "\n").replace(/\\\n/g, "\n").replace(/\\+$/g, "").trim();
if (!pk.endsWith("\n")) pk += "\n";

(async () => {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: pk,
    },
    scopes: ["https://www.googleapis.com/auth/devstorage.read_only", "https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const projectId = process.env.FIREBASE_PROJECT_ID;
  console.log("project:", projectId);

  const res = await client.request({
    url: `https://storage.googleapis.com/storage/v1/b?project=${projectId}&maxResults=20`,
  });
  const items = res.data.items || [];
  console.log("buckets found:");
  for (const b of items) {
    console.log(" -", b.id, "| location:", b.location, "| storageClass:", b.storageClass);
  }
  if (!items.length) console.log("  (none accessible with this service account)");
  process.exit(0);
})().catch((e) => {
  console.error("FAILED:", e.message.slice(0, 300));
  process.exit(1);
});
