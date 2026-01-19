
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Correct type for Next.js 15+ dynamic routes if applicable, or standard
) {
    try {
        // In Next.js 15 params is a promise, but let's handle both for safety or standard
        // For now, assume standard Next.js 14- patterns or params is awaited if needed.
        // Actually, let's just use the standard pattern. If it errors, we fix.
        // Wait, the path is src/app/api/ai/artifact/[id]/route.ts

        const { id } = await params;

        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        // Build simple ownership check if we had auth middleware, but here we might trust the caller or check userId from body?
        // DELETE requests usually don't have body. We should verify cookies.
        const userId = request.cookies.get('user_id')?.value;
        const isAdmin = request.cookies.get('is_admin')?.value === 'true';

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const artifact = await prisma.aIArtifact.findUnique({
            where: { id }
        });

        if (!artifact) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Only allow owner or admin
        if (artifact.userId !== userId && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.aIArtifact.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Artifact Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
