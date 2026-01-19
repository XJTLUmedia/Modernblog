
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { prompt, userId, context } = await request.json();

        if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "Server Configuration Error: Missing OpenAI Key" }, { status: 500 });
        }

        const systemPrompt = "You are a helpful AI assistant for a personal blog. Generate content in Markdown format.";
        const fullPrompt = context ? `Context:\n${context}\n\nTask: ${prompt}` : prompt;

        const response = await openai.chat.completions.create({
            model: "gpt-4o", // or gpt-4-turbo or gpt-3.5-turbo
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
                    userId,
                    type: 'text',
                    prompt, // Store original prompt, not full context to save space? Or full? Let's stick to prompt.
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
