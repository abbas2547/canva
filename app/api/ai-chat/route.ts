import { NextResponse } from "next/server";
import { verifyPaymentUser } from "@/lib/payment-auth";
import { getAdminServices } from "@/lib/firebase-admin";
import { hasFeature, normalizeSubscriptionPlan } from "@/lib/subscription";

const SYSTEM_PROMPT = `You are Mini Canva AI, a professional graphic design assistant.
Give practical, concise advice about layouts, typography, colors, branding, image editing, and social media design.
The editor can add text and shapes, edit images with filters, manage layers, save designs, and export PNG, JPG, or PDF.
Do not claim unsupported features. If the user asks you to directly edit the canvas, explain that the editor command controls should be used.`;

interface OpenRouterResponse {
  model?: string;
  choices?: Array<{ message?: { content?: string } }>;
  usage?: unknown;
}

export async function POST(req: Request) {
  try {
    let firebaseUser;
    try {
      firebaseUser = await verifyPaymentUser(req);
    } catch {
      return NextResponse.json(
        { error: "Sign in and upgrade to Pro to use premium AI features.", code: "UPGRADE_REQUIRED", requiredPlan: "pro" },
        { status: 403 }
      );
    }

    const { adminDb } = getAdminServices();
    const userSnapshot = await adminDb.collection("users").doc(firebaseUser.uid).get();
    const plan = normalizeSubscriptionPlan(userSnapshot.data()?.subscriptionPlan);
    if (!hasFeature(plan, "premiumAIFeatures")) {
      return NextResponse.json(
        { error: "Premium AI features are available on the Pro plan.", code: "UPGRADE_REQUIRED", requiredPlan: "pro" },
        { status: 403 }
      );
    }

    const body = await req.json() as { message?: unknown; context?: unknown };
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "A message is required." }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
        "X-Title": "Mini Canva AI Design Assistant",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Editor context: ${String(body.context || "general")}\n\nUser request: ${message}` },
        ],
        temperature: 0.6,
        max_tokens: 700,
      }),
    });

    if (!response.ok) {
      console.error("OpenRouter API error:", response.status, await response.text());
      return NextResponse.json({ error: "The AI service could not answer right now." }, { status: 502 });
    }

    const data = await response.json() as OpenRouterResponse;
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json({ error: "The AI returned an empty response." }, { status: 502 });
    }

    return NextResponse.json({ reply, model: data.model, usage: data.usage });
  } catch (error) {
    console.error("AI Chat API error:", error);
    return NextResponse.json({ error: "We could not connect to the AI service." }, { status: 500 });
  }
}
