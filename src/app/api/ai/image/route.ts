import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { prompt, userId } = await request.json();

        if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "Server Configuration Error: Missing OpenAI Key" }, { status: 500 });
        }

        // Call DALL-E 3
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        const imageUrl = response.data[0].url;

        if (!imageUrl) throw new Error("No image generated");

        // Save to AI History (DB)
        if (userId) {
            await prisma.aiArtifact.create({
                data: {
                    userId,
                    type: 'image',
                    prompt,
                    content: imageUrl,
                    provider: 'openai',
                    metadata: JSON.stringify({ model: 'dall-e-3' })
                }
            });
        }

        return NextResponse.json({ url: imageUrl });
    } catch (error: any) {
        console.error("AI Image Gen Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
