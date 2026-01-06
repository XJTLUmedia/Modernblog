import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await verifyAuth(req)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const postId = (await params).id
        const { emoji = '❤️' } = await req.json()

        const existing = await db.reaction.findFirst({
            where: {
                postId: postId,
                authorId: user.id,
                emoji: emoji
            }
        })

        if (existing) {
            await db.reaction.delete({
                where: { id: existing.id }
            })
            // Decrement count on post (optional, if you want to keep sync count fast)
            await db.post.update({
                where: { id: postId },
                data: { likeCount: { decrement: 1 } }
            })
            return NextResponse.json({ reacted: false })
        } else {
            await db.reaction.create({
                data: {
                    postId: postId,
                    authorId: user.id,
                    emoji: emoji
                }
            })
            await db.post.update({
                where: { id: postId },
                data: { likeCount: { increment: 1 } }
            })
            return NextResponse.json({ reacted: true })
        }

    } catch (error) {
        console.error('Reaction Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
