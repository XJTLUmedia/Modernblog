import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { type, id } = await req.json()
        if (!type || !id) {
            return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
        }

        const whereClause = {
            userId: user.id,
            ...(type === 'post' ? { postId: id } :
                type === 'garden' ? { gardenNoteId: id } :
                    type === 'project' ? { projectId: id } : {})
        }

        // Check if already bookmarked
        const existing = await db.bookmark.findFirst({
            where: whereClause
        })

        if (existing) {
            // Remove bookmark
            await db.bookmark.delete({
                where: { id: existing.id }
            })
            return NextResponse.json({ bookmarked: false })
        } else {
            // Add bookmark
            await db.bookmark.create({
                data: whereClause
            })
            return NextResponse.json({ bookmarked: true })
        }

    } catch (error) {
        console.error('Bookmark Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const bookmarks = await db.bookmark.findMany({
            where: { userId: user.id },
            include: {
                post: { select: { title: true, slug: true } },
                gardenNote: { select: { title: true, slug: true } },
                project: { select: { title: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(bookmarks)
    } catch (error) {
        console.error('Get Bookmarks Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
