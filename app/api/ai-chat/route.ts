import { NextResponse } from "next/server";

// =====================================================
// AI CHAT API ENDPOINT - DESIGN ASSISTANT
// =====================================================

const SYSTEM_PROMPT = `You are an expert AI creative designer inside a Canva-style SaaS application.

Your responsibilities:
- Help users edit photos and designs
- Suggest modern color palettes and color combinations
- Suggest thumbnail ideas and design concepts
- Suggest typography combinations and font pairings
- Suggest branding and visual identity ideas
- Help with Instagram post design best practices
- Help with YouTube thumbnail optimization
- Give modern UI/UX design advice
- Analyze current designs and suggest improvements
- Provide design trends and suggestions
- Keep responses practical, actionable, and helpful
- Respond like a professional graphic designer with 10+ years experience
- Use emojis sparingly and professionally
- Provide specific recommendations with reasoning`;

export async function POST(req: Request) {
  try {
    const { message, context = "general" } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("Missing OPENROUTER_API_KEY");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
          "X-Title": "Mini Canva AI Design Assistant",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: `Context: ${context}\n\nUser message: ${message}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.9,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", errorData);
      
      return NextResponse.json(
        { error: "Failed to get AI response. Please try again." },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid API response format");
    }

    const aiResponse = data.choices[0].message.content;

    return NextResponse.json({
      reply: aiResponse,
      model: data.model,
      usage: data.usage,
    });
  } catch (error) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json(
      { reply: "Something went wrong with AI assistant." },
      { status: 500 }
    );
  }
}