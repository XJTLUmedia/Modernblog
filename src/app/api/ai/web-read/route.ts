import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { url, userId } = await request.json();

        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        // Fetch the HTML
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        if (!res.ok) throw new Error(`Failed to fetch URL: ${res.statusText}`);

        const html = await res.text();
        const $ = cheerio.load(html);

        // Extract main content (simplified)
        // Remove scripts, styles, navs, footers
        $('script, style, nav, footer, header, aside, .ad, .ads, .social-share').remove();

        let title = $('title').text() || $('h1').first().text();
        let content = $('article').text() || $('main').text() || $('body').text();

        // Clean up whitespace
        content = content.replace(/\s+/g, ' ').trim().slice(0, 20000);

        const summary = `**${title}**\n\n${content}`;

        // Save retrieval to history
        if (userId) {
            await prisma.aiArtifact.create({
                data: {
                    userId,
                    type: 'web_summary',
                    prompt: url,
                    content: summary,
                    provider: 'cheerio',
                    metadata: JSON.stringify({ title })
                }
            });
        }

        return NextResponse.json({ content: summary, title });

    } catch (error: any) {
        console.error("Web Read Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
