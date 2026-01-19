import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const history = await prisma.aiArtifact.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json(history);
    } catch (error: any) {
        console.error("Fetch History Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
