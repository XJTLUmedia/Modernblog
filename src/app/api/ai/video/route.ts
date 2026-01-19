import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
    try {
        const { prompt, userId } = await request.json();

        if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

        if (!process.env.REPLICATE_API_TOKEN) {
            // Fallback or Error
            return NextResponse.json({ error: "Server Configuration Error: Missing Replicate Token" }, { status: 500 });
        }

        // Using Zeroscope v2 XL which is text-to-video
        const videoOutput = await replicate.run(
            "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b830902c633d7b4d895f87195c632e06d9d85b1a3d35",
            {
                input: {
                    prompt: prompt,
                    num_frames: 24,
                    fps: 8,
                    width: 576,
                    height: 320
                }
            }
        );

        const videoUrl = Array.isArray(videoOutput) ? videoOutput[0] : videoOutput;

        // Save to AI History
        if (userId) {
            await prisma.aiArtifact.create({
                data: {
                    userId,
                    type: 'video',
                    prompt,
                    content: String(videoUrl),
                    provider: 'replicate',
                    metadata: JSON.stringify({ model: 'zeroscope-v2-xl' })
                }
            });
        }

        return NextResponse.json({ url: videoUrl });

    } catch (error: any) {
        console.error("AI Video Gen Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
