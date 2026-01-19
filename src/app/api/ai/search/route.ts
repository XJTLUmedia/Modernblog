import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

const customsearch = google.customsearch("v1");

export async function POST(request: NextRequest) {
    try {
        const { query, userId } = await request.json();

        if (!query) return NextResponse.json({ error: "Query is required" }, { status: 400 });

        if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_CX) {
            return NextResponse.json({ error: "Server Configuration Error: Missing Google Search Keys" }, { status: 500 });
        }

        const res = await customsearch.cse.list({
            cx: process.env.GOOGLE_CX,
            q: query,
            auth: process.env.GOOGLE_API_KEY,
            num: 5 // Top 5 results
        });

        const results = res.data.items?.map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet
        })) || [];

        const jsonResults = JSON.stringify(results);

        // Save to AI History
        if (userId) {
            await prisma.aiArtifact.create({
                data: {
                    userId,
                    type: 'search_result',
                    prompt: query,
                    content: jsonResults,
                    provider: 'google',
                }
            });
        }

        return NextResponse.json({ results });

    } catch (error: any) {
        console.error("Search Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
