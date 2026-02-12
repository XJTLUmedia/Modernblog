import { NextRequest, NextResponse } from "next/server";
import { generateAIContent } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, context } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a "Neural Integration Validator".
Your goal is to evaluate a user's answer to a recall question based on the provided context.

Context:
${context?.slice(0, 2000) || "No context provided."}

Question: ${question}
User Answer: ${answer}

Instructions:
1. Compare the user's answer to the actual knowledge in the context.
2. Provide constructive, high-level feedback (2-3 sentences max).
3. Use a tone that is encouraging, scientific, and "engineering-focused".
4. Focus on whether they captured the core essence, even if the phrasing is different.
5. Mention a specific "Encoding Tip" if they missed something crucial.`;

    const feedback = await generateAIContent({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Provide the feedback." },
      ],
    });

    console.log("[verify] feedback type:", typeof feedback);
    console.log("[verify] feedback value:", feedback);

    const feedbackText =
      typeof feedback === "string" ? feedback.trim() : String(feedback ?? "").trim();

    return NextResponse.json({
      feedback:
        feedbackText ||
        "AI verification returned no feedback (see server logs).",
    });
  } catch (err: any) {
    console.error("[verify] AI call failed:", err?.stack || err);
    return NextResponse.json(
      { feedback: "AI verification failed (see server logs).", error: String(err) },
      { status: 500 }
    );
  }
}
