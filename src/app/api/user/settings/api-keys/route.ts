import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

const ALLOWED_KEYS = [
    'OPENAI_API_KEY',
    'GEMINI_API_KEY',
    'GOOGLE_API_KEY',
    'GOOGLE_CX',
    'REPLICATE_API_TOKEN',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
] as const;

export async function GET(request: NextRequest) {
    const user = await verifyAuth(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: { apiKeys: true }
    });

    if (userData?.apiKeys) {
        const parsed = JSON.parse(userData.apiKeys);
        // Return masked keys for display (only show last 4 chars)
        const masked: Record<string, string> = {};
        for (const key of ALLOWED_KEYS) {
            if (parsed[key]) {
                const val = parsed[key] as string;
                masked[key] = val.length > 4
                    ? '•'.repeat(val.length - 4) + val.slice(-4)
                    : '•'.repeat(val.length);
            } else {
                masked[key] = '';
            }
        }
        return NextResponse.json(masked);
    }

    // Return empty defaults
    const defaults: Record<string, string> = {};
    for (const key of ALLOWED_KEYS) {
        defaults[key] = '';
    }
    return NextResponse.json(defaults);
}

export async function PUT(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Load existing keys so partial updates merge properly
        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: { apiKeys: true }
        });
        const existing = userData?.apiKeys ? JSON.parse(userData.apiKeys) : {};

        // Only allow known keys, skip empty strings (treat as "no change")
        const updated: Record<string, string> = { ...existing };
        for (const key of ALLOWED_KEYS) {
            if (key in body) {
                const val = (body[key] as string).trim();
                if (val === '') {
                    // Empty means remove
                    delete updated[key];
                } else if (!val.startsWith('•')) {
                    // Only update if the value isn't the masked placeholder
                    updated[key] = val;
                }
                // If it starts with '•', it's the masked value sent back — skip
            }
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { apiKeys: JSON.stringify(updated) }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
