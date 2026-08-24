/* Diagnostic: reproduce Firestore "invalid nested entity" server rejection.
   Reads only field TYPES of real docs; writes+deletes throwaway test docs. */
require("dotenv").config({ path: ".env.local" });
const admin = require("firebase-admin");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
// Normalize escaped newlines and stray trailing backslashes
privateKey = privateKey
  .replace(/\r\n/g, "\n")
  .replace(/\\n/g, "\n")
  .replace(/\\\n/g, "\n")
  .replace(/\\+$/g, "")
  .trim();
if (!privateKey.endsWith("\n")) privateKey += "\n";

const crypto = require("crypto");
try {
  const s = crypto.createSign("RSA-SHA256");
  s.update("selftest");
  s.sign(privateKey, "base64");
  console.log("Private key OK (signed self-test)");
} catch (e) {
  console.error("Private key INVALID even after cleanup:", e.message.slice(0, 120));
  process.exit(1);
}

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing FIREBASE_* admin creds in .env.local");
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
const db = admin.firestore();

function describe(value, depth = 0) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  const t = Array.isArray(value) ? "array" : typeof value;
  if (t === "string") return `string(len=${value.length})`;
  if (t === "number" || t === "boolean") return t;
  if (value.constructor && value.constructor.name && !["Object", "Array"].includes(value.constructor.name))
    return `${t}<${value.constructor.name}>`;
  if (t === "array")
    return `array[len=${value.length}]{${value.slice(0, 3).map((v) => describe(v, depth + 1)).join(", ")}}`;
  if (depth > 3) return "object(...)";
  const keys = Object.keys(value).slice(0, 8);
  return `object{${keys.map((k) => `${k}:${describe(value[k], depth + 1)}`).join(", ")}}`;
}

async function tryWrite(label, data) {
  const ref = db.collection("designs").doc(`__diag_${label}_${Date.now()}`);
  try {
    await ref.set(data);
    console.log(`  [OK]      ${label}`);
    await ref.delete().catch(() => {});
  } catch (e) {
    console.log(`  [REJECTED] ${label}: code=${e.code} msg=${e.message}`);
  }
}

(async () => {
  // 1) Inspect real docs (types only)
  console.log("\n=== Existing design docs (field types only) ===");
  const snap = await db.collection("designs").limit(6).get();
  snap.forEach((d) => {
    console.log(`\nDoc ${d.id}:`);
    const data = d.data();
    for (const [k, v] of Object.entries(data)) {
      let extra = "";
      if (k === "pages" && Array.isArray(v) && v[0]) {
        const p = v[0];
        extra = ` | page0 keys: ${Object.keys(p).join(",")} | json:${describe(p.json)}`;
      }
      if ((k === "thumbnail" || k === "description") && typeof v === "string") extra = ` (len=${v.length})`;
      console.log(`  ${k}: ${describe(v)}${extra}`);
    }
  });

  // 2) Reproduce write variants
  console.log("\n=== Write tests on throwaway docs ===");
  const smallJson = JSON.stringify({ objects: [], background: "#ffffff" });
  const bigJson = "x".repeat(1_200_000); // ~1.2MB single string

  await tryWrite("full_small", {
    userId: "u", title: "t", description: "", thumbnail: "",
    pages: [{ id: "page-1", name: "Page 1", json: smallJson }],
    activePageId: "page-1", width: 1080, height: 1080,
    templateId: null, isPublic: false, downloads: 0, views: 0, likes: 0,
    tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null,
  });

  await tryWrite("no_tags_field", {
    userId: "u", title: "t", description: "", thumbnail: "",
    pages: [{ id: "page-1", name: "Page 1", json: smallJson }],
    activePageId: "page-1", width: 1080, height: 1080, deletedAt: null,
  });

  await tryWrite("big_json_1.2MB", {
    userId: "u", title: "t", pages: [{ id: "p1", name: "P", json: bigJson }],
    activePageId: "p1", width: 1080, height: 1080, tags: [],
  });

  await tryWrite("big_thumbnail_900KB", {
    userId: "u", title: "t", pages: [{ id: "p1", name: "P", json: smallJson }],
    thumbnail: "data:image/png;base64," + "A".repeat(900_000),
    activePageId: "p1", width: 1080, height: 1080, tags: [],
  });

  process.exit(0);
})();
