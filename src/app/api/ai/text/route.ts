
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { resolveApiKey } from "@/lib/api-keys";

export async function POST(request: NextRequest) {
    try {
        const { prompt, context } = await request.json();
        const userId = request.cookies.get('user_id')?.value;

        if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

        const openaiKey = await resolveApiKey(userId, 'OPENAI_API_KEY');

        if (!openaiKey) {
            return NextResponse.json({ error: "No OpenAI API key available. Please configure your key in Settings → API Keys." }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey: openaiKey });

        const systemPrompt = "You are a helpful AI assistant for a personal blog. Generate content in Markdown format.";
        const fullPrompt = context ? `Context:\n${context}\n\nTask: ${prompt}` : prompt;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: fullPrompt }
            ],
            temperature: 0.7,
        });

        const generatedText = response.choices[0].message.content || "";

        if (!generatedText) throw new Error("No text generated");

        // Save to AI History (DB)
        if (userId) {
            await prisma.aIArtifact.create({
                data: {
                    userId: userId,
                    type: 'text',
                    prompt,
                    content: generatedText,
                    provider: 'openai',
                    metadata: JSON.stringify({ model: 'gpt-4o' })
                }
            });
        }

        return NextResponse.json({ content: generatedText });
    } catch (error: any) {
        console.error("AI Text Gen Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
