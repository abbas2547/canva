/* Verify Cloudinary creds: signed upload of a tiny PNG, then delete it. */
require("dotenv").config({ path: ".env.local" });
const crypto = require("crypto");

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("Missing CLOUDINARY_* env vars");
  process.exit(1);
}

function sign(params) {
  const sorted = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  return crypto.createHash("sha1").update(sorted + apiSecret).digest("hex");
}

const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

(async () => {
  console.log("cloud:", cloudName[0] + "***" + cloudName.slice(-3));

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "mini-canva";
  const form = new FormData();
  form.append("file", new Blob([PNG_1PX], { type: "image/png" }), "test.png");
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", sign({ folder, timestamp }));

  const t0 = Date.now();
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();

  if (!res.ok || !data.secure_url) {
    console.error("UPLOAD FAILED:", JSON.stringify(data.error || data).slice(0, 300));
    process.exit(1);
  }
  console.log(`upload OK in ${Date.now() - t0}ms | ${data.width}x${data.height} | bytes=${data.bytes}`);
  console.log("url host:", new URL(data.secure_url).host);

  const ts2 = Math.round(Date.now() / 1000);
  const destroyForm = new FormData();
  destroyForm.append("api_key", apiKey);
  destroyForm.append("timestamp", String(ts2));
  destroyForm.append("public_id", data.public_id);
  destroyForm.append("signature", sign({ public_id: data.public_id, timestamp: ts2 }));
  const dres = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body: destroyForm,
  });
  const ddata = await dres.json();
  console.log("cleanup:", ddata.result || JSON.stringify(ddata));
  console.log("\nCLOUDINARY READY");
  process.exit(0);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
