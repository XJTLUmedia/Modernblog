import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

// GET /api/user/activity - Get recent activity for the current user
export async function GET(request: NextRequest) {
    try {
        const userId = request.cookies.get('user_id')?.value

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Fetch recent comments
        const comments = await db.comment.findMany({
            where: { authorId: userId },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                post: {
                    select: { title: true, slug: true }
                }
            }
        })

        // 2. Fetch recent reactions
        const reactions = await db.reaction.findMany({
            where: { authorId: userId },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                post: {
                    select: { title: true, slug: true }
                }
            }
        })

        // 3. Map to a unified activity format
        const activity = [
            ...comments.map(c => ({
                id: c.id,
                type: 'comment',
                title: 'Commented on',
                on: c.post?.title || 'a post',
                slug: c.post?.slug || '#',
                date: c.createdAt,
                content: c.content
            })),
            ...reactions.map(r => ({
                id: r.id,
                type: 'reaction',
                title: `Reacted with ${(r as any).emoji || (r as any).type || 'interaction'} on`,
                on: r.post?.title || 'a post',
                slug: r.post?.slug || '#',
                date: r.createdAt
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)

        return NextResponse.json(activity)
    } catch (error) {
        console.error('User activity error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
