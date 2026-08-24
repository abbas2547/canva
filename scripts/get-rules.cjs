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
    scopes: ["https://www.googleapis.com/auth/cloud-platform", "https://www.googleapis.com/auth/firebase"],
  });
  const client = await auth.getClient();
  const project = process.env.FIREBASE_PROJECT_ID;

  try {
    const rel = await client.request({
      url: `https://firebaserules.googleapis.com/v1/projects/${project}/releases`,
    });
    for (const r of rel.data.releases || []) {
      console.log("ACTIVE release:", r.name, "->", r.rulesetName);
    }
  } catch (e) {
    console.log("releases lookup failed:", e.message.slice(0, 120));
  }

  const list = await client.request({
    url: `https://firebaserules.googleapis.com/v1/projects/${project}/rulesets?pageSize=5`,
  });
  const rulesets = list.data.rulesets || [];
  if (!rulesets.length) {
    console.log("No rulesets visible with this service account.");
    process.exit(0);
  }
  for (const rs of rulesets) {
    console.log("=== ruleset", rs.name, "created:", rs.createTime, "===");
    const full = await client.request({ url: `https://firebaserules.googleapis.com/v1/${rs.name}` });
    const files = full.data.source?.files || [];
    for (const f of files) {
      console.log(f.content);
      console.log("");
    }
  }
  process.exit(0);
})().catch((e) => {
  console.error("ERR:", e.message.slice(0, 300));
  process.exit(1);
});
