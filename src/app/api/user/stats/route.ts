import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

// GET /api/user/stats - Get aggregated stats for the current user
export async function GET(request: NextRequest) {
    try {
        const userId = request.cookies.get('user_id')?.value

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Get comment count
        const commentCount = await db.comment.count({
            where: { authorId: userId }
        })

        // 2. Get reaction count
        const reactionCount = await db.reaction.count({
            where: { authorId: userId }
        })

        // 3. Get user join date for "Days Active"
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { createdAt: true }
        })

        const daysSinceJoined = user
            ? Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            : 0

        return NextResponse.json({
            comments: commentCount,
            likes: reactionCount,
            daysSinceJoined
        })
    } catch (error) {
        console.error('User stats error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
