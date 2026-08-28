import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";
import { verifyPaymentUser } from "@/lib/payment-auth";
import { normalizeSubscriptionPlan } from "@/lib/subscription";
import { validateAIDesignSpec } from "@/lib/ai-design";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LIMITS = { free: 3, pro: 50, business: 200 } as const;

const SYSTEM_PROMPT = `You create editable Mini Canva designs. Return only valid JSON with this shape:
{"width":1080,"height":1080,"background":"#ffffff","elements":[{"type":"text","text":"...","x":100,"y":100,"width":800,"fontSize":64,"color":"#111827","fontFamily":"Arial","fontWeight":"bold","align":"center"},{"type":"rect","x":0,"y":0,"width":1080,"height":120,"color":"#4f46e5","opacity":1},{"type":"circle","x":100,"y":100,"width":200,"height":200,"color":"#f97316","opacity":1},{"type":"triangle","x":100,"y":100,"width":200,"height":200,"color":"#f97316","opacity":1},{"type":"line","x":100,"y":100,"x2":900,"y2":100,"color":"#111827","strokeWidth":4}]}
Use only text, rect, circle, triangle, and line. Use pixel coordinates, no images, no HTML, no SVG, no code, and no more than 25 elements.`;

function parseJSON(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try { return JSON.parse(cleaned); } catch { return null; }
}

export async function POST(request: Request) {
  let uid = "";
  try {
    const user = await verifyPaymentUser(request);
    uid = user.uid;
    const { adminDb } = getAdminServices();
    const userRef = adminDb.collection("users").doc(uid);
    const body = await request.json() as { prompt?: unknown; width?: unknown; height?: unknown };
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt || prompt.length > 1000) return NextResponse.json({ error: "A prompt between 1 and 1000 characters is required." }, { status: 400 });

    const reservation = await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(userRef);
      const data = snapshot.data() || {};
      const plan = normalizeSubscriptionPlan(data.subscriptionPlan);
      const used = Number(data.aiCreditsUsed) || 0;
      const limit = LIMITS[plan];
      if (used >= limit) return { allowed: false, plan, used, limit };
      transaction.set(userRef, { aiCreditsUsed: used + 1, aiCreditsLimit: limit, updatedAt: new Date().toISOString() }, { merge: true });
      return { allowed: true, plan, used: used + 1, limit };
    });
    if (!reservation.allowed) return NextResponse.json({ error: "You have reached your AI design limit. Upgrade your plan to continue.", code: "AI_LIMIT_REACHED", used: reservation.used, limit: reservation.limit }, { status: 403 });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("AI service is not configured.");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Create an editable design for: ${prompt}\nCanvas preference: ${String(body.width || "1080")}x${String(body.height || "1080")}` },
        ],
        temperature: 0.5,
        max_tokens: 1800,
        response_format: { type: "json_object" },
      }),
    });
    if (!response.ok) throw new Error(`AI provider returned ${response.status}.`);
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const spec = validateAIDesignSpec(parseJSON(data.choices?.[0]?.message?.content || ""));
    if (!spec) throw new Error("The AI returned an invalid design specification.");
    return NextResponse.json({ spec, usage: { used: reservation.used, limit: reservation.limit } });
  } catch (error) {
    console.error("AI design generation error:", error);
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    return NextResponse.json({ error: "Unable to generate an editable design right now." }, { status: 502 });
  }
}
