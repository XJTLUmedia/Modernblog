import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const [postsCount, notesCount, projectsCount] = await Promise.all([
            prisma.post.count({ where: { published: true } }),
            prisma.gardenNote.count(),
            prisma.project.count({ where: { published: true } })
        ]);

        // Calculate total stats

        return NextResponse.json({
            posts: postsCount,
            notes: notesCount,
            projects: projectsCount,
            totalNodes: postsCount + notesCount + projectsCount
        });

    } catch (error: any) {
        console.error("Stats Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
