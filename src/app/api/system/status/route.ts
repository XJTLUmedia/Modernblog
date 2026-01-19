import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Simple query to check database connectivity
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json(
            { status: "operational", message: "All systems functional" },
            { status: 200 }
        );
    } catch (error) {
        console.error("System Status Check Failed:", error);
        return NextResponse.json(
            { status: "degraded", message: "Database connection failed" },
            { status: 500 }
        );
    }
}
