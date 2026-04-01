import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { resolveApiKey } from "@/lib/api-keys";

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();
        const userId = request.cookies.get('user_id')?.value;

        if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

        const openaiKey = await resolveApiKey(userId, 'OPENAI_API_KEY');

        if (!openaiKey) {
            return NextResponse.json({ error: "No OpenAI API key available. Please configure your key in Settings → API Keys." }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey: openaiKey });

        // Call DALL-E 3
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        const imageUrl = response.data?.[0]?.url;

        if (!imageUrl) throw new Error("No image generated");

        // Save to AI History (DB)
        if (userId) {
            await prisma.aIArtifact.create({
                data: {
                    userId: userId,
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
