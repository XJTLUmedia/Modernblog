import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { setAuthCookies } from "@/lib/cookies"; // Re-sign cookies if needed (optional)

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;
        const avatarUrl = data.get("avatarUrl") as string;
        const userId = data.get("userId") as string;

        // Handle URL update directly
        if (avatarUrl && userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { avatar: avatarUrl }
            });
            return NextResponse.json({ success: true, url: avatarUrl });
        }

        if (!file) {
            return NextResponse.json({ success: false, error: "No file or URL provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads dir exists
        const uploadsDir = join(process.cwd(), "public", "uploads");
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        // Create unique filename
        const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        const path = join(uploadsDir, filename);

        await writeFile(path, buffer);
        const url = `/uploads/${filename}`;

        // Update User Profile if userId is provided
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { avatar: url }
            });
        }

        return NextResponse.json({ success: true, url });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
