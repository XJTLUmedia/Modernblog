import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const user = await verifyAuth(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: { privacySettings: true }
    });

    if (userData?.privacySettings) {
        return NextResponse.json(JSON.parse(userData.privacySettings));
    }

    // Defaults
    return NextResponse.json({
        profileVisibility: 'public',
        showActivity: true,
        allowIndexing: true
    });
}

export async function PUT(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        await prisma.user.update({
            where: { id: user.id },
            data: { privacySettings: JSON.stringify(body) }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
